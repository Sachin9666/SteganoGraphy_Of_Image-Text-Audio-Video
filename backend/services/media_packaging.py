import json
import struct
from pathlib import Path

from backend.security.crypto import EncryptedPayload, build_key_binding, derive_file_signature, sha256_hex

MAGIC = b"STEGOV1\0"


def build_container(
    cover_bytes: bytes,
    encrypted_payload: EncryptedPayload,
    access_key: str,
    modality: str,
    secret_name: str,
) -> bytes:
    file_signature = derive_file_signature(cover_bytes)
    key_binding = build_key_binding(access_key, file_signature)
    metadata = {
        "modality": modality,
        "secret_name": secret_name,
        "cover_signature": file_signature,
        "key_binding": key_binding,
        "nonce_b64": encrypted_payload.nonce.hex(),
        "ciphertext_sha256": sha256_hex(encrypted_payload.ciphertext),
    }
    metadata_bytes = json.dumps(metadata).encode("utf-8")
    return (
        cover_bytes
        + MAGIC
        + struct.pack(">I", len(metadata_bytes))
        + metadata_bytes
        + encrypted_payload.ciphertext
    )


def split_container(stego_bytes: bytes) -> tuple[bytes, dict, EncryptedPayload]:
    marker_index = stego_bytes.rfind(MAGIC)
    if marker_index == -1:
        raise ValueError("Stego payload marker not found")

    cover_bytes = stego_bytes[:marker_index]
    meta_length_start = marker_index + len(MAGIC)
    meta_length = struct.unpack(">I", stego_bytes[meta_length_start : meta_length_start + 4])[0]
    meta_start = meta_length_start + 4
    meta_end = meta_start + meta_length
    metadata = json.loads(stego_bytes[meta_start:meta_end].decode("utf-8"))
    ciphertext = stego_bytes[meta_end:]
    payload = EncryptedPayload(nonce=bytes.fromhex(metadata["nonce_b64"]), ciphertext=ciphertext)
    return cover_bytes, metadata, payload


def stego_output_name(job_id: str, input_name: str, job_type: str) -> str:
    suffix = Path(input_name).suffix
    prefix = "stego" if job_type == "encode" else "revealed"
    return f"{prefix}-{job_id}{suffix}"
