"""
PIVOT v2.0: Member utility functions
Includes member ID generation and initial password generation
"""

import secrets
import string
from sqlalchemy.orm import Session
from app.models import Member


def generate_member_id(db: Session) -> str:
    """
    Generate a unique member ID in format GGDS-XXXX

    Args:
        db: Database session to check for existing IDs

    Returns:
        Unique member ID string (e.g., "GGDS-0001", "GGDS-0002", etc.)
    """
    # Get the highest existing member number
    last_member = (
        db.query(Member)
        .filter(Member.member_id.like("GGDS-%"))
        .order_by(Member.member_id.desc())
        .first()
    )

    if last_member and last_member.member_id:
        # Extract number from "GGDS-0001" format
        try:
            last_number = int(last_member.member_id.split("-")[1])
            next_number = last_number + 1
        except (IndexError, ValueError):
            # If parsing fails, start from 1
            next_number = 1
    else:
        # No existing members, start from 1
        next_number = 1

    # Format as GGDS-XXXX with zero padding
    member_id = f"GGDS-{next_number:04d}"

    # Double-check uniqueness (in case of race conditions)
    while db.query(Member).filter(Member.member_id == member_id).first():
        next_number += 1
        member_id = f"GGDS-{next_number:04d}"

    return member_id


def generate_initial_password() -> str:
    """
    Generate a simple initial password for new members
    Format: GGDS2024 (simple and memorable)

    Returns:
        Simple password string
    """
    return "GGDS2024"
