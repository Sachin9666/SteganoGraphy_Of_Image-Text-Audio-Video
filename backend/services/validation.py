from dataclasses import dataclass
from pathlib import Path

from fastapi import HTTPException, UploadFile

from backend.services.config import FilePolicy, settings


@dataclass
class ValidatedUpload:
    filename: str
    size_bytes: int
    suffix: str
    content_type: str | None
    policy: FilePolicy


async def validate_uploaded_file(upload: UploadFile, modality: str) -> ValidatedUpload:
    if modality not in settings.policies:
        raise HTTPException(status_code=400, detail=f"Unsupported modality: {modality}")

    policy = settings.policies[modality]
    suffix = Path(upload.filename or "").suffix.lower()
    if suffix not in policy.allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file extension {suffix or '[missing]'} for {modality}",
        )

    content = await upload.read()
    size_bytes = len(content)
    await upload.seek(0)

    if size_bytes > policy.max_bytes:
        raise HTTPException(
            status_code=400,
            detail=(
                f"File exceeds size limit for {modality}. "
                f"Maximum is {policy.max_bytes // (1024 * 1024)} MB."
            ),
        )

    return ValidatedUpload(
        filename=upload.filename or "upload.bin",
        size_bytes=size_bytes,
        suffix=suffix,
        content_type=upload.content_type,
        policy=policy,
    )
