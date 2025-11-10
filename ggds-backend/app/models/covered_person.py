import uuid
from sqlalchemy import Column, String, Date, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship as sa_relationship
from app.database import Base


class CoveredPerson(Base):
    """Covered/Insured individuals under member's benevolent fund coverage"""
    __tablename__ = "covered_persons"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(UUID(as_uuid=True), ForeignKey("members.id", ondelete="CASCADE"), nullable=False)

    # Personal Information
    name = Column(String(255), nullable=False)
    relationship = Column(String(100), nullable=False)  # e.g., spouse, child, parent
    date_of_birth = Column(Date, nullable=True)
    id_number = Column(String(100), nullable=True)  # National ID or Passport

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    member = sa_relationship("Member", back_populates="covered_persons")

    def __repr__(self):
        return f"<CoveredPerson {self.name} - {self.relationship}>"
