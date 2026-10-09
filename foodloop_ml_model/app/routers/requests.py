"""
FoodLoop AI - Claim Requests Router
Manages donation claims, request lifecycle, and authorization reviews.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db, ClaimRequest, User
from app.dependencies import get_current_user
from app.schemas import ClaimRequestSchema, ClaimRequestReview
from app.services.donation_service import DonationService

router = APIRouter(prefix="/api/requests", tags=["Claim Requests"])


@router.get("", response_model=List[ClaimRequestSchema])
def list_requests(
    claimant_id: Optional[str] = Query(None),
    donor_id: Optional[str] = Query(None),
    listing_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Non-admin users are restricted to listing requests where they are donor or claimant
    if current_user.role != "admin":
        if not claimant_id and not donor_id:
            # Default to showing requests related to current user
            donor_requests = DonationService.list_requests(db=db, donor_id=current_user.id, status=status)
            claimant_requests = DonationService.list_requests(db=db, claimant_id=current_user.id, status=status)
            
            # Combine and deduplicate
            seen = set()
            combined = []
            for r in donor_requests + claimant_requests:
                if r.id not in seen:
                    seen.add(r.id)
                    combined.append(r)
            return combined

    return DonationService.list_requests(
        db=db,
        claimant_id=claimant_id,
        donor_id=donor_id,
        listing_id=listing_id,
        status=status
    )


@router.patch("/{id}", response_model=ClaimRequestSchema)
def review_request(
    id: str,
    payload: ClaimRequestReview,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    req = db.query(ClaimRequest).filter(ClaimRequest.id == id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Claim request '{id}' not found."
        )

    action = payload.action.lower()
    
    # Authorization checks:
    # - Donor can approve or reject
    # - Claimant or donor or admin can complete or cancel
    if current_user.role != "admin":
        if action in ["approve", "reject"] and req.donor_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: Only the donation listing donor can approve or reject claim requests."
            )
        if action in ["complete", "cancel"] and current_user.id not in [req.donor_id, req.claimant_id]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: Only the donor or claimant can complete/cancel this request."
            )

    try:
        updated_req = DonationService.review_request(
            db=db,
            req=req,
            action=action,
            user=current_user
        )
        return updated_req
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
