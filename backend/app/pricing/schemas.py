from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, List
from decimal import Decimal

class PricingItemRequest(BaseModel):
    product_id: UUID
    variant_id: Optional[UUID] = None
    quantity: int = 1

class PricingPreviewRequest(BaseModel):
    start_datetime: datetime
    expected_return_datetime: datetime
    has_protection_plan: bool = False
    items: List[PricingItemRequest]
    customer_id: Optional[UUID] = None

class PricingPreviewResponse(BaseModel):
    subtotal: Decimal
    discount: Decimal
    tax: Decimal
    protection_fee: Decimal = Decimal('0.00')
    protection_limit: Decimal = Decimal('0.00')
    rental_total: Decimal
    security_deposit: Decimal
    total_due: Decimal
    currency: str = "INR"
