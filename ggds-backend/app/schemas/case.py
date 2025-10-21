from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import date, datetime
from uuid import UUID


class VerificationContactCreate(BaseModel):
    """Schema for creating a verification contact"""
    contact_type: str  # village_elder, assistant_chief, chief, referee
    name: str
    phone: str
    email: Optional[EmailStr] = None
    relationship_to_member: Optional[str] = None  # For referee only


class VerificationContactResponse(VerificationContactCreate):
    """Schema for verification contact response"""
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class CaseCreate(BaseModel):
    """Schema for creating a case report"""
    # Case Details
    case_type: str  # bereavement, medical_emergency, etc.
    description: str = Field(..., min_length=10)
    reporting_reason: str = Field(..., min_length=10)
    incident_date: date
    urgency_level: str = "medium"  # low, medium, high, critical

    # Affected Member Information
    member_id: str  # GGDS member ID
    affected_member_name: str
    relationship_to_reporter: str

    # Verification Contacts (all 4 required)
    village_elder: VerificationContactCreate
    assistant_chief: VerificationContactCreate
    chief: VerificationContactCreate
    referee: VerificationContactCreate


class CaseUpdate(BaseModel):
    """Schema for updating a case"""
    description: Optional[str] = None
    reporting_reason: Optional[str] = None
    urgency_level: Optional[str] = None


class CaseStatusUpdate(BaseModel):
    """Schema for updating case status (admin only)"""
    status: str  # pending, under_review, approved, rejected, closed
    reviewer_notes: Optional[str] = None


class CaseResponse(BaseModel):
    """Schema for case response"""
    id: UUID
    case_id: str
    case_type: str
    description: str
    reporting_reason: str
    incident_date: date
    urgency_level: str
    affected_member_name: str
    relationship_to_reporter: str
    status: str
    submitted_date: date
    reviewed_date: Optional[date]
    reviewer_notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CaseDetailResponse(CaseResponse):
    """Schema for detailed case response with verification contacts"""
    verification_contacts: List[VerificationContactResponse]

    class Config:
        from_attributes = True


class CaseListResponse(BaseModel):
    """Schema for paginated case list response"""
    cases: List[CaseResponse]
    total: int
    page: int
    page_size: int
