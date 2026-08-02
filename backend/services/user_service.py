import sqlite3
import uuid
from datetime import datetime
from typing import Optional

from backend.security.password import hash_password
from backend.services.db import conn


def _row_to_user(row: sqlite3.Row) -> Optional[dict]:
    if not row:
        return None
    return {
        "id": row["id"],
        "email": row["email"],
        "created_at": row["created_at"],
    }


def create_user(email: str, password: str) -> dict:
    salt = uuid.uuid4().hex
    password_hash = hash_password(password, salt)
    user_id = uuid.uuid4().hex
    created_at = datetime.utcnow().isoformat()

    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (id, email, password_hash, salt, created_at) VALUES (?, ?, ?, ?, ?)",
            (user_id, email.lower().strip(), password_hash, salt, created_at),
        )
        conn.commit()
    except sqlite3.IntegrityError as exc:
        raise ValueError("A user with that email already exists") from exc

    return {"id": user_id, "email": email.lower().strip(), "created_at": created_at}


def get_user_by_email(email: str) -> Optional[dict]:
    cursor = conn.cursor()
    row = cursor.execute("SELECT * FROM users WHERE email = ?", (email.lower().strip(),)).fetchone()
    return _row_to_user(row)


def get_user_by_id(user_id: str) -> Optional[dict]:
    cursor = conn.cursor()
    row = cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    return _row_to_user(row)


def authenticate_user(email: str, password: str) -> Optional[dict]:
    cursor = conn.cursor()
    row = cursor.execute("SELECT * FROM users WHERE email = ?", (email.lower().strip(),)).fetchone()
    if not row:
        return None

    salt = row["salt"]
    password_hash = row["password_hash"]
    if hash_password(password, salt) != password_hash:
        return None

    return _row_to_user(row)
