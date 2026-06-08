from dataclasses import dataclass, field
from typing import Optional


@dataclass
class JobRecord:
    job_id: str
    job_type: str
    modality: str
    status: str = "queued"
    progress: int = 0
    stage: str = "queued"
    message: str = "Queued for processing"
    input_path: Optional[str] = None
    secret_path: Optional[str] = None
    output_path: Optional[str] = None
    output_name: Optional[str] = None
    access_key: Optional[str] = None
    integrity_hash: Optional[str] = None
    device_info: Optional[dict] = None
    metadata: dict = field(default_factory=dict)

    def to_response(self) -> dict:
        return {
            "job_id": self.job_id,
            "status": self.status,
            "progress": self.progress,
            "stage": self.stage,
            "message": self.message,
            "artifact_url": f"/api/jobs/{self.job_id}/artifact" if self.output_path else None,
            "output_name": self.output_name,
            "access_key": self.access_key,
            "integrity_hash": self.integrity_hash,
            "device_info": self.device_info,
        }
