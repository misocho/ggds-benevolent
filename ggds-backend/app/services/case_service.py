from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional

from app.models import Case, VerificationContact, Member, User
from app.schemas.case import CaseCreate, VerificationContactCreate


def generate_case_id(db: Session) -> str:
    """
    Generate unique case ID in format: CASE-XXX

    Example: CASE-001, CASE-002, etc.
    """
    # Get the latest case
    latest_case = (
        db.query(Case)
        .order_by(Case.case_id.desc())
        .first()
    )

    if latest_case:
        # Extract number and increment
        last_number = int(latest_case.case_id.split("-")[-1])
        new_number = last_number + 1
    else:
        new_number = 1

    # Format as 3-digit number
    return f"CASE-{new_number:03d}"


def create_case_report(
    db: Session,
    user: User,
    case_data: CaseCreate
) -> Case:
    """
    Create a new case report with verification contacts
    """
    # Find member by member_id
    member = db.query(Member).filter(Member.member_id == case_data.member_id).first()
    if not member:
        raise ValueError(f"Member with ID {case_data.member_id} not found")

    # Generate unique case ID
    case_id = generate_case_id(db)

    # Create case
    new_case = Case(
        case_id=case_id,
        member_id=member.id,
        reported_by_user_id=user.id,
        case_type=case_data.case_type,
        description=case_data.description,
        reporting_reason=case_data.reporting_reason,
        incident_date=case_data.incident_date,
        urgency_level=case_data.urgency_level,
        affected_member_name=case_data.affected_member_name,
        relationship_to_reporter=case_data.relationship_to_reporter,
        status="pending"
    )

    db.add(new_case)
    db.flush()  # Get the case ID

    # Add verification contacts
    verification_data = [
        (case_data.village_elder, "village_elder"),
        (case_data.assistant_chief, "assistant_chief"),
        (case_data.chief, "chief"),
        (case_data.referee, "referee")
    ]

    for contact_data, contact_type in verification_data:
        contact = VerificationContact(
            case_id=new_case.id,
            contact_type=contact_type,
            name=contact_data.name,
            phone=contact_data.phone,
            email=contact_data.email,
            relationship_to_member=contact_data.relationship_to_member
        )
        db.add(contact)

    db.commit()
    db.refresh(new_case)

    return new_case
