"""
FoodLoop AI - ML Food Scanner Router
Multi-class image classification and scan recording endpoints.
"""

import io
import base64
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db, ScanRecord, User, AuditLog
from app.dependencies import get_current_user
from app.schemas import PredictResponse, ScanRecordSchema, ScanRecordCreate
from app.services.ml_service import MLService

router = APIRouter(prefix="/api", tags=["Food Recognition & Scanning"])


class Base64PredictPayload(BaseModel):
    image: str
    top_k: Optional[int] = 5


@router.get("/classes")
def get_supported_classes():
    ml_svc = MLService.get_instance()
    if not ml_svc.is_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML Classifier is currently unavailable."
        )
    return {
        "classes": ml_svc.classifier.labels,
        "count": len(ml_svc.classifier.labels)
    }


@router.post("/food/predict", response_model=PredictResponse)
async def predict_food(
    file: Optional[UploadFile] = File(None),
    image_b64: Optional[str] = Form(None),
    top_k: int = Form(5)
):
    """
    Accepts multipart image upload OR base64 form parameter.
    Validates file format, size, and runs PyTorch ResNet-50 forward pass.
    """
    ml_svc = MLService.get_instance()
    if not ml_svc.is_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML Inference Engine unavailable. Check model weights."
        )

    content_bytes = None
    if file:
        content_bytes = await file.read()
    elif image_b64:
        try:
            b64_clean = image_b64.split(",", 1)[1] if "," in image_b64 else image_b64
            padding = len(b64_clean) % 4
            if padding != 0:
                b64_clean += "=" * (4 - padding)
            content_bytes = base64.b64decode(b64_clean)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid base64 image data: {str(e)}"
            )

    if not content_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing image data. Provide a file upload or base64 string."
        )

    valid, err_msg, pil_img = ml_svc.validate_image_bytes(content_bytes)
    if not valid or not pil_img:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=err_msg
        )

    try:
        res = ml_svc.predict_image(pil_img, top_k=top_k)
        return res
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Neural network inference error: {str(e)}"
        )


@router.post("/predict", response_model=PredictResponse)
async def predict_json(payload: Base64PredictPayload):
    """
    Compatibility JSON endpoint accepting base64 image payload.
    """
    ml_svc = MLService.get_instance()
    if not ml_svc.is_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML Inference Engine unavailable. Check model weights."
        )

    try:
        b64_clean = payload.image.split(",", 1)[1] if "," in payload.image else payload.image
        padding = len(b64_clean) % 4
        if padding != 0:
            b64_clean += "=" * (4 - padding)
        content_bytes = base64.b64decode(b64_clean)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid base64 encoding: {str(e)}"
        )

    valid, err_msg, pil_img = ml_svc.validate_image_bytes(content_bytes)
    if not valid or not pil_img:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=err_msg
        )

    try:
        res = ml_svc.predict_image(pil_img, top_k=payload.top_k or 5)
        return res
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference processing error: {str(e)}"
        )


@router.get("/scans", response_model=List[ScanRecordSchema])
def list_scans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    scans = db.query(ScanRecord).filter(ScanRecord.user_id == current_user.id).order_by(ScanRecord.timestamp.desc()).all()
    return scans


@router.post("/scans", response_model=ScanRecordSchema)
def save_scan(
    payload: ScanRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    scan_id = f"SCN-{int(datetime.utcnow().timestamp() * 1000) % 100000}"
    fn = payload.food_name.lower()
    disp = payload.display_name or fn.capitalize()

    scan = ScanRecord(
        id=scan_id,
        food_name=fn,
        display_name=disp,
        confidence=payload.confidence,
        freshness_score=payload.freshness_score,
        category=payload.category or "Fresh Produce",
        timestamp=datetime.utcnow().isoformat(),
        user_id=current_user.id,
        status="Verified"
    )
    db.add(scan)

    log = AuditLog(
        id=f"LOG-{int(datetime.utcnow().timestamp() * 1000) % 100000}",
        action="AI Vision Scan",
        details=f"Produce scanned: {scan.display_name} ({scan.confidence}% confidence)",
        user=current_user.name,
        timestamp=datetime.utcnow().isoformat(),
        severity="success"
    )
    db.add(log)

    db.commit()
    db.refresh(scan)
    return scan
