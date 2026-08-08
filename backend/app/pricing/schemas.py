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
    items: List[PricingItemRequest]
    customer_id: Optional[UUID] = None

class PricingPreviewResponse(BaseModel):
    subtotal: Decimal
    discount: Decimal
    tax: Decimal
    rental_total: Decimal
    security_deposit: Decimal
    total_due: Decimal
    currency: str = "INR"
