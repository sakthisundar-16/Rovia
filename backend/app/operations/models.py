import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, DateTime, ForeignKey, Text, Enum as SQLEnum, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from decimal import Decimal

from app.core.database import Base
from app.common.enums import AssetCondition

class DamageReport(Base):
    __tablename__ = "damage_reports"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"), index=True)
    rental_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("rentals.id"), index=True)
    asset_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("product_assets.id"), index=True)
    
    severity: Mapped[str] = mapped_column(String(50)) # MINOR, MAJOR, CRITICAL, MISSING_ACCESSORY
    description: Mapped[str] = mapped_column(Text)
    estimated_charge: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0.00)
    
    created_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    rental = relationship("Rental")
    asset = relationship("ProductAsset")
    creator = relationship("User")

from enum import Enum as PyEnum
from sqlalchemy.dialects.postgresql import JSONB

class OfflineActionStatus(PyEnum):
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"

class OfflineAction(Base):
    __tablename__ = "offline_actions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), index=True)
    action_id: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    action_type: Mapped[str] = mapped_column(String(50)) # PICKUP, RETURN
    rental_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("rentals.id", ondelete="CASCADE"), index=True)
    payload: Mapped[dict] = mapped_column(JSONB)
    
    status: Mapped[OfflineActionStatus] = mapped_column(SQLEnum(OfflineActionStatus), default=OfflineActionStatus.PENDING)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    created_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    processed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
