from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime
from uuid import UUID
from decimal import Decimal


class ContributionCreate(BaseModel):
    """Schema for creating a contribution"""
    member_id: str = Field(..., description="Member ID (GGDS-YYYY-XXX)")
    amount: Decimal = Field(..., gt=0, description="Contribution amount in KES")
    payment_date: date
    payment_method: str  # mpesa, bank_transfer, cash, cheque, other
    transaction_reference: Optional[str] = None
    notes: Optional[str] = None


class ContributionUpdate(BaseModel):
    """Schema for updating a contribution"""
    amount: Optional[Decimal] = Field(None, gt=0)
    payment_date: Optional[date] = None
    payment_method: Optional[str] = None
    transaction_reference: Optional[str] = None
    notes: Optional[str] = None


class ContributionVerify(BaseModel):
    """Schema for verifying a contribution"""
    status: str  # verified or rejected
    notes: Optional[str] = None


class ContributionResponse(BaseModel):
    """Schema for contribution response"""
    id: UUID
    member_id: str
    amount: Decimal
    payment_date: date
    payment_method: str
    transaction_reference: Optional[str]
    status: str
    verified_by_user_id: Optional[UUID]
    verified_date: Optional[date]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MemberContributionSummary(BaseModel):
    """Schema for member contribution summary"""
    member_id: str
    member_name: str
    total_contributions: Decimal
    last_contribution_date: Optional[date]
    contribution_count: int
    pending_amount: Decimal
    verified_amount: Decimal


class ContributionStats(BaseModel):
    """Schema for contribution statistics"""
    total_collected: Decimal
    total_pending: Decimal
    total_verified: Decimal
    total_rejected: Decimal
    contribution_count: int
    member_count: int
    average_contribution: Decimal
    by_payment_method: dict
    by_month: dict


class ContributionListResponse(BaseModel):
    """Schema for paginated contribution list"""
    contributions: list[ContributionResponse]
    total: int
    page: int
    page_size: int
