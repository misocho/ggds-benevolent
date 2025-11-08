"""
PIVOT v2.0: Contribution Model
Tracks member contributions to approved bereavement cases
"""
import uuid
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship as sa_relationship
import enum
from app.database import Base


class ContributionStatus(str, enum.Enum):
    """Contribution status enumeration"""
    PENDING = "pending"
    COMPLETED = "completed"
    OVERDUE = "overdue"


class Contribution(Base):
    """
    Contribution model - tracks member contributions to bereavement cases

    When a case is approved, contribution records are automatically created
    for all active members (except the case filer) with a deadline.
    Members who miss the deadline are flagged for probation.
    """
    __tablename__ = "contributions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False, index=True)
    member_id = Column(UUID(as_uuid=True), ForeignKey("members.id"), nullable=False, index=True)

    # Contribution details
    amount = Column(Float, nullable=False)  # Required contribution amount
    contribution_date = Column(DateTime(timezone=True), nullable=True)  # When they actually contributed
    deadline = Column(DateTime(timezone=True), nullable=False)  # When they must contribute by
    status = Column(Enum(ContributionStatus), default=ContributionStatus.PENDING, nullable=False)
    payment_reference = Column(String(255), nullable=True)  # Transaction/payment reference

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    case = sa_relationship("Case", back_populates="contributions")
    member = sa_relationship("Member", back_populates="contributions")

    def __repr__(self):
        return f"<Contribution Case#{self.case_id[:8]} Member#{self.member_id[:8]}: ${self.amount} ({self.status})>"
