"""
FoodLoop AI - Pydantic Schemas
Strict data validation for API requests and responses.
"""

from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


# Health & System
class HealthResponse(BaseModel):
    status: str
    service: str
    model_loaded: bool
    num_classes: int
    device: str
    version: str


# ML Prediction
class TopPrediction(BaseModel):
    label: str
    confidence: float
    probability_percent: float


class PredictResponse(BaseModel):
    success: bool
    isLiveModel: bool
    predicted_label: str
    confidence: float
    probability_percent: float
    freshness_score: int
    freshness_tier: str
    top_k: List[TopPrediction]
    device: str
    model_architecture: str


# Users
class UserBase(BaseModel):
    name: str
    email: str
    role: str = "user"  # user | admin
    organization: Optional[str] = None
    avatar: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    organization: Optional[str] = None
    avatar: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None


class UserSchema(UserBase):
    id: str
    status: str
    joined_date: str
    donations_count: int
    claims_count: int

    model_config = ConfigDict(from_attributes=True)


# Donation Listings
class DonationListingBase(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    food_name: str
    quantity: float = Field(..., gt=0)
    quantity_unit: str = "kg"
    meals_yield: Optional[int] = None
    freshness_score: Optional[int] = Field(None, ge=0, le=100)
    freshness_tier: Optional[str] = None
    storage_condition: Optional[str] = None
    pickup_address: Optional[str] = None
    pickup_window: Optional[str] = None
    image_url: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None


class DonationListingCreate(DonationListingBase):
    pass


class DonationListingUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[float] = None
    quantity_unit: Optional[str] = None
    status: Optional[str] = None  # active | claim_requested | claimed | completed | flagged | rejected
    notes: Optional[str] = None
    pickup_address: Optional[str] = None
    pickup_window: Optional[str] = None
    image_url: Optional[str] = None


class DonationListingSchema(BaseModel):
    id: str
    title: str
    category: str
    food_name: str
    quantity: float
    quantity_unit: str
    meals_yield: int
    freshness_score: int
    freshness_tier: str
    storage_condition: Optional[str]
    pickup_address: str
    pickup_window: str
    status: str
    donor_id: str
    donor_name: str
    donor_org: Optional[str]
    image_url: Optional[str]
    notes: Optional[str]
    tags: List[str]
    created_at: str
    distance_km: float
    active_claimant_id: Optional[str] = None
    active_claimant_name: Optional[str] = None
    active_request_id: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# Claim Requests
class ClaimRequestCreate(BaseModel):
    purpose: Optional[str] = "Community kitchen distribution"
    pickup_time: Optional[str] = "Today during scheduled pickup window"
    contact: Optional[str] = None


class ClaimRequestReview(BaseModel):
    action: str = Field(..., description="approve | reject | complete | cancel")


class ClaimRequestSchema(BaseModel):
    id: str
    listing_id: str
    listing_title: str
    claimant_id: str
    claimant_name: str
    claimant_org: Optional[str]
    claimant_contact: str
    donor_id: str
    donor_name: str
    donor_org: Optional[str]
    purpose: str
    pickup_time: str
    status: str
    created_at: str

    model_config = ConfigDict(from_attributes=True)


# AI Scans
class ScanRecordCreate(BaseModel):
    food_name: str
    display_name: Optional[str] = None
    confidence: float
    freshness_score: int
    category: Optional[str] = None


class ScanRecordSchema(BaseModel):
    id: str
    food_name: str
    display_name: str
    confidence: float
    freshness_score: int
    category: str
    timestamp: str
    user_id: str
    status: str

    model_config = ConfigDict(from_attributes=True)


# Audit Log
class AuditLogSchema(BaseModel):
    id: str
    action: str
    details: str
    user: str
    timestamp: str
    severity: str

    model_config = ConfigDict(from_attributes=True)


# Admin Platform Stats
class AdminStatsSchema(BaseModel):
    totalUsers: int
    userCount: int
    adminCount: int
    totalListings: int
    activeListings: int
    pendingRequests: int
    completedDonations: int
    flaggedListings: int
    totalKgRescued: int
    totalMealsRescued: int
    co2eSavedTonnes: str
    totalScans: int
