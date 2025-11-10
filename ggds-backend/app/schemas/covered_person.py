from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime
from uuid import UUID


class CoveredPersonCreate(BaseModel):
    """Schema for creating a covered person"""
    name: str = Field(..., min_length=1, max_length=255)
    relationship: str = Field(..., min_length=1, max_length=100)
    date_of_birth: Optional[date] = None
    id_number: Optional[str] = Field(None, max_length=100)


class CoveredPersonUpdate(BaseModel):
    """Schema for updating a covered person"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    relationship: Optional[str] = Field(None, min_length=1, max_length=100)
    date_of_birth: Optional[date] = None
    id_number: Optional[str] = Field(None, max_length=100)


class CoveredPersonResponse(BaseModel):
    """Schema for covered person response"""
    id: UUID
    member_id: UUID
    name: str
    relationship: str
    date_of_birth: Optional[date]
    id_number: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
