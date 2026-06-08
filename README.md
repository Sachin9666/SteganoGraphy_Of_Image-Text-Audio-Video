# Deep Learning Multi-Modal Steganography Platform

This repository provides a deployable full-stack system for multi-modal steganography with:

- FastAPI APIs for encode/decode workflows
- React sender/receiver dashboards
- GPU-first inference with CPU fallback warnings
- Async job orchestration and progress polling
- AES-GCM secret protection with SHA-256 file-bound key validation
- Dockerized local deployment with optional Redis/Celery scale-out path

## Architecture

### Request flow

1. The sender uploads a cover file and secret payload through the React encrypt dashboard.
2. FastAPI validates modality, extension, and strict size limits.
3. The encode job is queued for asynchronous execution.
4. The inference service chooses GPU when available and falls back to CPU with an explicit warning.
5. The secret payload is encrypted with AES-GCM.
6. A key binding hash is derived from `SHA-256(key + file_signature)`.
7. The stego artifact is written to runtime storage and exposed through a download endpoint.
8. The receiver uploads the stego file and provides the sender-issued access key.
9. The backend validates the key binding and rejects tampered or mismatched files.
10. The decrypted secret is returned as the recovered artifact.

### Backend structure

- `backend/main.py`: FastAPI bootstrap and lifecycle hooks
- `backend/routes/`: encode, decode, and job status endpoints
- `backend/services/`: validation, queueing, storage, runtime selection, and orchestration
- `backend/security/crypto.py`: AES-GCM encryption, file signatures, and key binding
- `ml_models/`: PyTorch model definitions and inference wrappers
- `queue_system/celery_app.py`: Redis/Celery scale-out entry point for production evolution

### Security model

- Access keys are generated from 32 bytes of cryptographically secure randomness.
- Secret payloads are encrypted with AES-GCM before being packaged into the stego output.
- Each stego artifact stores a file signature and key binding hash.
- Decode rejects artifacts when the key does not match the bound file signature.
- Simple in-memory rate limiting throttles repeated encode/decode attempts.

## File limits

- Images: 10 MB
- Audio: 20 MB
- Video: 50 MB
- Text: 2 MB

Requests beyond these limits are rejected before job scheduling.

## Model notes

The repository includes PyTorch model scaffolding for:

- Image steganography via 2D CNN
- Audio steganography via 1D CNN
- Video steganography via 3D CNN
- Text workflows via Transformer encoder

The current implementation wires the image model into inference directly and keeps audio/video/text in a deployment-ready service interface so trained checkpoints can be dropped in without changing the API surface. For a production rollout, replace the placeholder inference paths with trained checkpoints and modality-specific preprocessing pipelines.

## Local development

### Backend

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn backend.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Docker deployment

### GPU deployment

Requirements:

- NVIDIA GPU
- NVIDIA Container Toolkit
- Docker Compose

Run:

```bash
docker compose up --build
```

The backend container is based on a CUDA runtime image. If GPU is unavailable, the API still starts and reports CPU fallback in job status.

### CPU-only deployment

If you do not have GPU support available, swap the backend image base in `backend/Dockerfile` to a standard Python runtime such as `python:3.12-slim` and install the CPU build of PyTorch.

## API surface

- `POST /api/encode`
- `POST /api/decode`
- `GET /api/jobs/{job_id}`
- `GET /api/jobs/{job_id}/artifact`
- `GET /health`

## Frontend features

- Separate encrypt and decrypt dashboards
- Drag-and-drop uploads
- Client-side file size validation
- Progress polling for async jobs
- Download link for stego or recovered artifact
- Access key presentation for sender workflows
- Explicit CPU fallback warnings

## Production hardening checklist

- Replace the in-memory queue with Celery workers backed by Redis or RabbitMQ
- Persist jobs and metadata in PostgreSQL instead of process memory
- Back artifacts with object storage such as S3
- Add authenticated users, tenant isolation, and audit trails
- Load trained checkpoints with versioned model registry management
- Add perceptual metrics collection such as PSNR, SSIM, and BER during evaluation
- Add WebSocket push updates instead of polling for large deployments
