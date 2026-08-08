import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Enum as SAEnum, UniqueConstraint, Numeric, Boolean, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.common.enums import RentalStatus, PickupMethod
from app.common.types import GUID

class Rental(Base):
    __tablename__ = "rentals"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    organization_id = Column(GUID(), ForeignKey("organizations.id", ondelete="CASCADE"), index=True, nullable=False)
    customer_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    
    rental_number = Column(String(100), index=True, nullable=False)
    status = Column(SAEnum(RentalStatus), default=RentalStatus.DRAFT, index=True, nullable=False)
    
    start_datetime = Column(DateTime(timezone=True), index=True, nullable=False)
    expected_return_datetime = Column(DateTime(timezone=True), index=True, nullable=False)
    actual_return_datetime = Column(DateTime(timezone=True), nullable=True)
    
    pickup_method = Column(SAEnum(PickupMethod), default=PickupMethod.IN_STORE, nullable=False)
    notes = Column(Text, nullable=True)
    
    has_protection_plan = Column(Boolean, default=False, nullable=False)
    protection_fee = Column(Numeric(10, 2), nullable=False, default=0.00)
    protection_limit = Column(Numeric(10, 2), nullable=False, default=0.00)
    
    subtotal = Column(Numeric(10, 2), nullable=False, default=0.00)
    discount_amount = Column(Numeric(10, 2), nullable=False, default=0.00)
    tax_amount = Column(Numeric(10, 2), nullable=False, default=0.00)
    security_deposit_amount = Column(Numeric(10, 2), nullable=False, default=0.00)
    total_amount = Column(Numeric(10, 2), nullable=False, default=0.00)
    
    created_by = Column(GUID(), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    
    organization = relationship("Organization")
    customer = relationship("User", foreign_keys=[customer_id])
    items = relationship("RentalItem", back_populates="rental", cascade="all, delete-orphan")
    
    __table_args__ = (
        UniqueConstraint('organization_id', 'rental_number', name='uq_org_rental_number'),
    )

class RentalItem(Base):
    __tablename__ = "rental_items"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    rental_id = Column(GUID(), ForeignKey("rentals.id", ondelete="CASCADE"), index=True, nullable=False)
    product_id = Column(GUID(), ForeignKey("products.id", ondelete="RESTRICT"), index=True, nullable=False)
    variant_id = Column(GUID(), ForeignKey("product_variants.id", ondelete="RESTRICT"), index=True, nullable=True)
    asset_id = Column(GUID(), ForeignKey("product_assets.id", ondelete="SET NULL"), index=True, nullable=True)
    
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Numeric(10, 2), nullable=False, default=0.00)
    rental_days = Column(Integer, nullable=False, default=1)
    line_total = Column(Numeric(10, 2), nullable=False, default=0.00)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    
    rental = relationship("Rental", back_populates="items")
    product = relationship("Product")
    variant = relationship("ProductVariant")
    asset = relationship("ProductAsset")

class RentalExtension(Base):
    __tablename__ = "rental_extensions"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    rental_id = Column(GUID(), ForeignKey("rentals.id", ondelete="CASCADE"), index=True, nullable=False)
    previous_end_datetime = Column(DateTime(timezone=True), nullable=False)
    new_end_datetime = Column(DateTime(timezone=True), nullable=False)
    additional_days = Column(Integer, nullable=False)
    additional_amount = Column(Numeric(10, 2), nullable=False, default=0.00)
    requested_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    requested_by = Column(GUID(), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    status = Column(String(50), nullable=False, default="PENDING")
    
    rental = relationship("Rental")
