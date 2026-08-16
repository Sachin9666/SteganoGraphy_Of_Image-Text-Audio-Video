from dataclasses import dataclass, field
from typing import Optional


@dataclass
class JobRecord:
    job_id: str
    job_type: str
    modality: str
    user_id: Optional[str] = None
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
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    def to_response(self) -> dict:
        import os
        size_bytes = 0
        if self.output_path:
            if self.output_path.startswith("gridfs://"):
                try:
                    from backend.services.db import fs
                    from bson.objectid import ObjectId
                    file_id_str = self.output_path.replace("gridfs://", "")
                    grid_out = fs.get(ObjectId(file_id_str))
                    size_bytes = grid_out.length
                except Exception:
                    pass
            elif os.path.exists(self.output_path):
                try:
                    size_bytes = os.path.getsize(self.output_path)
                except OSError:
                    pass

        return {
            "job_id": self.job_id,
            "job_type": self.job_type,
            "modality": self.modality,
            "status": self.status,
            "progress": self.progress,
            "stage": self.stage,
            "message": self.message,
            "artifact_url": f"/api/jobs/{self.job_id}/artifact" if self.output_path else None,
            "output_name": self.output_name,
            "access_key": self.access_key,
            "integrity_hash": self.integrity_hash,
            "device_info": self.device_info,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "output_size": size_bytes,
        }
