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
