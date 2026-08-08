from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional, List
from decimal import Decimal
from app.common.enums import ProductCategory

class ProductVariantBase(BaseModel):
    name: str
    sku: Optional[str] = None
    price_adjustment: Decimal = Decimal('0.00')

class ProductVariantCreate(ProductVariantBase):
    pass

class ProductVariantResponse(ProductVariantBase):
    id: UUID
    organization_id: UUID
    product_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ProductBase(BaseModel):
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None
    category: ProductCategory
    brand: Optional[str] = None
    base_rental_price: Decimal
    security_deposit_configuration: Decimal = Decimal('0.00')
    is_active: bool = True

class ProductCreate(ProductBase):
    variants: Optional[List[ProductVariantCreate]] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    category: Optional[ProductCategory] = None
    brand: Optional[str] = None
    base_rental_price: Optional[Decimal] = None
    security_deposit_configuration: Optional[Decimal] = None
    is_active: Optional[bool] = None

class ProductResponse(ProductBase):
    id: UUID
    organization_id: UUID
    created_at: datetime
    updated_at: datetime
    variants: List[ProductVariantResponse] = []

    model_config = ConfigDict(from_attributes=True)
