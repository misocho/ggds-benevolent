from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Optional
from datetime import date, datetime
from decimal import Decimal

from app.database import get_db
from app.models import User, Member, Contribution
from app.schemas.contribution import (
    ContributionCreate,
    ContributionUpdate,
    ContributionVerify,
    ContributionResponse,
    MemberContributionSummary,
    ContributionStats,
    ContributionListResponse
)
from app.utils.dependencies import get_current_user, get_current_admin_user

router = APIRouter()


@router.post("", response_model=ContributionResponse, status_code=status.HTTP_201_CREATED)
async def record_contribution(
    contribution_data: ContributionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Record a new contribution (admin only)

    Creates a new contribution record for a member.
    """
    # Verify member exists
    member = db.query(Member).filter(Member.member_id == contribution_data.member_id).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Member {contribution_data.member_id} not found"
        )

    # Create contribution
    new_contribution = Contribution(
        member_id=contribution_data.member_id,
        amount=contribution_data.amount,
        payment_date=contribution_data.payment_date,
        payment_method=contribution_data.payment_method,
        transaction_reference=contribution_data.transaction_reference,
        notes=contribution_data.notes,
        status="pending"
    )

    db.add(new_contribution)
    db.commit()
    db.refresh(new_contribution)

    return new_contribution


@router.get("", response_model=ContributionListResponse)
async def list_contributions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    member_id: Optional[str] = None,
    status: Optional[str] = None,
    payment_method: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    List all contributions with filtering (admin only)

    Supports:
    - Pagination
    - Filter by member, status, payment method, date range
    """
    query = db.query(Contribution)

    # Apply filters
    if member_id:
        query = query.filter(Contribution.member_id == member_id)
    if status:
        query = query.filter(Contribution.status == status)
    if payment_method:
        query = query.filter(Contribution.payment_method == payment_method)
    if start_date:
        query = query.filter(Contribution.payment_date >= start_date)
    if end_date:
        query = query.filter(Contribution.payment_date <= end_date)

    # Get total count
    total = query.count()

    # Apply pagination and ordering
    contributions = query.order_by(Contribution.payment_date.desc()).offset(skip).limit(limit).all()

    return {
        "contributions": contributions,
        "total": total,
        "page": skip // limit + 1,
        "page_size": limit
    }


@router.get("/member/{member_id}", response_model=List[ContributionResponse])
async def get_member_contributions(
    member_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get contribution history for a specific member

    Members can view their own contributions.
    Admins can view any member's contributions.
    """
    # Verify member exists
    member = db.query(Member).filter(Member.member_id == member_id).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Member {member_id} not found"
        )

    # Check authorization (own profile or admin)
    if current_user.role != "admin":
        user_member = db.query(Member).filter(Member.user_id == current_user.id).first()
        if not user_member or user_member.member_id != member_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this member's contributions"
            )

    contributions = db.query(Contribution).filter(
        Contribution.member_id == member_id
    ).order_by(Contribution.payment_date.desc()).all()

    return contributions


@router.get("/member/{member_id}/summary", response_model=MemberContributionSummary)
async def get_member_contribution_summary(
    member_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get contribution summary for a specific member
    """
    # Verify member exists
    member = db.query(Member).filter(Member.member_id == member_id).first()
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Member {member_id} not found"
        )

    # Check authorization
    if current_user.role != "admin":
        user_member = db.query(Member).filter(Member.user_id == current_user.id).first()
        if not user_member or user_member.member_id != member_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this member's contributions"
            )

    # Calculate summary
    contributions = db.query(Contribution).filter(Contribution.member_id == member_id).all()

    total_contributions = sum(c.amount for c in contributions)
    pending_amount = sum(c.amount for c in contributions if c.status == "pending")
    verified_amount = sum(c.amount for c in contributions if c.status == "verified")
    last_contribution = max([c.payment_date for c in contributions]) if contributions else None

    return {
        "member_id": member_id,
        "member_name": member.full_name,
        "total_contributions": total_contributions,
        "last_contribution_date": last_contribution,
        "contribution_count": len(contributions),
        "pending_amount": pending_amount,
        "verified_amount": verified_amount
    }


@router.get("/stats", response_model=ContributionStats)
async def get_contribution_stats(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Get contribution statistics (admin only)

    Returns overall contribution statistics with optional date range filtering.
    """
    query = db.query(Contribution)

    # Apply date filters
    if start_date:
        query = query.filter(Contribution.payment_date >= start_date)
    if end_date:
        query = query.filter(Contribution.payment_date <= end_date)

    contributions = query.all()

    # Calculate statistics
    total_collected = sum(c.amount for c in contributions)
    total_pending = sum(c.amount for c in contributions if c.status == "pending")
    total_verified = sum(c.amount for c in contributions if c.status == "verified")
    total_rejected = sum(c.amount for c in contributions if c.status == "rejected")

    # By payment method
    by_payment_method = {}
    for method in ["mpesa", "bank_transfer", "cash", "cheque", "other"]:
        method_contributions = [c for c in contributions if c.payment_method == method]
        if method_contributions:
            by_payment_method[method] = {
                "count": len(method_contributions),
                "amount": float(sum(c.amount for c in method_contributions))
            }

    # By month
    by_month = {}
    for contribution in contributions:
        month_key = contribution.payment_date.strftime("%Y-%m")
        if month_key not in by_month:
            by_month[month_key] = {
                "count": 0,
                "amount": 0
            }
        by_month[month_key]["count"] += 1
        by_month[month_key]["amount"] += float(contribution.amount)

    # Unique members who contributed
    unique_members = len(set(c.member_id for c in contributions))

    return {
        "total_collected": total_collected,
        "total_pending": total_pending,
        "total_verified": total_verified,
        "total_rejected": total_rejected,
        "contribution_count": len(contributions),
        "member_count": unique_members,
        "average_contribution": total_collected / len(contributions) if contributions else 0,
        "by_payment_method": by_payment_method,
        "by_month": by_month
    }


@router.patch("/{contribution_id}/verify", response_model=ContributionResponse)
async def verify_contribution(
    contribution_id: str,
    verify_data: ContributionVerify,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Verify or reject a contribution (admin only)

    Sets contribution status to 'verified' or 'rejected' and records admin who verified.
    """
    contribution = db.query(Contribution).filter(Contribution.id == contribution_id).first()

    if not contribution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contribution not found"
        )

    # Update contribution
    contribution.status = verify_data.status
    contribution.verified_by_user_id = current_user.id
    contribution.verified_date = date.today()

    if verify_data.notes:
        contribution.notes = f"{contribution.notes}\n\n[Admin notes]: {verify_data.notes}" if contribution.notes else f"[Admin notes]: {verify_data.notes}"

    db.commit()
    db.refresh(contribution)

    return contribution


@router.patch("/{contribution_id}", response_model=ContributionResponse)
async def update_contribution(
    contribution_id: str,
    update_data: ContributionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Update contribution details (admin only)

    Only pending contributions can be updated.
    """
    contribution = db.query(Contribution).filter(Contribution.id == contribution_id).first()

    if not contribution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contribution not found"
        )

    if contribution.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only update pending contributions"
        )

    # Update fields
    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(contribution, field, value)

    db.commit()
    db.refresh(contribution)

    return contribution


@router.delete("/{contribution_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contribution(
    contribution_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Delete a contribution (admin only)

    Only pending contributions can be deleted.
    """
    contribution = db.query(Contribution).filter(Contribution.id == contribution_id).first()

    if not contribution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contribution not found"
        )

    if contribution.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only delete pending contributions"
        )

    db.delete(contribution)
    db.commit()

    return None
