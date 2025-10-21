from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import User, Member
from app.schemas.member import (
    MemberCreate,
    MemberUpdate,
    MemberResponse,
    MemberDetailResponse
)
from app.utils.dependencies import get_current_user, get_current_admin_user
from app.services.member_service import create_member_registration
from app.services.email_service import email_service

router = APIRouter()


@router.post("", response_model=MemberDetailResponse, status_code=status.HTTP_201_CREATED)
async def register_member(
    member_data: MemberCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Register a new member with family and next of kin information

    - Creates member profile
    - Adds nuclear family members (up to 12)
    - Adds siblings (up to 15)
    - Adds next of kin contacts (2 required)
    - Generates unique member ID (GGDS-YYYY-XXX)
    - Sends welcome email
    """
    # Check if user already has a member profile
    existing_member = db.query(Member).filter(Member.user_id == current_user.id).first()
    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has a member profile"
        )

    # Create member registration
    new_member = create_member_registration(db, current_user, member_data)

    # Send welcome email
    await email_service.send_welcome_email(
        new_member.email,
        new_member.full_name,
        new_member.member_id
    )

    return new_member


@router.get("", response_model=List[MemberResponse])
async def list_members(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    List all members (admin only)

    - Supports pagination with skip/limit
    - Filter by status (pending, active, inactive)
    - Search by name, email, or member ID
    """
    query = db.query(Member)

    # Filter by status
    if status:
        query = query.filter(Member.status == status)

    # Search functionality
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Member.full_name.ilike(search_pattern)) |
            (Member.email.ilike(search_pattern)) |
            (Member.member_id.ilike(search_pattern))
        )

    # Apply pagination
    members = query.offset(skip).limit(limit).all()

    return members


@router.get("/{member_id}", response_model=MemberDetailResponse)
async def get_member(
    member_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get member details by member ID

    Returns complete member information including family and next of kin.
    Users can only view their own profile unless they are admin.
    """
    member = db.query(Member).filter(Member.member_id == member_id).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )

    # Check authorization (own profile or admin)
    if member.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this member profile"
        )

    return member


@router.get("/me/profile", response_model=MemberDetailResponse)
async def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get current user's member profile

    Returns complete member information for the authenticated user.
    """
    member = db.query(Member).filter(Member.user_id == current_user.id).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member profile not found. Please complete registration."
        )

    return member


@router.patch("/{member_id}", response_model=MemberResponse)
async def update_member(
    member_id: str,
    member_update: MemberUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update member information

    Users can update their own profile.
    Admins can update any member profile.
    """
    member = db.query(Member).filter(Member.member_id == member_id).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )

    # Check authorization
    if member.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this member profile"
        )

    # Update fields that were provided
    update_data = member_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(member, field, value)

    db.commit()
    db.refresh(member)

    return member


@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_member(
    member_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Soft delete a member (admin only)

    Sets member status to inactive instead of deleting from database.
    """
    member = db.query(Member).filter(Member.member_id == member_id).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )

    # Soft delete - set status to inactive
    member.status = "inactive"
    db.commit()

    return None
