import uuid
from sqlalchemy import Column, String, Date, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class MemberStatus(str, enum.Enum):
    """Member status enumeration"""
    PENDING = "pending"
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"


class Member(Base):
    """Member registration model"""
    __tablename__ = "members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True)
    member_id = Column(String(50), unique=True, nullable=False, index=True)  # GGDS-2025-001

    # Personal Information
    full_name = Column(String(255), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(255), nullable=False)
    id_number = Column(String(100), nullable=False)  # National ID or Passport
    occupation = Column(String(255), nullable=True)
    residence = Column(String(500), nullable=True)

    # Status
    status = Column(Enum(MemberStatus), default=MemberStatus.PENDING, nullable=False)
    join_date = Column(Date, server_default=func.current_date(), nullable=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="member")
    family_members = relationship("FamilyMember", back_populates="member", cascade="all, delete-orphan")
    next_of_kin = relationship("NextOfKin", back_populates="member", cascade="all, delete-orphan")
    cases = relationship("Case", back_populates="member", foreign_keys="Case.member_id")

    def __repr__(self):
        return f"<Member {self.member_id} - {self.full_name}>"
