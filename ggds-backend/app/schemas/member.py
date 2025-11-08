from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import date, datetime
from uuid import UUID


# PIVOT v2.0: Admin member creation schema
class AdminMemberCreate(BaseModel):
    """Schema for admin creating a new member account"""
    first_name: str = Field(..., min_length=1, max_length=100)
    middle_name: Optional[str] = Field(None, max_length=100)
    surname: str = Field(..., min_length=1, max_length=100)
    phone: str = Field(..., min_length=10, max_length=20)
    email: EmailStr


class AdminMemberCreateResponse(BaseModel):
    """Response after admin creates a member"""
    id: UUID
    member_id: str  # Generated GGDS-XXXX format
    full_name: str
    email: str
    phone: str
    initial_password: str  # Temporary password for first login
    created_at: datetime

    class Config:
        from_attributes = True


class FamilyMemberCreate(BaseModel):
    """Schema for creating a family member"""
    family_type: str  # nuclear or sibling
    name: str
    relationship: str
    date_of_birth: Optional[date] = None


class FamilyMemberResponse(FamilyMemberCreate):
    """Schema for family member response"""
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class NextOfKinCreate(BaseModel):
    """Schema for creating next of kin (PIVOT v2.0: Single next of kin)"""
    name: str
    relationship: str
    phone: str
    email: Optional[EmailStr] = None
    percentage: float = Field(default=100.0, ge=0.0, le=100.0)  # Percentage of benefit (0-100%)


class NextOfKinResponse(NextOfKinCreate):
    """Schema for next of kin response"""
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class MemberCreate(BaseModel):
    """Schema for creating a member registration"""
    # Personal Information
    full_name: str = Field(..., min_length=1)
    date_of_birth: date
    phone: str
    email: EmailStr
    id_number: str
    occupation: Optional[str] = None
    residence: Optional[str] = None

    # Family Members (up to 12 nuclear, 15 siblings)
    nuclear_family: List[FamilyMemberCreate] = Field(default=[], max_length=12)
    siblings: List[FamilyMemberCreate] = Field(default=[], max_length=15)

    # Next of Kin (2 required)
    next_of_kin: List[NextOfKinCreate] = Field(..., min_length=2, max_length=2)


class MemberUpdate(BaseModel):
    """Schema for updating member information"""
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    occupation: Optional[str] = None
    residence: Optional[str] = None


class MemberResponse(BaseModel):
    """Schema for member response"""
    id: UUID
    member_id: str
    full_name: str
    date_of_birth: date
    phone: str
    email: str
    id_number: str
    occupation: Optional[str]
    residence: Optional[str]
    status: str
    join_date: date
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MemberDetailResponse(MemberResponse):
    """Schema for detailed member response with family and next of kin"""
    family_members: List[FamilyMemberResponse]
    next_of_kin: List[NextOfKinResponse]

    class Config:
        from_attributes = True


# PIVOT v2.0: Profile completion schemas
class PersonalDetailsComplete(BaseModel):
    """Personal details for profile completion"""
    date_of_birth: date
    id_number: str = Field(..., min_length=1)
    occupation: Optional[str] = None
    residence: Optional[str] = None


class ParentCreate(BaseModel):
    """Parent information"""
    name: str = Field(..., min_length=1)
    relationship: str = "parent"
    date_of_birth: date


class NuclearFamilyMemberComplete(BaseModel):
    """Nuclear family member (spouse/child) for profile completion"""
    name: str = Field(..., min_length=1)
    relationship: str = Field(..., pattern="^(spouse|child)$")
    date_of_birth: date


class SiblingComplete(BaseModel):
    """Sibling information for profile completion"""
    name: str = Field(..., min_length=1)
    relationship: str = Field(..., pattern="^(brother|sister)$")
    date_of_birth: date


class CoveredPersonCreate(BaseModel):
    """Covered person (insured individual) information"""
    name: str = Field(..., min_length=1)
    relationship: str = Field(..., min_length=1)
    date_of_birth: Optional[date] = None
    id_number: Optional[str] = None


class ProfileCompletionData(BaseModel):
    """Complete profile data submission"""
    personal_details: PersonalDetailsComplete
    parents: List[ParentCreate] = Field(default=[], max_length=2)
    nuclear_family: List[NuclearFamilyMemberComplete] = Field(default=[], max_length=12)
    siblings: List[SiblingComplete] = Field(default=[], max_length=15)
    covered_persons: List[CoveredPersonCreate] = Field(default=[])  # PIVOT v2.0: Insured individuals
    next_of_kin: NextOfKinCreate  # PIVOT v2.0: Single next of kin with percentage


class ProfileCompletionResponse(BaseModel):
    """Response after profile completion"""
    success: bool
    message: str
    member_id: str
    profile_completed: bool

    class Config:
        from_attributes = True
