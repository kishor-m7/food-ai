"""
FoodLoop AI - Users Router
User management, profile endpoints, and admin user administration.
"""

from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db, User, AuditLog
from app.dependencies import get_current_user, require_admin_role
from app.schemas import UserSchema, UserCreate, UserUpdate
from app.services.donation_service import DonationService

router = APIRouter(prefix="/api/users", tags=["User Management"])


@router.get("", response_model=List[UserSchema])
def list_users(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin_role)
):
    """Admin-only endpoint listing all platform users."""
    users = db.query(User).order_by(User.joined_date.desc()).all()
    return users


@router.get("/me")
def get_current_user_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Return active user profile and personal impact statistics."""
    my_listings = DonationService.list_listings(db=db, donor_id=current_user.id)
    my_requests = DonationService.list_requests(db=db, claimant_id=current_user.id)

    total_kg = sum(l.quantity for l in my_listings)
    total_meals = sum(l.meals_yield for l in my_listings)
    co2e_saved = round(total_kg * 2.5, 1)

    return {
        "user": UserSchema.model_validate(current_user),
        "stats": {
            "donationsListed": len(my_listings),
            "activeListings": sum(1 for l in my_listings if l.status == "active"),
            "claimsRequested": len(my_requests),
            "approvedClaims": sum(1 for r in my_requests if r.status in ["approved", "completed"]),
            "totalKgDonated": int(round(total_kg)),
            "totalMealsProvided": int(round(total_meals)),
            "co2eSavedKg": str(co2e_saved)
        }
    }


@router.post("", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db)
):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with email '{payload.email}' already exists."
        )

    user_id = f"usr-{int(datetime.utcnow().timestamp() * 1000) % 100000}"
    user = User(
        id=user_id,
        name=payload.name,
        email=payload.email,
        role=payload.role or "user",
        organization=payload.organization,
        avatar=payload.avatar or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        phone=payload.phone,
        location=payload.location,
        status="active",
        joined_date=datetime.utcnow().strftime("%Y-%m-%d"),
        donations_count=0,
        claims_count=0
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{id}/status", response_model=UserSchema)
def toggle_user_status(
    id: str,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin_role)
):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User '{id}' not found."
        )

    user.status = "suspended" if user.status == "active" else "active"
    
    log = AuditLog(
        id=f"LOG-{int(datetime.utcnow().timestamp() * 1000) % 100000}",
        action="User Status Changed",
        details=f"User {user.name} set to {user.status} by Admin {admin_user.name}",
        user=admin_user.name,
        timestamp=datetime.utcnow().isoformat(),
        severity="warn" if user.status == "suspended" else "info"
    )
    db.add(log)
    
    db.commit()
    db.refresh(user)
    return user
