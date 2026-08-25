"""Health check endpoints."""
from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "JOBHUNT AI",
        "version": "1.0.0",
    }


@router.get("/live")
async def liveness_probe():
    """Kubernetes liveness probe."""
    return {"status": "alive"}


@router.get("/ready")
async def readiness_probe():
    """Kubernetes readiness probe."""
    return {"status": "ready"}
