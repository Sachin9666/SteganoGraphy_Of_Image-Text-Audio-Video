import asyncio
import json
from datetime import datetime, timezone
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
from backend.services.db import conn
from backend.services.job_models import JobRecord
from backend.services.media_packaging import build_container, split_container, stego_output_name
from backend.services.model_runtime import get_runtime_profile
from backend.services.queue_manager import queue_manager
from backend.services.storage import build_storage_path
from backend.services.validation import ValidatedUpload
from ml_models.inference import MultiModalInferenceService
from backend.services.quality_enhancement import enhance_media

jobs: dict[str, JobRecord] = {}
model_service = MultiModalInferenceService()


def get_job(job_id: str) -> JobRecord | None:
    record = jobs.get(job_id)
    if record:
        return record

    cursor = conn.cursor()
    row = cursor.execute("SELECT * FROM jobs WHERE job_id = ?", (job_id,)).fetchone()
    if not row:
        return None

    record = JobRecord(
        job_id=row["job_id"],
        job_type=row["job_type"],
        modality=row["modality"],
        user_id=row["user_id"],
        status=row["status"],
        progress=row["progress"],
        stage=row["stage"],
        message=row["message"],
        input_path=row["input_path"],
        secret_path=row["secret_path"],
        output_path=row["output_path"],
        output_name=row["output_name"],
        access_key=row["access_key"],
        integrity_hash=row["integrity_hash"],
        device_info=json.loads(row["device_info"]) if row["device_info"] else None,
        metadata=json.loads(row["metadata"]) if row["metadata"] else {},
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )
    jobs[job_id] = record
    return record


def get_user_job_records(user_id: str) -> list[JobRecord]:
    cursor = conn.cursor()
    rows = cursor.execute("SELECT * FROM jobs WHERE user_id = ? ORDER BY updated_at DESC", (user_id,)).fetchall()
    records: list[JobRecord] = []
    for row in rows:
        records.append(
            JobRecord(
                job_id=row["job_id"],
                job_type=row["job_type"],
                modality=row["modality"],
                user_id=row["user_id"],
                status=row["status"],
                progress=row["progress"],
                stage=row["stage"],
                message=row["message"],
                input_path=row["input_path"],
                secret_path=row["secret_path"],
                output_path=row["output_path"],
                output_name=row["output_name"],
                access_key=row["access_key"],
                integrity_hash=row["integrity_hash"],
                device_info=json.loads(row["device_info"]) if row["device_info"] else None,
                metadata=json.loads(row["metadata"]) if row["metadata"] else {},
                created_at=row["created_at"],
                updated_at=row["updated_at"],
            )
        )
    return records


async def _save_upload(upload: UploadFile, target: Path) -> bytes:
    content = await upload.read()
    target.write_bytes(content)
    await upload.seek(0)
    return content


def _persist_job_record(record: JobRecord) -> None:
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    if record.created_at is None:
        record.created_at = now
    record.updated_at = now
    cursor.execute(
        "INSERT OR REPLACE INTO jobs (job_id, user_id, job_type, modality, status, progress, stage, message, input_path, secret_path, output_path, output_name, access_key, integrity_hash, metadata, device_info, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (
            record.job_id,
            record.user_id,
            record.job_type,
            record.modality,
            record.status,
            record.progress,
            record.stage,
            record.message,
            record.input_path,
            record.secret_path,
            record.output_path,
            record.output_name,
            record.access_key,
            record.integrity_hash,
            json.dumps(record.metadata),
            json.dumps(record.device_info) if record.device_info else None,
            record.created_at,
            record.updated_at,
        ),
    )
    conn.commit()


def _store_job_record(record: JobRecord) -> None:
    jobs[record.job_id] = record
    _persist_job_record(record)


