import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.common.enums import CustomerStatus
from app.common.types import GUID

class Customer(Base):
    __tablename__ = "customers"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    organization_id = Column(GUID(), ForeignKey("organizations.id", ondelete="CASCADE"), index=True, nullable=False)
    linked_user_id = Column(GUID(), ForeignKey("users.id", ondelete="SET NULL"), unique=True, nullable=True)
    
    customer_number = Column(String(50), index=True, nullable=False)
    name = Column(String(255), nullable=False)
    email = Column(String(255), index=True, nullable=True)
    phone = Column(String(50), nullable=True)
    address = Column(String(500), nullable=True)
    status = Column(SAEnum(CustomerStatus), default=CustomerStatus.ACTIVE, nullable=False)
    preferred_language = Column(String(10), default="en", nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    
    organization = relationship("Organization")
    linked_user = relationship("User")
