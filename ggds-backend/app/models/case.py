import uuid
from sqlalchemy import Column, String, Text, Date, DateTime, Enum, ForeignKey, Integer, Float, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship as sa_relationship
import enum
from app.database import Base


# PIVOT v2.0: Immediate family only
class RelationshipType(str, enum.Enum):
    """Immediate family relationship types (PIVOT v2.0)"""
    MOTHER = "mother"
    FATHER = "father"
    SPOUSE = "spouse"
    SON = "son"
    DAUGHTER = "daughter"


class CaseType(str, enum.Enum):
    """Type of support case"""
    BEREAVEMENT = "bereavement"
    MEDICAL_EMERGENCY = "medical_emergency"
    DISABILITY = "disability"
    FIRE_DAMAGE = "fire_damage"
    NATURAL_DISASTER = "natural_disaster"
    OTHER = "other"


class UrgencyLevel(str, enum.Enum):
    """Case urgency levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class CaseStatus(str, enum.Enum):
    """Case processing status (PIVOT v2.0 updated)"""
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    DISBURSED = "disbursed"  # PIVOT v2.0: Funds disbursed to member
    COMPLETED = "completed"  # PIVOT v2.0: Member confirmed receipt


class Case(Base):
    """Support case model"""
    __tablename__ = "cases"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(String(50), unique=True, nullable=False, index=True)  # CASE-001
    # PIVOT v2.0: Auto-incrementing case number
    case_number = Column(Integer, unique=True, nullable=False, index=True)  # 1, 2, 3, etc.
    member_id = Column(UUID(as_uuid=True), ForeignKey("members.id"), nullable=False)
    reported_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # Case Details
    case_type = Column(Enum(CaseType), nullable=False)
    description = Column(Text, nullable=False)
    reporting_reason = Column(Text, nullable=False)
    incident_date = Column(Date, nullable=False)
    urgency_level = Column(Enum(UrgencyLevel), default=UrgencyLevel.MEDIUM, nullable=False)

    # PIVOT v2.0: Bereavement details (immediate family only)
    deceased_name = Column(String(255), nullable=True)  # Name of deceased (for bereavement cases)
    relationship = Column(Enum(RelationshipType), nullable=True)  # Immediate family relationship
    date_of_death = Column(Date, nullable=True)  # Date of death (for bereavement cases)

    # Affected Member Information (legacy - keep for backward compatibility)
    affected_member_name = Column(String(255), nullable=True)
    relationship_to_reporter = Column(String(100), nullable=True)

    # Status & Review
    status = Column(Enum(CaseStatus), default=CaseStatus.PENDING, nullable=False)
    submitted_date = Column(Date, server_default=func.current_date(), nullable=False)
    reviewed_date = Column(Date, nullable=True)
    reviewer_notes = Column(Text, nullable=True)
    verification_notes = Column(Text, nullable=True)  # PIVOT v2.0: Admin verification notes

    # PIVOT v2.0: Contribution tracking
    total_amount_required = Column(Float, nullable=True)  # Total amount to be collected
    total_amount_collected = Column(Float, default=0.0, nullable=False)  # Amount collected so far
    disbursement_date = Column(DateTime(timezone=True), nullable=True)  # When funds were disbursed
    confirmed_receipt = Column(Boolean, default=False, nullable=False)  # Member confirmed receipt

    # Case duration tracking
    duration_days = Column(Integer, default=14, nullable=False)  # Default 2 weeks
    start_date = Column(Date, nullable=True)  # Set when case is approved (day after approval)
    due_date = Column(Date, nullable=True)  # Calculated: start_date + duration_days

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    member = sa_relationship("Member", back_populates="cases", foreign_keys=[member_id])
    reported_by_user = sa_relationship("User", back_populates="cases_reported", foreign_keys=[reported_by_user_id])
    verification_contacts = sa_relationship("VerificationContact", back_populates="case", cascade="all, delete-orphan")
    documents = sa_relationship("Document", back_populates="case", cascade="all, delete-orphan")
    # PIVOT v2.0: New relationships
    contributions = sa_relationship("Contribution", back_populates="case", cascade="all, delete-orphan")
    probations = sa_relationship("Probation", back_populates="case", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Case #{self.case_number} ({self.case_id}) - {self.case_type} - {self.status}>"
