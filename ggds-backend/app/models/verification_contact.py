import uuid
from sqlalchemy import Column, String, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship as sa_relationship
import enum
from app.database import Base


class ContactType(str, enum.Enum):
    """Type of verification contact"""
    VILLAGE_ELDER = "village_elder"
    ASSISTANT_CHIEF = "assistant_chief"
    CHIEF = "chief"
    REFEREE = "referee"


class VerificationContact(Base):
    """Verification contact model (village elders, chiefs, referees)"""
    __tablename__ = "verification_contacts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"), nullable=False)

    # Contact Information
    contact_type = Column(Enum(ContactType), nullable=False)
    name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(255), nullable=True)
    relationship_to_member = Column(String(100), nullable=True)  # For referee only

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    case = sa_relationship("Case", back_populates="verification_contacts")

    def __repr__(self):
        return f"<VerificationContact {self.contact_type} - {self.name}>"
