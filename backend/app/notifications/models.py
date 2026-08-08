import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.common.types import GUID

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    organization_id = Column(GUID(), ForeignKey("organizations.id", ondelete="CASCADE"), index=True, nullable=False)
    customer_id = Column(GUID(), ForeignKey("customers.id", ondelete="CASCADE"), index=True, nullable=False)
    rental_id = Column(GUID(), ForeignKey("rentals.id", ondelete="SET NULL"), nullable=True)
    
    notification_type = Column(String(50), nullable=False)
    channel = Column(String(50), nullable=False, default="EMAIL")
    content = Column(Text, nullable=False)
    
    is_sent = Column(Boolean, default=False, nullable=False)
    sent_at = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

class NotificationTemplate(Base):
    __tablename__ = "notification_templates"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    organization_id = Column(GUID(), ForeignKey("organizations.id", ondelete="CASCADE"), index=True, nullable=False)
    
    name = Column(String(100), nullable=False)
    language = Column(String(10), nullable=False, default="en")
    subject_template = Column(String(255), nullable=True)
    body_template = Column(Text, nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
