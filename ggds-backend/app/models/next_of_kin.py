import uuid
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship as sa_relationship
from app.database import Base


class NextOfKin(Base):
    """Next of kin / emergency contact model"""
    __tablename__ = "next_of_kin"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(UUID(as_uuid=True), ForeignKey("members.id", ondelete="CASCADE"), nullable=False)

    # Contact Information
    name = Column(String(255), nullable=False)
    relationship = Column(String(100), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(255), nullable=True)
    priority = Column(Integer, nullable=False)  # 1 = primary, 2 = secondary

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    member = sa_relationship("Member", back_populates="next_of_kin")

    def __repr__(self):
        return f"<NextOfKin {self.name} - Priority {self.priority}>"
