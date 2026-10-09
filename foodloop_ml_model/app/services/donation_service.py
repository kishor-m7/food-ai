"""
FoodLoop AI - Donation & Marketplace Business Logic
Database transaction operations for listings, requests, users, and audit logs.
"""

import json
from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import User, DonationListing, ClaimRequest, ScanRecord, AuditLog
from app.schemas import DonationListingCreate, DonationListingUpdate, ClaimRequestCreate, UserCreate, UserUpdate


def get_category_for_food(food_name: str) -> str:
    fn = (food_name or "").lower().strip()
    produce_list = ['apple', 'banana', 'broccoli', 'carrot', 'cucumber', 'eggplant', 'mango', 'orange', 'pineapple', 'potato', 'spinach', 'sweet corn', 'sweet potato', 'tomato', 'mustard leaf', 'corn']
    grains_list = ['bread', 'noodles', 'spaghetti', 'gandum', 'rice', 'rice flour', 'tapioca flour', 'wheat flour']
    dairy_list = ['milk', 'cheese', 'yogurt', 'egg']
    meat_list = ['raw chicken', 'raw cow meat', 'raw fish', 'raw goat meat', 'raw squid', 'shrimp', 'tofu', 'tempe mentah']
    
    if fn in produce_list:
        return 'Fresh Produce'
    if fn in grains_list:
        return 'Bakery & Grains'
    if fn in dairy_list:
        return 'Dairy & Eggs'
    if fn in meat_list:
        return 'Meat & Protein'
    return 'Pantry & Spices'


