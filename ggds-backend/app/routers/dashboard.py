from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any

from app.database import get_db
from app.models import User, Member, Case
from app.utils.dependencies import get_current_user
from app.schemas.member import MemberDetailResponse
from app.schemas.case import CaseResponse

router = APIRouter()


@router.get("/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get dashboard statistics for current user

    Returns:
    - Total cases submitted
    - Cases by status (pending, approved, rejected, etc.)
    - Recent cases
    - Member information
    """
    # Get member info
    member = db.query(Member).filter(Member.user_id == current_user.id).first()

    if not member:
        return {
            "has_member_profile": False,
            "message": "Please complete member registration to access full dashboard"
        }

    # Get case statistics
    total_cases = db.query(Case).filter(Case.reported_by_user_id == current_user.id).count()

    cases_by_status = dict(
        db.query(Case.status, func.count(Case.id))
        .filter(Case.reported_by_user_id == current_user.id)
        .group_by(Case.status)
        .all()
    )

    # Get recent cases (last 5)
    recent_cases = (
        db.query(Case)
        .filter(Case.reported_by_user_id == current_user.id)
        .order_by(Case.created_at.desc())
        .limit(5)
        .all()
    )

    return {
        "has_member_profile": True,
        "member_id": member.member_id,
        "member_name": member.full_name,
        "member_status": member.status,
        "statistics": {
            "total_cases": total_cases,
            "pending_cases": cases_by_status.get("pending", 0),
            "under_review_cases": cases_by_status.get("under_review", 0),
            "approved_cases": cases_by_status.get("approved", 0),
            "rejected_cases": cases_by_status.get("rejected", 0),
            "closed_cases": cases_by_status.get("closed", 0)
        },
        "recent_cases": [
            {
                "case_id": case.case_id,
                "case_type": case.case_type,
                "status": case.status,
                "urgency_level": case.urgency_level,
                "submitted_date": case.submitted_date.isoformat()
            }
            for case in recent_cases
        ]
    }


@router.get("/profile", response_model=MemberDetailResponse)
async def get_dashboard_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get current user's complete member profile for dashboard

    Returns detailed member information including family and next of kin.
    """
    member = db.query(Member).filter(Member.user_id == current_user.id).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member profile not found. Please complete registration."
        )

    return member


@router.get("/cases")
async def get_dashboard_cases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all cases for current user

    Returns all cases submitted by the authenticated user,
    sorted by most recent first.
    """
    cases = (
        db.query(Case)
        .filter(Case.reported_by_user_id == current_user.id)
        .order_by(Case.created_at.desc())
        .all()
    )

    return {
        "total": len(cases),
        "cases": cases
    }
