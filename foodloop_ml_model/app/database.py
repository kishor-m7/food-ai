"""
FoodLoop AI - Database Engine & ORM Models
SQLite persistence using SQLAlchemy 2.0 with seed data support.
"""

import os
import json
from datetime import datetime
from typing import Generator

from sqlalchemy import create_engine, Column, String, Float, Integer, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker, Session, relationship

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR, 'foodloop.db')}")

# For SQLite, set connect_args
connect_args = {"check_same_thread": False} if DB_PATH.startswith("sqlite") else {}

engine = create_engine(DB_PATH, connect_args=connect_args, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    role = Column(String(20), nullable=False, default="user")  # 'user' | 'admin'
    organization = Column(String(150), nullable=True)
    avatar = Column(Text, nullable=True)
    phone = Column(String(50), nullable=True)
    location = Column(String(255), nullable=True)
    status = Column(String(20), nullable=False, default="active")  # 'active' | 'suspended'
    joined_date = Column(String(20), nullable=False)
    donations_count = Column(Integer, default=0)
    claims_count = Column(Integer, default=0)

    listings = relationship("DonationListing", back_populates="donor", foreign_keys="DonationListing.donor_id")
    requests = relationship("ClaimRequest", back_populates="claimant", foreign_keys="ClaimRequest.claimant_id")


class DonationListing(Base):
    __tablename__ = "donation_listings"

    id = Column(String(50), primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False)
    food_name = Column(String(100), nullable=False)
    quantity = Column(Float, nullable=False)
    quantity_unit = Column(String(20), nullable=False, default="kg")
    meals_yield = Column(Integer, nullable=False, default=0)
    freshness_score = Column(Integer, nullable=False, default=90)
    freshness_tier = Column(String(100), nullable=False)
    storage_condition = Column(String(150), nullable=True)
    pickup_address = Column(String(255), nullable=False)
    pickup_window = Column(String(100), nullable=False)
    status = Column(String(30), nullable=False, default="active")  # active | claim_requested | claimed | completed | flagged | rejected
    donor_id = Column(String(50), ForeignKey("users.id"), nullable=False)
    donor_name = Column(String(100), nullable=False)
    donor_org = Column(String(150), nullable=True)
    image_url = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    tags_json = Column(Text, nullable=True)  # JSON string array
    created_at = Column(String(50), nullable=False)
    distance_km = Column(Float, default=1.0)
    
    active_claimant_id = Column(String(50), ForeignKey("users.id"), nullable=True)
    active_claimant_name = Column(String(150), nullable=True)
    active_request_id = Column(String(50), nullable=True)

    donor = relationship("User", foreign_keys=[donor_id], back_populates="listings")
    requests = relationship("ClaimRequest", back_populates="listing", cascade="all, delete-orphan")


class ClaimRequest(Base):
    __tablename__ = "claim_requests"

    id = Column(String(50), primary_key=True, index=True)
    listing_id = Column(String(50), ForeignKey("donation_listings.id"), nullable=False)
    listing_title = Column(String(200), nullable=False)
    claimant_id = Column(String(50), ForeignKey("users.id"), nullable=False)
    claimant_name = Column(String(100), nullable=False)
    claimant_org = Column(String(150), nullable=True)
    claimant_contact = Column(String(200), nullable=False)
    donor_id = Column(String(50), ForeignKey("users.id"), nullable=False)
    donor_name = Column(String(100), nullable=False)
    donor_org = Column(String(150), nullable=True)
    purpose = Column(Text, nullable=False)
    pickup_time = Column(String(100), nullable=False)
    status = Column(String(30), nullable=False, default="pending")  # pending | approved | completed | rejected | cancelled
    created_at = Column(String(50), nullable=False)

    listing = relationship("DonationListing", back_populates="requests")
    claimant = relationship("User", foreign_keys=[claimant_id], back_populates="requests")


class ScanRecord(Base):
    __tablename__ = "scan_records"

    id = Column(String(50), primary_key=True, index=True)
    food_name = Column(String(100), nullable=False)
    display_name = Column(String(150), nullable=False)
    confidence = Column(Float, nullable=False)
    freshness_score = Column(Integer, nullable=False)
    category = Column(String(50), nullable=False)
    timestamp = Column(String(50), nullable=False)
    user_id = Column(String(50), ForeignKey("users.id"), nullable=False)
    status = Column(String(50), nullable=False, default="Verified")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(50), primary_key=True, index=True)
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=False)
    user = Column(String(100), nullable=False)
    timestamp = Column(String(50), nullable=False)
    severity = Column(String(20), nullable=False, default="info")  # info | warn | success | error


