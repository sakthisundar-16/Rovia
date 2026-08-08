import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum
from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Enum as SQLEnum, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.common.types import GUID

class MaintenanceStatus(PyEnum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CANCELLED = "CANCELLED"

class MaintenanceTicket(Base):
    __tablename__ = "maintenance_tickets"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    organization_id = Column(GUID(), ForeignKey("organizations.id", ondelete="CASCADE"), index=True, nullable=False)
    asset_id = Column(GUID(), ForeignKey("product_assets.id", ondelete="CASCADE"), index=True, nullable=False)
    rental_id = Column(GUID(), ForeignKey("rentals.id", ondelete="SET NULL"), index=True, nullable=True)
    
    issue = Column(String(500), nullable=False)
    severity = Column(String(50), nullable=False)
    status = Column(SQLEnum(MaintenanceStatus), default=MaintenanceStatus.OPEN, nullable=False)
    repair_cost = Column(Numeric(10, 2), default=0.00)
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    asset = relationship("ProductAsset")
    rental = relationship("Rental")
