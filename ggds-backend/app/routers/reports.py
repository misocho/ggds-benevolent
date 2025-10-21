from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import Dict, Any, List, Optional
from datetime import date, datetime, timedelta

from app.database import get_db
from app.models import User, Member, Case, Contribution
from app.utils.dependencies import get_current_admin_user

router = APIRouter()


@router.get("/members")
async def get_member_reports(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
) -> Dict[str, Any]:
    """
    Get member reports and statistics (admin only)

    Returns:
    - Total members by status
    - Registration trends by month
    - Recent registrations
    """
    # Set default date range (last 12 months)
    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = end_date - timedelta(days=365)

    # Total members by status
    status_distribution = dict(
        db.query(Member.status, func.count(Member.id))
        .group_by(Member.status)
        .all()
    )

    # Registration trends by month (last 12 months)
    monthly_registrations = db.query(
        extract('year', Member.join_date).label('year'),
        extract('month', Member.join_date).label('month'),
        func.count(Member.id).label('count')
    ).filter(
        Member.join_date >= start_date,
        Member.join_date <= end_date
    ).group_by('year', 'month').order_by('year', 'month').all()

    registration_trends = [
        {
            "period": f"{int(row.year)}-{int(row.month):02d}",
            "count": row.count
        }
        for row in monthly_registrations
    ]

    # Recent registrations (last 30 days)
    thirty_days_ago = date.today() - timedelta(days=30)
    recent_members = db.query(Member).filter(
        Member.join_date >= thirty_days_ago
    ).order_by(Member.join_date.desc()).limit(10).all()

    recent_registrations = [
        {
            "member_id": member.member_id,
            "full_name": member.full_name,
            "email": member.email,
            "status": member.status,
            "join_date": member.join_date.isoformat()
        }
        for member in recent_members
    ]

    # Total counts
    total_members = db.query(Member).count()
    active_members = db.query(Member).filter(Member.status == "active").count()
    pending_members = db.query(Member).filter(Member.status == "pending").count()
    suspended_members = db.query(Member).filter(Member.status == "suspended").count()

    return {
        "summary": {
            "total_members": total_members,
            "active_members": active_members,
            "pending_members": pending_members,
            "suspended_members": suspended_members,
            "inactive_members": total_members - active_members - pending_members - suspended_members
        },
        "status_distribution": status_distribution,
        "registration_trends": registration_trends,
        "recent_registrations": recent_registrations
    }


@router.get("/cases")
async def get_case_reports(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
) -> Dict[str, Any]:
    """
    Get case reports and statistics (admin only)

    Returns:
    - Cases by status, type, and urgency
    - Monthly submission trends
    - Recent cases
    """
    # Set default date range (last 12 months)
    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = end_date - timedelta(days=365)

    # Cases by status
    cases_by_status = dict(
        db.query(Case.status, func.count(Case.id))
        .group_by(Case.status)
        .all()
    )

    # Cases by type
    cases_by_type = dict(
        db.query(Case.case_type, func.count(Case.id))
        .group_by(Case.case_type)
        .all()
    )

    # Cases by urgency
    cases_by_urgency = dict(
        db.query(Case.urgency_level, func.count(Case.id))
        .group_by(Case.urgency_level)
        .all()
    )

    # Monthly submission trends
    monthly_submissions = db.query(
        extract('year', Case.submitted_date).label('year'),
        extract('month', Case.submitted_date).label('month'),
        func.count(Case.id).label('count')
    ).filter(
        Case.submitted_date >= start_date,
        Case.submitted_date <= end_date
    ).group_by('year', 'month').order_by('year', 'month').all()

    submission_trends = [
        {
            "period": f"{int(row.year)}-{int(row.month):02d}",
            "count": row.count
        }
        for row in monthly_submissions
    ]

    # Recent cases (last 30 days)
    thirty_days_ago = date.today() - timedelta(days=30)
    recent_cases = db.query(Case).filter(
        Case.submitted_date >= thirty_days_ago
    ).order_by(Case.submitted_date.desc()).limit(10).all()

    recent_cases_list = [
        {
            "case_id": case.case_id,
            "case_type": case.case_type,
            "urgency_level": case.urgency_level,
            "status": case.status,
            "submitted_date": case.submitted_date.isoformat()
        }
        for case in recent_cases
    ]

    # Total counts
    total_cases = db.query(Case).count()
    pending_cases = db.query(Case).filter(Case.status == "pending").count()
    approved_cases = db.query(Case).filter(Case.status == "approved").count()
    rejected_cases = db.query(Case).filter(Case.status == "rejected").count()

    return {
        "summary": {
            "total_cases": total_cases,
            "pending_cases": pending_cases,
            "approved_cases": approved_cases,
            "rejected_cases": rejected_cases,
            "under_review_cases": total_cases - pending_cases - approved_cases - rejected_cases
        },
        "cases_by_status": cases_by_status,
        "cases_by_type": cases_by_type,
        "cases_by_urgency": cases_by_urgency,
        "submission_trends": submission_trends,
        "recent_cases": recent_cases_list
    }