def get_db() -> Generator[Session, None, None]:
    """Dependency for obtaining a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def seed_database_if_empty(db: Session):
    """Seed DB with initial demo data if empty."""
    user_count = db.query(User).count()
    if user_count > 0:
        return  # DB already has data

    print("[FoodLoop AI] Seeding database with initial prototype data...")

    # Users
    users_data = [
        User(
            id="usr-1",
            name="Kishor",
            email="kishor@harvestcommunity.org",
            role="user",
            organization="Green Harvest Community Kitchen",
            avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            phone="+1 (555) 234-5678",
            location="Downtown Hub, San Francisco, CA",
            status="active",
            joined_date="2026-01-15",
            donations_count=14,
            claims_count=2
        ),
        User(
            id="usr-2",
            name="Marcus Chen",
            email="marcus@hopekitchen.org",
            role="user",
            organization="Hope Community Pantry",
            avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            phone="+1 (555) 987-6543",
            location="44 Harbor View Rd, Downtown",
            status="active",
            joined_date="2026-02-10",
            donations_count=5,
            claims_count=19
        ),
        User(
            id="usr-3",
            name="Metro Partner",
            email="partner@metrofoodbank.org",
            role="user",
            organization="Metro Community Food Bank",
            avatar="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
            phone="+1 (555) 456-7890",
            location="88 River Street, Eastside",
            status="active",
            joined_date="2026-03-01",
            donations_count=22,
            claims_count=8
        ),
        User(
            id="usr-admin",
            name="Sarah",
            email="sarah@foodloop.ai",
            role="admin",
            organization="FoodLoop Operational Team",
            avatar="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
            phone="+1 (555) 987-6543",
            location="Headquarters, San Jose, CA",
            status="active",
            joined_date="2025-11-01",
            donations_count=0,
            claims_count=0
        )
    ]
    for u in users_data:
        db.add(u)
    db.commit()

    # Listings
    now_iso = datetime.utcnow().isoformat()
    listings_data = [
        DonationListing(
            id="LST-101",
            title="Crisp Honeycrisp Apples & Bananas",
            category="Fresh Produce",
            food_name="apple",
            quantity=18.0,
            quantity_unit="kg",
            meals_yield=36,
            freshness_score=96,
            freshness_tier="Tier 1 - Optimal (4-6 days)",
            storage_condition="Ambient / Cool Dry Storage",
            pickup_address="GreenBite Kitchens Hub, 104 Metro Central Ave",
            pickup_window="Today, 2:00 PM – 6:00 PM",
            status="active",
            donor_id="usr-1",
            donor_name="Dr. Elena Rostova",
            donor_org="GreenBite Kitchens",
            image_url="https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80",
            notes="Certified USDA Grade-A surplus produce from local organic supplier. Washed and packed in ventilated crates.",
            tags_json=json.dumps(["Produce", "Organic", "Fruit", "High Yield"]),
            created_at=now_iso,
            distance_km=1.2
        ),
        DonationListing(
            id="LST-102",
            title="Artisan Sourdough & French Baguettes",
            category="Bakery & Grains",
            food_name="bread",
            quantity=24.0,
            quantity_unit="items",
            meals_yield=48,
            freshness_score=92,
            freshness_tier="Tier 2 - Good (2-3 days)",
            storage_condition="Cool & Dry (Bread Box)",
            pickup_address="Golden Crust Bakery, 12 Baker Street",
            pickup_window="Today, 5:00 PM – 8:00 PM",
            status="active",
            donor_id="usr-3",
            donor_name="Sarah Jenkins",
            donor_org="Metro Community Food Bank",
            image_url="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
            notes="Baked fresh this morning. Contains gluten. Packaged in individual paper bags.",
            tags_json=json.dumps(["Bakery", "Prepared", "Fresh Daily"]),
            created_at=now_iso,
            distance_km=2.8
        ),
        DonationListing(
            id="LST-103",
            title="Fresh Farm Broccoli & Leafy Greens",
            category="Fresh Produce",
            food_name="broccoli",
            quantity=15.0,
            quantity_unit="kg",
            meals_yield=30,
            freshness_score=98,
            freshness_tier="Tier 1 - Optimal (4-6 days)",
            storage_condition="Refrigerated (2°C – 4°C)",
            pickup_address="GreenBite Kitchens Hub, 104 Metro Central Ave",
            pickup_window="Tomorrow, 9:00 AM – 1:00 PM",
            status="active",
            donor_id="usr-1",
            donor_name="Dr. Elena Rostova",
            donor_org="GreenBite Kitchens",
            image_url="https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=600&auto=format&fit=crop&q=80",
            notes="Crisp green crowns harvested yesterday afternoon. High nutritional value.",
            tags_json=json.dumps(["Produce", "Vegetables", "Refrigerated"]),
            created_at=now_iso,
            distance_km=1.2
        ),
        DonationListing(
            id="LST-104",
            title="Organic Sweet Corn & Bell Peppers",
            category="Fresh Produce",
            food_name="sweet corn",
            quantity=30.0,
            quantity_unit="kg",
            meals_yield=60,
            freshness_score=89,
            freshness_tier="Tier 2 - Good (2-3 days)",
            storage_condition="Chilled Storage (4°C)",
            pickup_address="Valley Harvest Co-Op, 89 Greenfield Way",
            pickup_window="Today, 3:30 PM – 7:00 PM",
            status="claim_requested",
            donor_id="usr-3",
            donor_name="Sarah Jenkins",
            donor_org="Metro Community Food Bank",
            image_url="https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop&q=80",
            notes="Sweet yellow corn ears and crisp green/red paprika.",
            tags_json=json.dumps(["Produce", "Corn", "Vegetables"]),
            created_at=now_iso,
            distance_km=4.5,
            active_claimant_id="usr-2",
            active_claimant_name="Marcus Chen (Hope Community Pantry)",
            active_request_id="REQ-201"
        )
    ]
    for l in listings_data:
        db.add(l)
    db.commit()

    # Requests
    requests_data = [
        ClaimRequest(
            id="REQ-201",
            listing_id="LST-104",
            listing_title="Organic Sweet Corn & Bell Peppers",
            claimant_id="usr-2",
            claimant_name="Marcus Chen",
            claimant_org="Hope Community Pantry",
            claimant_contact="marcus@hopekitchen.org • (555) 987-6543",
            donor_id="usr-3",
            donor_name="Sarah Jenkins",
            donor_org="Metro Community Food Bank",
            purpose="Evening community dinner serving 80+ elderly shelter residents.",
            pickup_time="Today at 5:00 PM",
            status="pending",
            created_at=now_iso
        )
    ]
    for r in requests_data:
        db.add(r)
    db.commit()

    # Scans
    scans_data = [
        ScanRecord(
            id="SCN-501",
            food_name="apple",
            display_name="Honeycrisp Apple (Malus domestica)",
            confidence=99.03,
            freshness_score=96,
            category="Fresh Produce",
            timestamp=now_iso,
            user_id="usr-1",
            status="Verified & Listed"
        ),
        ScanRecord(
            id="SCN-502",
            food_name="banana",
            display_name="Cavendish Banana",
            confidence=90.85,
            freshness_score=91,
            category="Fresh Produce",
            timestamp=now_iso,
            user_id="usr-1",
            status="Verified"
        ),
        ScanRecord(
            id="SCN-503",
            food_name="bread",
            display_name="Artisan Wheat Loaf",
            confidence=94.20,
            freshness_score=94,
            category="Bakery & Grains",
            timestamp=now_iso,
            user_id="usr-3",
            status="Verified & Listed"
        )
    ]
    for s in scans_data:
        db.add(s)
    db.commit()

    # Audit Logs
    logs_data = [
        AuditLog(
            id="LOG-801",
            action="Donation Listing Published",
            details="LST-101 (18 kg Apples & Bananas) created by Dr. Elena Rostova",
            user="Dr. Elena Rostova",
            timestamp=now_iso,
            severity="info"
        ),
        AuditLog(
            id="LOG-802",
            action="Claim Request Submitted",
            details="REQ-201 submitted by Marcus Chen for LST-104",
            user="Marcus Chen",
            timestamp=now_iso,
            severity="info"
        ),
        AuditLog(
            id="LOG-803",
            action="AI Model Vision Scan",
            details="Produce batch classified as Malus domestica (99.03% confidence)",
            user="Dr. Elena Rostova",
            timestamp=now_iso,
            severity="success"
        )
    ]
    for log in logs_data:
        db.add(log)
    db.commit()

    print("[FoodLoop AI] Database seed completed successfully.")


def init_db():
    """Create tables and seed database."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database_if_empty(db)
    finally:
        db.close()
