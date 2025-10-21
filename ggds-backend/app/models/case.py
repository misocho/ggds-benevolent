import uuid
from sqlalchemy import Column, String, Text, Date, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship as sa_relationship
import enum
from app.database import Base


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
    """Case processing status"""
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    CLOSED = "closed"


class Case(Base):
    """Support case model"""
    __tablename__ = "cases"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(String(50), unique=True, nullable=False, index=True)  # CASE-001
    member_id = Column(UUID(as_uuid=True), ForeignKey("members.id"), nullable=False)
    reported_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # Case Details
    case_type = Column(Enum(CaseType), nullable=False)
    description = Column(Text, nullable=False)
    reporting_reason = Column(Text, nullable=False)
    incident_date = Column(Date, nullable=False)
    urgency_level = Column(Enum(UrgencyLevel), default=UrgencyLevel.MEDIUM, nullable=False)

    # Affected Member Information
    affected_member_name = Column(String(255), nullable=False)
    relationship_to_reporter = Column(String(100), nullable=False)

    # Status & Review
    status = Column(Enum(CaseStatus), default=CaseStatus.PENDING, nullable=False)
    submitted_date = Column(Date, server_default=func.current_date(), nullable=False)
    reviewed_date = Column(Date, nullable=True)
    reviewer_notes = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    member = sa_relationship("Member", back_populates="cases", foreign_keys=[member_id])
    reported_by_user = sa_relationship("User", back_populates="cases_reported", foreign_keys=[reported_by_user_id])
    verification_contacts = sa_relationship("VerificationContact", back_populates="case", cascade="all, delete-orphan")
    documents = sa_relationship("Document", back_populates="case", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Case {self.case_id} - {self.case_type} - {self.status}>"
