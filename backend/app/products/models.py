import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum as SAEnum, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.common.enums import ProductCategory

class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), index=True, nullable=False)
    
    name = Column(String(255), nullable=False)
    slug = Column(String(255), index=True, nullable=True)
    description = Column(String, nullable=True)
    category = Column(SAEnum(ProductCategory), nullable=False)
    brand = Column(String(100), nullable=True)
    
    base_rental_price = Column(Numeric(10, 2), nullable=False, default=0.00)
    security_deposit_configuration = Column(Numeric(10, 2), nullable=False, default=0.00)
    
    is_active = Column(Boolean, default=True, nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    
    organization = relationship("Organization")
    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")


class ProductVariant(Base):
    __tablename__ = "product_variants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), index=True, nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), index=True, nullable=False)
    
    name = Column(String(255), nullable=False)
    sku = Column(String(255), index=True, nullable=True)
    
    price_adjustment = Column(Numeric(10, 2), nullable=False, default=0.00)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    
    organization = relationship("Organization")
    product = relationship("Product", back_populates="variants")
