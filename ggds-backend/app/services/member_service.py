from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional

from app.models import Member, FamilyMember, NextOfKin, User
from app.schemas.member import MemberCreate, FamilyMemberCreate, NextOfKinCreate


def generate_member_id(db: Session) -> str:
    """
    Generate unique member ID in format: GGDS-YYYY-XXX

    Example: GGDS-2025-001
    """
    year = datetime.now().year
    prefix = f"GGDS-{year}-"

    # Get the latest member for this year
    latest_member = (
        db.query(Member)
        .filter(Member.member_id.like(f"{prefix}%"))
        .order_by(Member.member_id.desc())
        .first()
    )

    if latest_member:
        # Extract number and increment
        last_number = int(latest_member.member_id.split("-")[-1])
        new_number = last_number + 1
    else:
        new_number = 1

    # Format as 3-digit number
    return f"{prefix}{new_number:03d}"


def create_member_registration(
    db: Session,
    user: User,
    member_data: MemberCreate
) -> Member:
    """
    Create a complete member registration with family and next of kin
    """
    # Generate unique member ID
    member_id = generate_member_id(db)

    # Create member
    new_member = Member(
        user_id=user.id,
        member_id=member_id,
        full_name=member_data.full_name,
        date_of_birth=member_data.date_of_birth,
        phone=member_data.phone,
        email=member_data.email,
        id_number=member_data.id_number,
        occupation=member_data.occupation,
        residence=member_data.residence,
        status="active"  # Default status
    )

    db.add(new_member)
    db.flush()  # Get the member ID before adding related records

    # Add nuclear family members
    for family_data in member_data.nuclear_family:
        if family_data.name:  # Only add if name is provided
            family_member = FamilyMember(
                member_id=new_member.id,
                family_type="nuclear",
                name=family_data.name,
                relationship=family_data.relationship,
                date_of_birth=family_data.date_of_birth
            )
            db.add(family_member)

    # Add siblings
    for sibling_data in member_data.siblings:
        if sibling_data.name:  # Only add if name is provided
            sibling = FamilyMember(
                member_id=new_member.id,
                family_type="sibling",
                name=sibling_data.name,
                relationship=sibling_data.relationship,
                date_of_birth=sibling_data.date_of_birth
            )
            db.add(sibling)

    # Add next of kin (2 required)
    for priority, kin_data in enumerate(member_data.next_of_kin, start=1):
        next_of_kin = NextOfKin(
            member_id=new_member.id,
            name=kin_data.name,
            relationship=kin_data.relationship,
            phone=kin_data.phone,
            email=kin_data.email,
            priority=priority
        )
        db.add(next_of_kin)

    db.commit()
    db.refresh(new_member)

    return new_member
