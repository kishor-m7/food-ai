"""
FoodLoop AI - Health Router
Backend system and machine learning inference engine health status.
"""

from fastapi import APIRouter
from app.schemas import HealthResponse
from app.services.ml_service import MLService

router = APIRouter(prefix="/api", tags=["Health"])


@router.get("/health", response_model=HealthResponse)
def get_health():
    ml_svc = MLService.get_instance()
    is_available = ml_svc.is_available()
    classifier = ml_svc.classifier

    return HealthResponse(
        status="healthy",
        service="FoodLoop AI FastAPI Backend & Inference API",
        model_loaded=is_available,
        num_classes=classifier.num_classes if is_available else 0,
        device=str(classifier.device) if is_available else "none",
        version="v1.0-production"
    )
