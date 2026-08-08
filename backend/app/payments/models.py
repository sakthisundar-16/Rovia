import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.common.enums import PaymentStatus, PaymentType

class Payment(Base):
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), index=True, nullable=False)
    rental_id = Column(UUID(as_uuid=True), ForeignKey("rentals.id", ondelete="CASCADE"), index=True, nullable=False)
    
    payment_reference = Column(String(100), unique=True, index=True, nullable=False)
    payment_type = Column(SAEnum(PaymentType), nullable=False)
    
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(3), nullable=False, default="INR")
    
    status = Column(SAEnum(PaymentStatus), default=PaymentStatus.INITIATED, index=True, nullable=False)
    
    provider = Column(String(50), nullable=False, default="DEMO")
    provider_reference = Column(String(255), unique=True, index=True, nullable=True)
    
    payment_metadata = Column(JSONB, nullable=True) # avoiding naming collision with python metadata
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    rental = relationship("Rental")
