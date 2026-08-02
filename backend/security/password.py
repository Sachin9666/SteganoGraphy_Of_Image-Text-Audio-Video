import hashlib
import hmac


def hash_password(password: str, salt: str) -> str:
    return hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 200000).hex()


def verify_password(password: str, password_hash: str, salt: str) -> bool:
    return hmac.compare_digest(hash_password(password, salt), password_hash)
