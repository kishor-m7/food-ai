"""
FoodLoop AI - Donation Listings Router
CRUD operations for food surplus listings and claim requests.
"""

import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db, DonationListing, ClaimRequest, User
from app.dependencies import get_current_user
from app.schemas import (
    DonationListingSchema,
    DonationListingCreate,
    DonationListingUpdate,
    ClaimRequestSchema,
    ClaimRequestCreate
)
from app.services.donation_service import DonationService

router = APIRouter(prefix="/api/donations", tags=["Donations Marketplace"])


def parse_listing_response(listing: DonationListing) -> DonationListingSchema:
    tags = []
    if listing.tags_json:
        try:
            tags = json.loads(listing.tags_json)
        except Exception:
            tags = [listing.category]

    return DonationListingSchema(
        id=listing.id,
        title=listing.title,
        category=listing.category,
        food_name=listing.food_name,
        quantity=listing.quantity,
        quantity_unit=listing.quantity_unit,
        meals_yield=listing.meals_yield,
        freshness_score=listing.freshness_score,
        freshness_tier=listing.freshness_tier,
        storage_condition=listing.storage_condition,
        pickup_address=listing.pickup_address,
        pickup_window=listing.pickup_window,
        status=listing.status,
        donor_id=listing.donor_id,
        donor_name=listing.donor_name,
        donor_org=listing.donor_org,
        image_url=listing.image_url,
        notes=listing.notes,
        tags=tags,
        created_at=listing.created_at,
        distance_km=listing.distance_km or 1.0,
        active_claimant_id=listing.active_claimant_id,
        active_claimant_name=listing.active_claimant_name,
        active_request_id=listing.active_request_id
    )


@router.get("", response_model=List[DonationListingSchema])
def list_donations(
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    donor_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    listings = DonationService.list_listings(
        db=db,
        status=status,
        category=category,
        donor_id=donor_id,
        search=search
    )
    return [parse_listing_response(l) for l in listings]


@router.post("", response_model=DonationListingSchema, status_code=status.HTTP_201_CREATED)
def create_donation(
    payload: DonationListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if payload.quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be greater than 0."
        )

    listing = DonationService.create_listing(db=db, donor=current_user, data=payload)
    return parse_listing_response(listing)


@router.get("/{id}", response_model=DonationListingSchema)
def get_donation(id: str, db: Session = Depends(get_db)):
    listing = DonationService.get_listing(db=db, listing_id=id)
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Donation listing '{id}' not found."
        )
    return parse_listing_response(listing)


@router.patch("/{id}", response_model=DonationListingSchema)
def update_donation(
    id: str,
    payload: DonationListingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    listing = DonationService.get_listing(db=db, listing_id=id)
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Donation listing '{id}' not found."
        )

    if current_user.role != "admin" and listing.donor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not have permission to update this listing."
        )

    if payload.quantity is not None and payload.quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be greater than 0."
        )

    updated = DonationService.update_listing(db=db, listing=listing, updates=payload, user=current_user)
    return parse_listing_response(updated)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_donation(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    listing = DonationService.get_listing(db=db, listing_id=id)
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Donation listing '{id}' not found."
        )

    if current_user.role != "admin" and listing.donor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not have permission to delete this listing."
        )

    DonationService.delete_listing(db=db, listing=listing, user=current_user)
    return None


@router.post("/{id}/requests", response_model=ClaimRequestSchema, status_code=status.HTTP_201_CREATED)
def request_donation(
    id: str,
    payload: ClaimRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    listing = DonationService.get_listing(db=db, listing_id=id)
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Donation listing '{id}' not found."
        )

    # 1. Rule: Never allow user to request their own listing
    if listing.donor_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid request: You cannot request your own donation listing."
        )

    # 2. Rule: Prevent duplicate active requests for the user
    existing_requests = DonationService.list_requests(
        db=db,
        claimant_id=current_user.id,
        listing_id=listing.id,
        status="pending"
    )
    if existing_requests:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Duplicate request: You already have a pending claim request for this listing."
        )

    # 3. Rule: Reject requests for unavailable listings
    if listing.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Listing is currently {listing.status.replace('_', ' ')} and cannot be claimed."
        )

    req = DonationService.create_request(db=db, listing=listing, claimant=current_user, data=payload)
    return req
