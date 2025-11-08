"""
SQLAlchemy models for GGDS Benevolent Fund
"""

from app.models.user import User, UserRole
from app.models.member import Member, MemberStatus
from app.models.family_member import FamilyMember, FamilyType, Relationship
from app.models.next_of_kin import NextOfKin
from app.models.case import Case, CaseType, UrgencyLevel, CaseStatus, RelationshipType  # PIVOT v2.0: Added RelationshipType
from app.models.verification_contact import VerificationContact, ContactType
from app.models.document import Document
from app.models.contribution import Contribution, ContributionStatus  # PIVOT v2.0: Removed PaymentMethod
from app.models.probation import Probation  # PIVOT v2.0: New model
from app.models.covered_person import CoveredPerson  # PIVOT v2.0: Insured individuals

__all__ = [
    "User",
    "UserRole",
    "Member",
    "MemberStatus",
    "FamilyMember",
    "FamilyType",
    "Relationship",
    "NextOfKin",
    "Case",
    "CaseType",
    "UrgencyLevel",
    "CaseStatus",
    "RelationshipType",  # PIVOT v2.0
    "VerificationContact",
    "ContactType",
    "Document",
    "Contribution",
    "ContributionStatus",
    "Probation",  # PIVOT v2.0
    "CoveredPerson",  # PIVOT v2.0
]
