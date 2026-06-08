from pathlib import Path
from uuid import uuid4


def build_storage_path(root: Path, original_name: str) -> Path:
    suffix = Path(original_name).suffix
    return root / f"{uuid4().hex}{suffix}"
