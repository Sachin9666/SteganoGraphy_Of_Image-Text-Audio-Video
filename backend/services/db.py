import json
import sqlite3
from pathlib import Path

from backend.services.config import settings

DATABASE_PATH = settings.storage_root / "stegano_auth.db"
DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)

import threading

class ThreadLocalConn:
    def __init__(self):
        self._local = threading.local()

    @property
    def connection(self):
        if not hasattr(self._local, "conn"):
            c = sqlite3.connect(DATABASE_PATH, check_same_thread=False, timeout=30.0)
            c.row_factory = sqlite3.Row
            c.execute("PRAGMA journal_mode=WAL")
            self._local.conn = c
        return self._local.conn

    def cursor(self, *args, **kwargs):
        return self.connection.cursor(*args, **kwargs)

    def commit(self):
        return self.connection.commit()

    def rollback(self):
        return self.connection.rollback()

    def execute(self, *args, **kwargs):
        return self.connection.execute(*args, **kwargs)

    def executemany(self, *args, **kwargs):
        return self.connection.executemany(*args, **kwargs)

    def executescript(self, *args, **kwargs):
        return self.connection.executescript(*args, **kwargs)

conn = ThreadLocalConn()


def initialize_database() -> None:
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS jobs (
            job_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            job_type TEXT,
            modality TEXT,
            status TEXT,
            progress INTEGER,
            stage TEXT,
            message TEXT,
            input_path TEXT,
            secret_path TEXT,
            output_path TEXT,
            output_name TEXT,
            access_key TEXT,
            integrity_hash TEXT,
            metadata TEXT,
            device_info TEXT,
            created_at TEXT,
            updated_at TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
        """
    )
    cursor.execute("PRAGMA journal_mode=WAL")
    conn.commit()


initialize_database()
