from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import User, Case, Member
from app.schemas.case import (
    CaseCreate,
    CaseUpdate,
    CaseStatusUpdate,
    CaseResponse,
    CaseDetailResponse,
    CaseListResponse
)
from app.utils.dependencies import get_current_user, get_current_admin_user
from app.services.case_service import create_case_report
from app.services.email_service import email_service

router = APIRouter()


@router.post("", response_model=CaseDetailResponse, status_code=status.HTTP_201_CREATED)
async def submit_case(
    case_data: CaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submit a new case report

    - Creates case with all details
    - Adds verification contacts (village elder, chiefs, referee)
    - Sends confirmation email to reporter
    - Notifies admin of new case
    """
    try:
        # Create case
        new_case = create_case_report(db, current_user, case_data)

        # Send confirmation email to user
        await email_service.send_case_confirmation(
            current_user.email,
            new_case.case_id,
            new_case.case_type
        )

        # Notify admin of new case
        await email_service.send_admin_notification(
            new_case.case_id,
            new_case.case_type,
            new_case.affected_member_name,
            new_case.urgency_level
        )

        return new_case

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("", response_model=CaseListResponse)
async def list_cases(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status: Optional[str] = None,
    case_type: Optional[str] = None,
    urgency: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List cases

    - Regular users see only their reported cases
    - Admins see all cases
    - Supports filtering by status, type, urgency
    - Paginated results
    """
    query = db.query(Case)

    # Regular users can only see their own cases
    if current_user.role != "admin":
        query = query.filter(Case.reported_by_user_id == current_user.id)

    # Filters
    if status:
        query = query.filter(Case.status == status)
    if case_type:
        query = query.filter(Case.case_type == case_type)
    if urgency:
        query = query.filter(Case.urgency_level == urgency)

    # Get total count
    total = query.count()

    # Apply pagination
    cases = query.order_by(Case.created_at.desc()).offset(skip).limit(limit).all()

    return {
        "cases": cases,
        "total": total,
        "page": skip // limit + 1,
        "page_size": limit
    }


@router.get("/{case_id}", response_model=CaseDetailResponse)
async def get_case(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get case details by case ID

    Returns complete case information including verification contacts.
    Users can only view their own cases unless they are admin.
    """
    case = db.query(Case).filter(Case.case_id == case_id).first()

    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found"
        )

    # Check authorization
    if case.reported_by_user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this case"
        )

    return case


@router.patch("/{case_id}", response_model=CaseResponse)
async def update_case(
    case_id: str,
    case_update: CaseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update case information

    Users can update their own pending cases.
    Admins can update any case.
    """
    case = db.query(Case).filter(Case.case_id == case_id).first()

    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found"
        )

    # Check authorization
    if case.reported_by_user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this case"
        )

    # Regular users can only update pending cases
    if current_user.role != "admin" and case.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only update pending cases"
        )

    # Update fields
    update_data = case_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(case, field, value)

    db.commit()
    db.refresh(case)

    return case


@router.patch("/{case_id}/status", response_model=CaseResponse)
async def update_case_status(
    case_id: str,
    status_update: CaseStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Update case status (admin only)

    - Changes case status (pending, under_review, approved, rejected, closed)
    - Adds reviewer notes
    - Sets reviewed date
    - Sends status update email to case reporter
    """
    case = db.query(Case).filter(Case.case_id == case_id).first()

    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found"
        )

    # Update status and notes
    case.status = status_update.status
    if status_update.reviewer_notes:
        case.reviewer_notes = status_update.reviewer_notes

    # Override duration if provided
    if hasattr(status_update, 'duration_days') and status_update.duration_days:
        case.duration_days = status_update.duration_days

    # Set reviewed date if status changed from pending
    if case.status != "pending" and case.reviewed_date is None:
        from datetime import date
        case.reviewed_date = date.today()

    # When case is approved, set start_date and due_date
    if case.status == "approved" and case.start_date is None:
        from datetime import date, timedelta
        case.start_date = date.today() + timedelta(days=1)  # Starts tomorrow
        case.due_date = case.start_date + timedelta(days=case.duration_days)

    db.commit()
    db.refresh(case)

    # Send status update email
    reporter = db.query(User).filter(User.id == case.reported_by_user_id).first()
    if reporter:
        await email_service.send_case_status_update(
            reporter.email,
            case.case_id,
            case.status,
            case.reviewer_notes
        )

    return case


@router.delete("/{case_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_case(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a case

    - Users can delete their own pending cases
    - Admins can delete any case
    """
    case = db.query(Case).filter(Case.case_id == case_id).first()

    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case not found"
        )

    # Check authorization
    if case.reported_by_user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this case"
        )

    # Regular users can only delete pending cases
    if current_user.role != "admin" and case.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only delete pending cases"
        )

    db.delete(case)
    db.commit()

    return None
