import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum as SAEnum, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.common.enums import AssetStatus, AssetCondition

class ProductAsset(Base):
    __tablename__ = "product_assets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), index=True, nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), index=True, nullable=False)
    variant_id = Column(UUID(as_uuid=True), ForeignKey("product_variants.id", ondelete="SET NULL"), index=True, nullable=True)
    
    asset_code = Column(String(100), index=True, nullable=False)
    serial_number = Column(String(255), index=True, nullable=True)
    qr_token = Column(String(255), unique=True, index=True, nullable=False, default=lambda: f"ROVIA-{uuid.uuid4().hex[:12].upper()}")
    
    status = Column(SAEnum(AssetStatus), default=AssetStatus.AVAILABLE, nullable=False)
    condition = Column(SAEnum(AssetCondition), default=AssetCondition.EXCELLENT, nullable=False)
    
    rental_count = Column(Integer, default=0, nullable=False)
    
    last_maintenance_at = Column(DateTime(timezone=True), nullable=True)
    next_maintenance_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    
    organization = relationship("Organization")
    product = relationship("Product")
    variant = relationship("ProductVariant")
    
    __table_args__ = (
        UniqueConstraint('organization_id', 'asset_code', name='uq_org_asset_code'),
        UniqueConstraint('organization_id', 'serial_number', name='uq_org_serial_number'),
    )
