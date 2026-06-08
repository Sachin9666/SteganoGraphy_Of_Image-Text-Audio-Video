import asyncio
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from backend.security.crypto import (
    build_key_binding,
    decrypt_secret,
    derive_file_signature,
    encrypt_secret,
    generate_access_key,
    sha256_hex,
)
from backend.services.config import settings
from backend.services.job_models import JobRecord
from backend.services.media_packaging import build_container, split_container, stego_output_name
from backend.services.model_runtime import get_runtime_profile
from backend.services.queue_manager import queue_manager
from backend.services.storage import build_storage_path
from backend.services.validation import ValidatedUpload
from ml_models.inference import MultiModalInferenceService

jobs: dict[str, JobRecord] = {}
model_service = MultiModalInferenceService()


def get_job(job_id: str) -> JobRecord | None:
    return jobs.get(job_id)


async def _save_upload(upload: UploadFile, target: Path) -> bytes:
    content = await upload.read()
    target.write_bytes(content)
    await upload.seek(0)
    return content


async def create_encode_job(
    modality: str,
    cover_file: UploadFile,
    secret_file: UploadFile,
    embedding_type: str,
    cover_meta: ValidatedUpload,
    secret_meta: ValidatedUpload,
) -> dict:
    job_id = uuid4().hex
    input_path = build_storage_path(settings.uploads_dir, cover_meta.filename)
    secret_path = build_storage_path(settings.secret_dir, secret_meta.filename)
    cover_bytes = await _save_upload(cover_file, input_path)
    await _save_upload(secret_file, secret_path)

    record = JobRecord(
        job_id=job_id,
        job_type="encode",
        modality=modality,
        input_path=str(input_path),
        secret_path=str(secret_path),
        metadata={"embedding_type": embedding_type, "input_name": cover_meta.filename},
    )
    jobs[job_id] = record

    await queue_manager.enqueue(lambda: _run_encode_job(record, cover_bytes, cover_meta.filename, secret_meta.filename))
    return {
        "job_id": job_id,
        "status": "queued",
        "message": "Encoding job queued",
    }


async def create_decode_job(
    modality: str,
    stego_file: UploadFile,
    access_key: str,
    stego_meta: ValidatedUpload,
) -> dict:
    job_id = uuid4().hex
    input_path = build_storage_path(settings.uploads_dir, stego_meta.filename)
    stego_bytes = await _save_upload(stego_file, input_path)

    record = JobRecord(
        job_id=job_id,
        job_type="decode",
        modality=modality,
        input_path=str(input_path),
        access_key=access_key,
        metadata={"input_name": stego_meta.filename},
    )
    jobs[job_id] = record

    await queue_manager.enqueue(lambda: _run_decode_job(record, stego_bytes, stego_meta.filename))
    return {
        "job_id": job_id,
        "status": "queued",
        "message": "Decoding job queued",
    }


async def _run_encode_job(record: JobRecord, cover_bytes: bytes, cover_name: str, secret_name: str) -> None:
    try:
        runtime = get_runtime_profile()
        record.status = "running"
        record.progress = 10
        record.stage = "preparing"
        record.message = "Preparing tensors and runtime"
        record.device_info = runtime.__dict__
        await asyncio.sleep(0)

        secret_bytes = Path(record.secret_path).read_bytes()
        access_key = generate_access_key()
        record.progress = 30
        record.stage = "inference"
        record.message = "Running encoder model"

        processed_cover = await model_service.encode(record.modality, cover_bytes, secret_bytes, runtime)

        record.progress = 70
        record.stage = "securing"
        record.message = "Encrypting payload and binding key to file signature"
        associated_data = derive_file_signature(processed_cover).encode("utf-8")
        encrypted = encrypt_secret(secret_bytes, access_key, associated_data)
        container = build_container(
            cover_bytes=processed_cover,
            encrypted_payload=encrypted,
            access_key=access_key,
            modality=record.modality,
            secret_name=secret_name,
        )

        output_name = stego_output_name(record.job_id, cover_name, "encode")
        output_path = settings.outputs_dir / output_name
        output_path.write_bytes(container)

        record.status = "completed"
        record.progress = 100
        record.stage = "done"
        record.message = "Stego artifact ready"
        record.output_path = str(output_path)
        record.output_name = output_name
        record.access_key = access_key
        record.integrity_hash = sha256_hex(container)
    except Exception as exc:
        record.status = "failed"
        record.stage = "failed"
        record.message = str(exc)


async def _run_decode_job(record: JobRecord, stego_bytes: bytes, _stego_name: str) -> None:
    try:
        runtime = get_runtime_profile()
        record.status = "running"
        record.progress = 10
        record.stage = "validating"
        record.message = "Validating stego container"
        record.device_info = runtime.__dict__
        await asyncio.sleep(0)

        cover_bytes, metadata, encrypted_payload = split_container(stego_bytes)
        file_signature = derive_file_signature(cover_bytes)
        expected_binding = build_key_binding(record.access_key or "", file_signature)
        if metadata["key_binding"] != expected_binding:
            raise ValueError("Invalid key or tampered file detected")

        associated_data = file_signature.encode("utf-8")
        record.progress = 40
        record.stage = "decrypting"
        record.message = "Decrypting protected payload"
        secret_bytes = decrypt_secret(encrypted_payload, record.access_key or "", associated_data)

        record.progress = 70
        record.stage = "inference"
        record.message = "Running decoder model"
        revealed_bytes = await model_service.decode(record.modality, cover_bytes, secret_bytes, runtime)

        output_name = stego_output_name(record.job_id, metadata["secret_name"], "decode")
        output_path = settings.outputs_dir / output_name
        output_path.write_bytes(revealed_bytes)

        record.status = "completed"
        record.progress = 100
        record.stage = "done"
        record.message = "Hidden content extracted"
        record.output_path = str(output_path)
        record.output_name = output_name
        record.integrity_hash = sha256_hex(revealed_bytes)
    except Exception as exc:
        record.status = "failed"
        record.stage = "failed"
        record.message = str(exc)
