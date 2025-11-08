import uuid
from sqlalchemy import Column, String, Date, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship as sa_relationship
import enum
from app.database import Base


class FamilyType(str, enum.Enum):
    """Type of family member"""
    NUCLEAR = "nuclear"
    SIBLING = "sibling"


class Relationship(str, enum.Enum):
    """Family relationship types"""
    SPOUSE = "spouse"
    CHILD = "child"
    PARENT = "parent"
    BROTHER = "brother"
    SISTER = "sister"


class FamilyMember(Base):
    """Family member model (nuclear family and siblings)"""
    __tablename__ = "family_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(UUID(as_uuid=True), ForeignKey("members.id", ondelete="CASCADE"), nullable=False)

    # Family Information
    family_type = Column(Enum(FamilyType), nullable=False)
    name = Column(String(255), nullable=False)
    relationship = Column(Enum(Relationship), nullable=False)
    date_of_birth = Column(Date, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    member = sa_relationship("Member", back_populates="family_members")

    def __repr__(self):
        return f"<FamilyMember {self.name} - {self.relationship}>"
