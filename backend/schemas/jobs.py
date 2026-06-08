from typing import Literal, Optional

from pydantic import BaseModel, Field


class JobCreatedResponse(BaseModel):
    job_id: str
    status: Literal["queued"]
    message: str


class DeviceInfo(BaseModel):
    device: str
    mixed_precision: bool
    warning: Optional[str] = None


class JobStatusResponse(BaseModel):
    job_id: str
    status: Literal["queued", "running", "completed", "failed"]
    progress: int = Field(ge=0, le=100)
    stage: str
    message: str
    artifact_url: Optional[str] = None
    output_name: Optional[str] = None
    access_key: Optional[str] = None
    integrity_hash: Optional[str] = None
    device_info: Optional[DeviceInfo] = None
