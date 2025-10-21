from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import date, datetime
from uuid import UUID


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
    """Schema for creating next of kin"""
    name: str
    relationship: str
    phone: str
    email: Optional[EmailStr] = None
    priority: int = Field(..., ge=1, le=2)


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
