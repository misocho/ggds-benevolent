import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship as sa_relationship
import enum
from app.database import Base


class UserRole(str, enum.Enum):
    """User role enumeration"""
    MEMBER = "member"
    ADMIN = "admin"


class User(Base):
    """User model for authentication"""
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.MEMBER, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    member = sa_relationship("Member", back_populates="user", uselist=False, cascade="all, delete-orphan")
    cases_reported = sa_relationship("Case", back_populates="reported_by_user", foreign_keys="Case.reported_by_user_id")

    def __repr__(self):
        return f"<User {self.email}>"
