import base64
import hashlib
import secrets
from dataclasses import dataclass

from cryptography.hazmat.primitives.ciphers.aead import AESGCM


def sha256_hex(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def generate_access_key() -> str:
    return base64.urlsafe_b64encode(secrets.token_bytes(32)).decode().rstrip("=")


def derive_file_signature(file_bytes: bytes) -> str:
    size = len(file_bytes)
    if size > 1 * 1024 * 1024:  # > 1 MB
        # Deterministically sample from the beginning, middle, and end, plus the file size
        sample = (
            file_bytes[:512 * 1024]
            + file_bytes[size // 2 : size // 2 + 256 * 1024]
            + file_bytes[-256 * 1024 :]
            + str(size).encode("utf-8")
        )
        return sha256_hex(sample)
    return sha256_hex(file_bytes)


def build_key_binding(access_key: str, file_signature: str) -> str:
    return sha256_hex(f"{access_key}:{file_signature}".encode("utf-8"))


@dataclass
class EncryptedPayload:
    nonce: bytes
    ciphertext: bytes


def encrypt_secret(secret_bytes: bytes, access_key: str, associated_data: bytes) -> EncryptedPayload:
    key = hashlib.sha256(access_key.encode("utf-8")).digest()
    aesgcm = AESGCM(key)
    nonce = secrets.token_bytes(12)
    ciphertext = aesgcm.encrypt(nonce, secret_bytes, associated_data)
    return EncryptedPayload(nonce=nonce, ciphertext=ciphertext)


def decrypt_secret(payload: EncryptedPayload, access_key: str, associated_data: bytes) -> bytes:
    key = hashlib.sha256(access_key.encode("utf-8")).digest()
    aesgcm = AESGCM(key)
    return aesgcm.decrypt(payload.nonce, payload.ciphertext, associated_data)