@router.get("/financial")
async def get_financial_reports(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
) -> Dict[str, Any]:
    """
    Get financial reports and statistics (admin only)

    Returns:
    - Contribution summary
    - Payment method distribution
    - Monthly collection trends
    - Top contributors
    """
    # Set default date range (last 12 months)
    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = end_date - timedelta(days=365)

    # Total contributions
    total_collected = db.query(func.sum(Contribution.amount)).scalar() or 0
    total_verified = db.query(func.sum(Contribution.amount)).filter(
        Contribution.status == "verified"
    ).scalar() or 0
    total_pending = db.query(func.sum(Contribution.amount)).filter(
        Contribution.status == "pending"
    ).scalar() or 0
    total_rejected = db.query(func.sum(Contribution.amount)).filter(
        Contribution.status == "rejected"
    ).scalar() or 0

    # Contribution counts
    contribution_count = db.query(Contribution).count()
    verified_count = db.query(Contribution).filter(Contribution.status == "verified").count()
    pending_count = db.query(Contribution).filter(Contribution.status == "pending").count()

    # Payment method distribution
    payment_methods = dict(
        db.query(Contribution.payment_method, func.count(Contribution.id))
        .group_by(Contribution.payment_method)
        .all()
    )

    payment_method_amounts = dict(
        db.query(Contribution.payment_method, func.sum(Contribution.amount))
        .filter(Contribution.status == "verified")
        .group_by(Contribution.payment_method)
        .all()
    )

    # Monthly collection trends
    monthly_collections = db.query(
        extract('year', Contribution.payment_date).label('year'),
        extract('month', Contribution.payment_date).label('month'),
        func.sum(Contribution.amount).label('total'),
        func.count(Contribution.id).label('count')
    ).filter(
        Contribution.payment_date >= start_date,
        Contribution.payment_date <= end_date,
        Contribution.status == "verified"
    ).group_by('year', 'month').order_by('year', 'month').all()

    collection_trends = [
        {
            "period": f"{int(row.year)}-{int(row.month):02d}",
            "amount": float(row.total),
            "count": row.count
        }
        for row in monthly_collections
    ]

    # Top contributors
    top_contributors = db.query(
        Contribution.member_id,
        func.sum(Contribution.amount).label('total_contributed'),
        func.count(Contribution.id).label('contribution_count')
    ).filter(
        Contribution.status == "verified"
    ).group_by(Contribution.member_id).order_by(
        func.sum(Contribution.amount).desc()
    ).limit(10).all()

    top_contributors_list = [
        {
            "member_id": row.member_id,
            "total_contributed": float(row.total_contributed),
            "contribution_count": row.contribution_count
        }
        for row in top_contributors
    ]

    return {
        "summary": {
            "total_collected": float(total_collected),
            "total_verified": float(total_verified),
            "total_pending": float(total_pending),
            "total_rejected": float(total_rejected),
            "contribution_count": contribution_count,
            "verified_count": verified_count,
            "pending_count": pending_count,
            "average_contribution": float(total_collected / contribution_count) if contribution_count > 0 else 0
        },
        "payment_method_distribution": {
            "by_count": payment_methods,
            "by_amount": {k: float(v) for k, v in payment_method_amounts.items()}
        },
        "collection_trends": collection_trends,
        "top_contributors": top_contributors_list
    }
