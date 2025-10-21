from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, List, Optional
from datetime import date, datetime, timedelta

from app.database import get_db
from app.models import User, Member, Case
from app.utils.dependencies import get_current_admin_user
from app.schemas.case import CaseStatusUpdate, CaseResponse
from app.schemas.member import MemberResponse

router = APIRouter()


@router.get("/stats")
async def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
) -> Dict[str, Any]:
    """
    Get overall system statistics (admin only)

    Returns:
    - Total members
    - Total cases
    - Cases by status
    - Cases by type
    - Recent activity
    """
    # Member statistics
    total_members = db.query(Member).count()
    active_members = db.query(Member).filter(Member.status == "active").count()
    pending_members = db.query(Member).filter(Member.status == "pending").count()

    # Case statistics
    total_cases = db.query(Case).count()
    pending_cases = db.query(Case).filter(Case.status == "pending").count()
    active_cases = db.query(Case).filter(Case.status.in_(["pending", "under_review"])).count()

    cases_by_status = dict(
        db.query(Case.status, func.count(Case.id))
        .group_by(Case.status)
        .all()
    )

    cases_by_type = dict(
        db.query(Case.case_type, func.count(Case.id))
        .group_by(Case.case_type)
        .all()
    )

    cases_by_urgency = dict(
        db.query(Case.urgency_level, func.count(Case.id))
        .group_by(Case.urgency_level)
        .all()
    )

    # TODO: Add amount field to Case model to track disbursements
    # For now, set to 0 as Case model doesn't have amount field
    total_disbursed = 0

    # Recent activity (last 30 days)
    thirty_days_ago = date.today() - timedelta(days=30)
    recent_cases = db.query(Case).filter(Case.submitted_date >= thirty_days_ago).count()
    recent_members = db.query(Member).filter(func.date(Member.created_at) >= thirty_days_ago).count()

    return {
        # Flat structure for frontend dashboard
        "total_members": total_members,
        "active_members": active_members,
        "pending_members": pending_members,
        "suspended_members": total_members - active_members - pending_members,
        "total_cases": total_cases,
        "pending_cases": pending_cases,
        "active_cases": active_cases,
        "total_disbursed": float(total_disbursed),
        "cases_by_status": cases_by_status,
        "cases_by_type": cases_by_type,
        "cases_by_urgency": cases_by_urgency,
        "recent_activity": {
            "cases_last_30_days": recent_cases,
            "members_last_30_days": recent_members
        }
    }


@router.get("/cases", response_model=List[CaseResponse])
async def get_all_cases(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    case_type: Optional[str] = None,
    urgency: Optional[str] = None,
    sort_by: str = Query("created_at", regex="^(created_at|urgency_level|status)$"),
    order: str = Query("desc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Get all cases with advanced filtering (admin only)

    Supports:
    - Pagination
    - Filter by status, type, urgency
    - Sorting by various fields
    """
    query = db.query(Case)

    # Apply filters
    if status:
        query = query.filter(Case.status == status)
    if case_type:
        query = query.filter(Case.case_type == case_type)
    if urgency:
        query = query.filter(Case.urgency_level == urgency)

    # Apply sorting
    sort_column = getattr(Case, sort_by)
    if order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    # Apply pagination
    cases = query.offset(skip).limit(limit).all()

    return cases


@router.get("/members", response_model=List[MemberResponse])
async def get_all_members(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Get all members with filtering (admin only)

    Supports:
    - Pagination
    - Filter by status
    - Search by name, email, member ID
    """
    query = db.query(Member)

    if status:
        query = query.filter(Member.status == status)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Member.full_name.ilike(search_pattern)) |
            (Member.email.ilike(search_pattern)) |
            (Member.member_id.ilike(search_pattern))
        )

    members = query.order_by(Member.created_at.desc()).offset(skip).limit(limit).all()

    return members


@router.patch("/cases/{case_id}/approve", response_model=CaseResponse)
async def approve_case(
    case_id: str,
    notes: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Approve a case (admin only)

    Sets case status to 'approved' and adds optional reviewer notes.
    """
    case = db.query(Case).filter(Case.case_id == case_id).first()

    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found"
        )

    case.status = "approved"
    case.reviewed_date = date.today()
    if notes:
        case.reviewer_notes = notes

    db.commit()
    db.refresh(case)

    # Send notification email
    from app.services.email_service import email_service
    reporter = db.query(User).filter(User.id == case.reported_by_user_id).first()
    if reporter:
        await email_service.send_case_status_update(
            reporter.email,
            case.case_id,
            "approved",
            notes
        )

    return case


@router.patch("/cases/{case_id}/reject", response_model=CaseResponse)
async def reject_case(
    case_id: str,
    reason: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Reject a case (admin only)

    Sets case status to 'rejected' and requires a reason.
    """
    case = db.query(Case).filter(Case.case_id == case_id).first()

    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found"
        )

    case.status = "rejected"
    case.reviewed_date = date.today()
    case.reviewer_notes = reason

    db.commit()
    db.refresh(case)

    # Send notification email
    from app.services.email_service import email_service
    reporter = db.query(User).filter(User.id == case.reported_by_user_id).first()
    if reporter:
        await email_service.send_case_status_update(
            reporter.email,
            case.case_id,
            "rejected",
            reason
        )

    return case


@router.patch("/members/{member_id}/activate", response_model=MemberResponse)
async def activate_member(
    member_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Activate a member account (admin only)

    Sets member status to 'active'.
    """
    member = db.query(Member).filter(Member.member_id == member_id).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )

    member.status = "active"
    db.commit()
    db.refresh(member)

    return member


@router.patch("/members/{member_id}/suspend", response_model=MemberResponse)
async def suspend_member(
    member_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Suspend a member account (admin only)

    Sets member status to 'suspended'.
    """
    member = db.query(Member).filter(Member.member_id == member_id).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )

    member.status = "suspended"
    db.commit()
    db.refresh(member)

    return member


@router.get("/reports/cases")
async def generate_cases_report(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Generate cases report with statistics (admin only)

    Optional date range filtering.
    Returns summary statistics for reporting purposes.
    """
    query = db.query(Case)

    if start_date:
        query = query.filter(Case.submitted_date >= start_date)
    if end_date:
        query = query.filter(Case.submitted_date <= end_date)

    cases = query.all()

    return {
        "period": {
            "start_date": start_date.isoformat() if start_date else None,
            "end_date": end_date.isoformat() if end_date else None
        },
        "total_cases": len(cases),
        "summary": {
            "by_status": dict(
                db.query(Case.status, func.count(Case.id))
                .filter(Case.submitted_date >= start_date if start_date else True)
                .filter(Case.submitted_date <= end_date if end_date else True)
                .group_by(Case.status)
                .all()
            ),
            "by_type": dict(
                db.query(Case.case_type, func.count(Case.id))
                .filter(Case.submitted_date >= start_date if start_date else True)
                .filter(Case.submitted_date <= end_date if end_date else True)
                .group_by(Case.case_type)
                .all()
            )
        },
        "cases": cases
    }
