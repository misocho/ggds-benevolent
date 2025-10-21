from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class UserRegister(BaseModel):
    """Schema for user registration"""
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=1)


class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr
    password: str


class TokenUser(BaseModel):
    """Schema for user data in token response"""
    id: str
    email: str
    role: str
    is_active: bool


class Token(BaseModel):
    """Schema for authentication token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: Optional[TokenUser] = None


class TokenRefresh(BaseModel):
    """Schema for refreshing access token"""
    refresh_token: str


class UserResponse(BaseModel):
    """Schema for user response"""
    id: UUID
    email: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class PasswordResetRequest(BaseModel):
    """Schema for password reset request"""
    email: EmailStr


class PasswordReset(BaseModel):
    """Schema for password reset with token"""
    token: str
    new_password: str = Field(..., min_length=8)
