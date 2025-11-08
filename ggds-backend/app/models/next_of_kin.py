import uuid
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship as sa_relationship
from app.database import Base


class NextOfKin(Base):
    """Next of kin / beneficiary model (PIVOT v2.0: Single next of kin per member)"""
    __tablename__ = "next_of_kin"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(UUID(as_uuid=True), ForeignKey("members.id", ondelete="CASCADE"), nullable=False, unique=True)  # One per member

    # Contact Information
    name = Column(String(255), nullable=False)
    relationship = Column(String(100), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(255), nullable=True)

    # Beneficiary Information
    percentage = Column(Float, default=100.0, nullable=False)  # Percentage of benefit (default 100%)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    member = sa_relationship("Member", back_populates="next_of_kin", uselist=False)  # One-to-one relationship

    def __repr__(self):
        return f"<NextOfKin {self.name} - {self.percentage}%>"
