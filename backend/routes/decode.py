from fastapi import APIRouter, Depends, File, Form, Request, UploadFile, status

from backend.schemas.jobs import JobCreatedResponse
from backend.services.auth import get_current_user
from backend.services.job_service import create_decode_job
from backend.services.rate_limiter import rate_limiter
from backend.services.validation import validate_uploaded_file

router = APIRouter(tags=["decode"])


@router.post("/decode", response_model=JobCreatedResponse, status_code=status.HTTP_202_ACCEPTED)
async def create_decode_task(
    request: Request,
    modality: str = Form(...),
    stego_file: UploadFile = File(...),
    access_key: str = Form(...),
    enhance: bool = Form(True),
    current_user: dict = Depends(get_current_user),
) -> JobCreatedResponse:
    rate_limiter.check(request.client.host if request.client else "anonymous")
    stego_meta = await validate_uploaded_file(stego_file, modality)
    res = await create_decode_job(
        modality=modality,
        stego_file=stego_file,
        access_key=access_key,
        enhance=enhance,
        stego_meta=stego_meta,
        user_id=current_user["id"],
    )
    return JobCreatedResponse.model_validate(res)
