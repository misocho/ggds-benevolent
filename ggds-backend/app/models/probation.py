"""
PIVOT v2.0: Probation Model
Tracks members on probation for missing contribution deadlines
"""
import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship as sa_relationship
from app.database import Base


class Probation(Base):
    """
    Probation model - tracks members flagged for missing contribution deadlines

    When a member fails to contribute to an approved case by the deadline,
    they are automatically placed on probation.
    """
    __tablename__ = "probations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(UUID(as_uuid=True), ForeignKey("members.id"), nullable=False, index=True)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False, index=True)

    # Probation details
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=True)  # When probation ends (if resolved)
    reason = Column(String(500), nullable=False)  # e.g., "Missed contribution deadline for Case #5"
    is_active = Column(Boolean, default=True, nullable=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    member = sa_relationship("Member", back_populates="probations")
    case = sa_relationship("Case", back_populates="probations")

    def __repr__(self):
        status = "Active" if self.is_active else "Resolved"
        return f"<Probation Member#{self.member_id[:8]} Case#{self.case_id[:8]}: {status}>"
