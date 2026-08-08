import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

class MaintenanceTicket(Base):
    __tablename__ = "maintenance_tickets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), index=True, nullable=False)
    asset_id = Column(UUID(as_uuid=True), ForeignKey("product_assets.id", ondelete="CASCADE"), index=True, nullable=False)
    
    issue = Column(String(500), nullable=False)
    severity = Column(String(50), nullable=False)
    status = Column(String(50), default="OPEN", nullable=False)
    notes = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    asset = relationship("ProductAsset")
