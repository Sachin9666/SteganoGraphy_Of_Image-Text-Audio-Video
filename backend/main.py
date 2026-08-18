from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes import auth, decode, encode, jobs
from backend.services.queue_manager import queue_manager


@asynccontextmanager
async def lifespan(app: FastAPI):
    from backend.services.db import initialize_database
    initialize_database()
    await queue_manager.start()
    yield
    await queue_manager.stop()


def create_app() -> FastAPI:
    app = FastAPI(
        title="Deep Multi-Modal Steganography Platform",
        version="1.0.0",
        description=(
            "Production-oriented API for key-bound steganography across image, audio, "
            "video, and text modalities."
        ),
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth.router, prefix="/api")
    app.include_router(encode.router, prefix="/api")
    app.include_router(decode.router, prefix="/api")
    app.include_router(jobs.router, prefix="/api")

    @app.get("/health")
    async def health() -> dict:
        return {
            "status": "ok",
            "queue_running": queue_manager.running,
            "worker_count": queue_manager.worker_count,
        }

    return app


# Trigger reload comment
app = create_app()