class DonationService:

    @staticmethod
    def create_listing(db: Session, donor: User, data: DonationListingCreate) -> DonationListing:
        listing_id = f"LST-{int(datetime.utcnow().timestamp() * 1000) % 100000}"
        
        category = data.category or get_category_for_food(data.food_name)
        title = data.title or f"{data.food_name.capitalize()} Surplus"
        freshness_score = data.freshness_score or 95
        
        if freshness_score >= 94:
            freshness_tier = "Tier 1 - Optimal (4-6 days)"
        elif freshness_score >= 88:
            freshness_tier = "Tier 2 - Good (2-3 days)"
        else:
            freshness_tier = "Tier 3 - Immediate Rescue (< 24h)"

        tags = data.tags or [category, "Surplus", "Verified User"]
        meals_yield = data.meals_yield or int(data.quantity * 2)

        listing = DonationListing(
            id=listing_id,
            title=title,
            category=category,
            food_name=data.food_name.lower(),
            quantity=data.quantity,
            quantity_unit=data.quantity_unit or "kg",
            meals_yield=meals_yield,
            freshness_score=freshness_score,
            freshness_tier=freshness_tier,
            storage_condition=data.storage_condition or "Ambient / Cool Dry Storage",
            pickup_address=data.pickup_address or donor.location or "Donor Hub",
            pickup_window=data.pickup_window or "Today, 2:00 PM – 6:00 PM",
            status="active",
            donor_id=donor.id,
            donor_name=donor.name,
            donor_org=donor.organization,
            image_url=data.image_url or "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop&q=80",
            notes=data.notes or "Surplus food inspected and declared safe.",
            tags_json=json.dumps(tags),
            created_at=datetime.utcnow().isoformat(),
            distance_km=1.5
        )

        db.add(listing)
        
        # Update user stats
        donor.donations_count = (donor.donations_count or 0) + 1
        
        # Audit Log
        log = AuditLog(
            id=f"LOG-{int(datetime.utcnow().timestamp() * 1000) % 100000}",
            action="New Listing Created",
            details=f"Created {listing.id}: {listing.title} ({listing.quantity} {listing.quantity_unit})",
            user=donor.name,
            timestamp=datetime.utcnow().isoformat(),
            severity="info"
        )
        db.add(log)
        
        db.commit()
        db.refresh(listing)
        return listing

    @staticmethod
    def get_listing(db: Session, listing_id: str) -> Optional[DonationListing]:
        return db.query(DonationListing).filter(DonationListing.id == listing_id).first()

    @staticmethod
    def list_listings(
        db: Session,
        status: Optional[str] = None,
        category: Optional[str] = None,
        donor_id: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[DonationListing]:
        query = db.query(DonationListing)
        
        if status:
            query = query.filter(DonationListing.status == status)
        if category and category != "All":
            query = query.filter(DonationListing.category.ilike(category))
        if donor_id:
            query = query.filter(DonationListing.donor_id == donor_id)
        if search:
            q = f"%{search}%"
            query = query.filter(
                or_(
                    DonationListing.title.ilike(q),
                    DonationListing.food_name.ilike(q),
                    DonationListing.category.ilike(q),
                    DonationListing.donor_org.ilike(q),
                    DonationListing.pickup_address.ilike(q)
                )
            )
        
        return query.order_by(DonationListing.created_at.desc()).all()

    @staticmethod
    def update_listing(db: Session, listing: DonationListing, updates: DonationListingUpdate, user: User) -> DonationListing:
        update_data = updates.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            if value is not None:
                setattr(listing, key, value)

        # Audit Log
        log = AuditLog(
            id=f"LOG-{int(datetime.utcnow().timestamp() * 1000) % 100000}",
            action="Listing Updated",
            details=f"Listing {listing.id} updated by {user.name}",
            user=user.name,
            timestamp=datetime.utcnow().isoformat(),
            severity="info"
        )
        db.add(log)
        
        db.commit()
        db.refresh(listing)
        return listing

    @staticmethod
    def delete_listing(db: Session, listing: DonationListing, user: User) -> bool:
        db.delete(listing)
        
        log = AuditLog(
            id=f"LOG-{int(datetime.utcnow().timestamp() * 1000) % 100000}",
            action="Listing Deleted",
            details=f"Listing {listing.id} ({listing.title}) deleted by {user.name}",
            user=user.name,
            timestamp=datetime.utcnow().isoformat(),
            severity="warn"
        )
        db.add(log)
        
        db.commit()
        return True

    @staticmethod
    def create_request(db: Session, listing: DonationListing, claimant: User, data: ClaimRequestCreate) -> ClaimRequest:
        request_id = f"REQ-{int(datetime.utcnow().timestamp() * 1000) % 100000}"
        
        contact = data.contact or f"{claimant.email} • {claimant.phone or 'N/A'}"
        
        req = ClaimRequest(
            id=request_id,
            listing_id=listing.id,
            listing_title=listing.title,
            claimant_id=claimant.id,
            claimant_name=claimant.name,
            claimant_org=claimant.organization,
            claimant_contact=contact,
            donor_id=listing.donor_id,
            donor_name=listing.donor_name,
            donor_org=listing.donor_org,
            purpose=data.purpose or "Community food distribution",
            pickup_time=data.pickup_time or "Today during scheduled pickup window",
            status="pending",
            created_at=datetime.utcnow().isoformat()
        )
        
        db.add(req)
        
        # Transactionally update listing state
        listing.status = "claim_requested"
        listing.active_claimant_id = claimant.id
        listing.active_claimant_name = f"{claimant.name} ({claimant.organization})"
        listing.active_request_id = request_id

        # Update claimant stats
        claimant.claims_count = (claimant.claims_count or 0) + 1

        # Audit Log
        log = AuditLog(
            id=f"LOG-{int(datetime.utcnow().timestamp() * 1000) % 100000}",
            action="Donation Requested",
            details=f"Request {req.id} created by {claimant.name} for {listing.title}",
            user=claimant.name,
            timestamp=datetime.utcnow().isoformat(),
            severity="info"
        )
        db.add(log)

        db.commit()
        db.refresh(req)
        return req

    @staticmethod
    def list_requests(
        db: Session,
        claimant_id: Optional[str] = None,
        donor_id: Optional[str] = None,
        listing_id: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[ClaimRequest]:
        query = db.query(ClaimRequest)
        if claimant_id:
            query = query.filter(ClaimRequest.claimant_id == claimant_id)
        if donor_id:
            query = query.filter(ClaimRequest.donor_id == donor_id)
        if listing_id:
            query = query.filter(ClaimRequest.listing_id == listing_id)
        if status:
            query = query.filter(ClaimRequest.status == status)
        return query.order_by(ClaimRequest.created_at.desc()).all()

    @staticmethod
    def review_request(db: Session, req: ClaimRequest, action: str, user: User) -> ClaimRequest:
        action = action.lower()
        listing = db.query(DonationListing).filter(DonationListing.id == req.listing_id).first()

        if action == "approve":
            req.status = "approved"
            if listing:
                listing.status = "claimed"
            action_title = "Claim Approved"
        elif action == "reject":
            req.status = "rejected"
            if listing and listing.active_request_id == req.id:
                listing.status = "active"
                listing.active_claimant_id = None
                listing.active_claimant_name = None
                listing.active_request_id = None
            action_title = "Claim Rejected"
        elif action == "complete":
            req.status = "completed"
            if listing:
                listing.status = "completed"
            action_title = "Claim Completed"
        elif action == "cancel":
            req.status = "cancelled"
            if listing and listing.active_request_id == req.id:
                listing.status = "active"
                listing.active_claimant_id = None
                listing.active_claimant_name = None
                listing.active_request_id = None
            action_title = "Claim Cancelled"
        else:
            raise ValueError(f"Invalid review action: {action}")

        log = AuditLog(
            id=f"LOG-{int(datetime.utcnow().timestamp() * 1000) % 100000}",
            action=action_title,
            details=f"Request {req.id} status changed to {req.status} by {user.name}",
            user=user.name,
            timestamp=datetime.utcnow().isoformat(),
            severity="info" if action != "reject" else "warn"
        )
        db.add(log)

        db.commit()
        db.refresh(req)
        return req

    @staticmethod
    def get_admin_stats(db: Session) -> Dict[str, Any]:
        users = db.query(User).all()
        listings = db.query(DonationListing).all()
        requests = db.query(ClaimRequest).all()
        scans = db.query(ScanRecord).all()

        total_kg = sum(l.quantity for l in listings)
        total_meals = sum(l.meals_yield for l in listings)
        co2e_saved = round((total_kg * 2.5) / 1000, 2)

        return {
            "totalUsers": len(users),
            "userCount": sum(1 for u in users if u.role == "user"),
            "adminCount": sum(1 for u in users if u.role == "admin"),
            "totalListings": len(listings),
            "activeListings": sum(1 for l in listings if l.status == "active"),
            "pendingRequests": sum(1 for r in requests if r.status == "pending"),
            "completedDonations": sum(1 for l in listings if l.status in ["completed", "claimed"]),
            "flaggedListings": sum(1 for l in listings if l.status == "flagged"),
            "totalKgRescued": int(round(total_kg)),
            "totalMealsRescued": int(round(total_meals)),
            "co2eSavedTonnes": str(co2e_saved),
            "totalScans": len(scans)
        }
