import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship as sa_relationship
from app.database import Base


class Document(Base):
    """Document/file upload model"""
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"), nullable=True)
    member_id = Column(UUID(as_uuid=True), ForeignKey("members.id", ondelete="CASCADE"), nullable=True)
    uploaded_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # File Information
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=False)  # Size in bytes

    # S3 Storage (Placeholder - will be used when S3 is integrated)
    s3_key = Column(String(500), nullable=True)  # S3 object key
    s3_url = Column(String(1000), nullable=True)  # Signed URL or permanent URL
    local_path = Column(String(500), nullable=True)  # For local storage during development

    # Timestamps
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    case = sa_relationship("Case", back_populates="documents")

    def __repr__(self):
        return f"<Document {self.file_name}>"