async def create_encode_job(
    modality: str,
    cover_file: UploadFile,
    secret_file: UploadFile,
    embedding_type: str,
    cover_meta: ValidatedUpload,
    secret_meta: ValidatedUpload,
    user_id: str,
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
        user_id=user_id,
        input_path=str(input_path),
        secret_path=str(secret_path),
        metadata={"embedding_type": embedding_type, "input_name": cover_meta.filename},
    )
    _store_job_record(record)

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
    enhance: bool,
    stego_meta: ValidatedUpload,
    user_id: str,
) -> dict:
    job_id = uuid4().hex
    input_path = build_storage_path(settings.uploads_dir, stego_meta.filename)
    stego_bytes = await _save_upload(stego_file, input_path)

    record = JobRecord(
        job_id=job_id,
        job_type="decode",
        modality=modality,
        user_id=user_id,
        input_path=str(input_path),
        access_key=access_key,
        metadata={"input_name": stego_meta.filename, "enhance": enhance},
    )
    _store_job_record(record)

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
        _store_job_record(record)
        await asyncio.sleep(0)

        if record.secret_path is None:
            raise ValueError("Secret path is not defined")
        secret_bytes = await asyncio.to_thread(Path(record.secret_path).read_bytes)
        access_key = generate_access_key()
        record.progress = 30
        record.stage = "inference"
        record.message = "Running encoder model"
        _store_job_record(record)

        embedding_type = record.metadata.get("embedding_type", "adaptive")
        processed_cover = await model_service.encode(record.modality, cover_bytes, secret_bytes, runtime, embedding_type)

        record.progress = 70
        record.stage = "securing"
        record.message = "Encrypting payload and binding key to file signature"
        _store_job_record(record)

        associated_data = (await asyncio.to_thread(derive_file_signature, processed_cover)).encode("utf-8")
        encrypted = await asyncio.to_thread(encrypt_secret, secret_bytes, access_key, associated_data)
        container = await asyncio.to_thread(
            build_container,
            cover_bytes=processed_cover,
            encrypted_payload=encrypted,
            access_key=access_key,
            modality=record.modality,
            secret_name=secret_name,
        )

        output_name = stego_output_name(record.job_id, cover_name, "encode")
        output_path = settings.outputs_dir / output_name
        await asyncio.to_thread(output_path.write_bytes, container)

        record.status = "completed"
        record.progress = 100
        record.stage = "done"
        record.message = "Stego artifact ready"
        record.output_path = str(output_path)
        record.output_name = output_name
        record.access_key = access_key
        record.integrity_hash = await asyncio.to_thread(sha256_hex, container)
        _store_job_record(record)
    except Exception as exc:
        record.status = "failed"
        record.stage = "failed"
        record.message = str(exc)
        _store_job_record(record)


async def _run_decode_job(record: JobRecord, stego_bytes: bytes, _stego_name: str) -> None:
    try:
        runtime = get_runtime_profile()
        record.status = "running"
        record.progress = 10
        record.stage = "validating"
        record.message = "Validating stego container"
        record.device_info = runtime.__dict__
        _store_job_record(record)
        await asyncio.sleep(0)

        cover_bytes, metadata, encrypted_payload = await asyncio.to_thread(split_container, stego_bytes)
        file_signature = await asyncio.to_thread(derive_file_signature, cover_bytes)
        expected_binding = build_key_binding(record.access_key or "", file_signature)
        if metadata["key_binding"] != expected_binding:
            raise ValueError("Invalid key or tampered file detected")

        associated_data = file_signature.encode("utf-8")
        record.progress = 40
        record.stage = "decrypting"
        record.message = "Decrypting protected payload"
        _store_job_record(record)
        secret_bytes = await asyncio.to_thread(decrypt_secret, encrypted_payload, record.access_key or "", associated_data)

        record.progress = 70
        record.stage = "inference"
        record.message = "Running decoder model"
        _store_job_record(record)
        revealed_bytes = await model_service.decode(record.modality, cover_bytes, secret_bytes, runtime)

        output_name = stego_output_name(record.job_id, metadata["secret_name"], "decode")
        output_path = settings.outputs_dir / output_name
        await asyncio.to_thread(output_path.write_bytes, revealed_bytes)

        # Enhance quality of decoded image/video
        enhance = record.metadata.get("enhance", True)
        if enhance:
            record.progress = 85
            record.stage = "enhancing"
            record.message = "Enhancing decoded image/video quality"
            _store_job_record(record)
            await asyncio.to_thread(enhance_media, output_path)

        enhanced_bytes = await asyncio.to_thread(output_path.read_bytes)

        record.status = "completed"
        record.progress = 100
        record.stage = "done"
        record.message = "Hidden content extracted"
        record.output_path = str(output_path)
        record.output_name = output_name
        record.integrity_hash = await asyncio.to_thread(sha256_hex, enhanced_bytes)
        _store_job_record(record)
    except Exception as exc:
        record.status = "failed"
        record.stage = "failed"
        record.message = str(exc)
        _store_job_record(record)
