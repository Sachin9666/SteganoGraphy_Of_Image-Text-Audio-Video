from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile, status

from backend.schemas.jobs import JobCreatedResponse
from backend.services.auth import get_current_user
from backend.services.job_service import create_encode_job
from backend.services.rate_limiter import rate_limiter
from backend.services.validation import validate_uploaded_file

router = APIRouter(tags=["encode"])


@router.post("/encode", response_model=JobCreatedResponse, status_code=status.HTTP_202_ACCEPTED)
async def create_encode_task(
    request: Request,
    modality: str = Form(...),
    cover_file: UploadFile = File(...),
    secret_file: UploadFile = File(...),
    embedding_type: str = Form("adaptive"),
    current_user: dict = Depends(get_current_user),
) -> JobCreatedResponse:
    rate_limiter.check(request.client.host if request.client else "anonymous")
    cover_meta = await validate_uploaded_file(cover_file, modality)
    secret_meta = await validate_uploaded_file(secret_file, "secret")

    if secret_meta.size_bytes > cover_meta.policy.max_secret_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Secret payload is too large for {modality}. "
                f"Maximum supported secret size is {cover_meta.policy.max_secret_bytes} bytes."
            ),
        )

    res = await create_encode_job(
        modality=modality,
        cover_file=cover_file,
        secret_file=secret_file,
        embedding_type=embedding_type,
        cover_meta=cover_meta,
        secret_meta=secret_meta,
        user_id=current_user["id"],
    )
    return JobCreatedResponse.model_validate(res)
