"""
FoodLoop AI - Admin & Analytics Router
Platform aggregate statistics, audit logging, and prototype controls.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db, AuditLog, seed_database_if_empty, Base, engine, SessionLocal
from app.dependencies import get_current_user, require_admin_role
from app.schemas import AdminStatsSchema, AuditLogSchema
from app.services.donation_service import DonationService

router = APIRouter(prefix="/api/admin", tags=["Admin Analytics"])


@router.get("/stats", response_model=AdminStatsSchema)
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Return aggregate platform impact metrics."""
    return DonationService.get_admin_stats(db=db)


@router.get("/logs", response_model=List[AuditLogSchema])
def get_audit_logs(
    db: Session = Depends(get_db),
    admin_user=Depends(require_admin_role)
):
    """Admin-only endpoint listing security audit logs."""
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100).all()
    return logs


@router.post("/reset-demo")
def reset_demo_data(
    db: Session = Depends(get_db),
    admin_user=Depends(require_admin_role)
):
    """Safe development command to reset prototype data back to initial baseline."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    seed_database_if_empty(db)
    return {
        "success": True,
        "message": "Demo dataset successfully reset to baseline."
    }
