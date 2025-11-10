from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database import get_db
from app.models import User, Member, CoveredPerson
from app.schemas.covered_person import (
    CoveredPersonCreate,
    CoveredPersonUpdate,
    CoveredPersonResponse
)
from app.utils.dependencies import get_current_user

router = APIRouter()


@router.post("", response_model=CoveredPersonResponse, status_code=status.HTTP_201_CREATED)
async def add_covered_person(
    covered_person_data: CoveredPersonCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Add a covered person (insured individual)

    Members can add covered persons to their profile.
    """
    # Get member for current user
    member = db.query(Member).filter(Member.user_id == current_user.id).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member profile not found"
        )

    # Create covered person
    covered_person = CoveredPerson(
        member_id=member.id,
        name=covered_person_data.name,
        relationship=covered_person_data.relationship,
        date_of_birth=covered_person_data.date_of_birth,
        id_number=covered_person_data.id_number
    )

    db.add(covered_person)
    db.commit()
    db.refresh(covered_person)

    return covered_person


@router.get("", response_model=List[CoveredPersonResponse])
async def list_covered_persons(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all covered persons for the current member

    Returns all insured individuals registered under the member's profile.
    """
    # Get member for current user
    member = db.query(Member).filter(Member.user_id == current_user.id).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member profile not found"
        )

    covered_persons = db.query(CoveredPerson).filter(
        CoveredPerson.member_id == member.id
    ).all()

    return covered_persons


@router.get("/{covered_person_id}", response_model=CoveredPersonResponse)
async def get_covered_person(
    covered_person_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get details of a specific covered person

    Members can only view their own covered persons.
    """
    # Get member for current user
    member = db.query(Member).filter(Member.user_id == current_user.id).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member profile not found"
        )

    covered_person = db.query(CoveredPerson).filter(
        CoveredPerson.id == covered_person_id,
        CoveredPerson.member_id == member.id
    ).first()

    if not covered_person:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Covered person not found"
        )

    return covered_person


@router.put("/{covered_person_id}", response_model=CoveredPersonResponse)
async def update_covered_person(
    covered_person_id: UUID,
    update_data: CoveredPersonUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a covered person's information

    Members can update their own covered persons.
    """
    # Get member for current user
    member = db.query(Member).filter(Member.user_id == current_user.id).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member profile not found"
        )

    covered_person = db.query(CoveredPerson).filter(
        CoveredPerson.id == covered_person_id,
        CoveredPerson.member_id == member.id
    ).first()

    if not covered_person:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Covered person not found"
        )

    # Update fields
    update_dict = update_data.model_dump(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(covered_person, field, value)

    db.commit()
    db.refresh(covered_person)

    return covered_person


@router.delete("/{covered_person_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_covered_person(
    covered_person_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a covered person

    Members can remove covered persons from their profile.
    """
    # Get member for current user
    member = db.query(Member).filter(Member.user_id == current_user.id).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member profile not found"
        )

    covered_person = db.query(CoveredPerson).filter(
        CoveredPerson.id == covered_person_id,
        CoveredPerson.member_id == member.id
    ).first()

    if not covered_person:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Covered person not found"
        )

    db.delete(covered_person)
    db.commit()

    return None
