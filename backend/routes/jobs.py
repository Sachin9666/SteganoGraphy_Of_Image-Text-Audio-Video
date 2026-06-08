from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from backend.schemas.jobs import JobStatusResponse
from backend.services.job_service import get_job

router = APIRouter(tags=["jobs"])


@router.get("/jobs/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: str) -> JobStatusResponse:
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobStatusResponse.model_validate(job.to_response())


@router.get("/jobs/{job_id}/artifact")
async def download_artifact(job_id: str) -> FileResponse:
    job = get_job(job_id)
    if not job or not job.output_path:
        raise HTTPException(status_code=404, detail="Artifact not available")
    return FileResponse(path=job.output_path, filename=job.output_name)
