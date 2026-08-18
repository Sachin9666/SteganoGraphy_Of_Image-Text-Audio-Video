from pathlib import Path

from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent


class FilePolicy(BaseModel):
    max_bytes: int
    max_secret_bytes: int
    allowed_extensions: set[str]


class Settings(BaseModel):
    storage_root: Path = BASE_DIR / "runtime"
    uploads_dir: Path = BASE_DIR / "runtime" / "uploads"
    outputs_dir: Path = BASE_DIR / "runtime" / "outputs"
    secret_dir: Path = BASE_DIR / "runtime" / "secrets"
    queue_workers: int = 2
    rate_limit_per_minute: int = 10
    policies: dict[str, FilePolicy] = {
        "image": FilePolicy(
            max_bytes=100 * 1024 * 1024,
            max_secret_bytes=100 * 1024 * 1024,
            allowed_extensions={".png", ".jpg", ".jpeg", ".bmp", ".webp"},
        ),
        "audio": FilePolicy(
            max_bytes=100 * 1024 * 1024,
            max_secret_bytes=100 * 1024 * 1024,
            allowed_extensions={".wav", ".mp3", ".flac", ".ogg"},
        ),
        "video": FilePolicy(
            max_bytes=100 * 1024 * 1024,
            max_secret_bytes=100 * 1024 * 1024,
            allowed_extensions={".mp4", ".mov", ".avi", ".mkv"},
        ),
        "text": FilePolicy(
            max_bytes=100 * 1024 * 1024,
            max_secret_bytes=100 * 1024 * 1024,
            allowed_extensions={".txt", ".md", ".json"},
        ),
        "secret": FilePolicy(
            max_bytes=100 * 1024 * 1024,
            max_secret_bytes=100 * 1024 * 1024,
            allowed_extensions={".txt", ".json", ".bin", ".png", ".jpg", ".wav"},
        ),
    }


settings = Settings()

for directory in (
    settings.storage_root,
    settings.uploads_dir,
    settings.outputs_dir,
    settings.secret_dir,
):
    directory.mkdir(parents=True, exist_ok=True)
