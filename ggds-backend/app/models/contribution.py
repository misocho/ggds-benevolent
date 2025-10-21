import uuid
from sqlalchemy import Column, String, Date, DateTime, Enum, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship as sa_relationship
import enum
from app.database import Base


class PaymentMethod(str, enum.Enum):
    """Payment method enumeration"""
    MPESA = "mpesa"
    BANK_TRANSFER = "bank_transfer"
    CASH = "cash"
    CHEQUE = "cheque"
    OTHER = "other"


class ContributionStatus(str, enum.Enum):
    """Contribution status enumeration"""
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"


class Contribution(Base):
    """Member contribution tracking model"""
    __tablename__ = "contributions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(String(50), ForeignKey("members.member_id"), nullable=False, index=True)

    # Contribution Details
    amount = Column(Numeric(10, 2), nullable=False)  # Amount in KES
    payment_date = Column(Date, nullable=False, index=True)
    payment_method = Column(Enum(PaymentMethod), nullable=False)
    transaction_reference = Column(String(255), nullable=True)  # MPESA code, cheque number, etc.

    # Verification
    status = Column(Enum(ContributionStatus), default=ContributionStatus.PENDING, nullable=False)
    verified_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    verified_date = Column(Date, nullable=True)

    # Notes
    notes = Column(String(1000), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    member = sa_relationship("Member", backref="contributions")
    verified_by = sa_relationship("User", foreign_keys=[verified_by_user_id])

    def __repr__(self):
        return f"<Contribution {self.member_id} - {self.amount} KES on {self.payment_date}>"
