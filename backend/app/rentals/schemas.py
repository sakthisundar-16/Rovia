from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional, List
from decimal import Decimal
from app.common.enums import RentalStatus, PickupMethod

class RentalItemCreate(BaseModel):
    product_id: UUID
    variant_id: Optional[UUID] = None
    quantity: int = 1

class RentalCreate(BaseModel):
    start_datetime: datetime
    expected_return_datetime: datetime
    pickup_method: PickupMethod = PickupMethod.IN_STORE
    notes: Optional[str] = None
    items: List[RentalItemCreate]

class RentalTransitionRequest(BaseModel):
    target_status: RentalStatus

class RentalItemResponse(BaseModel):
    id: UUID
    product_id: UUID
    variant_id: Optional[UUID]
    asset_id: Optional[UUID]
    quantity: int
    unit_price: Decimal
    rental_days: int
    line_total: Decimal
    
    model_config = ConfigDict(from_attributes=True)

class RentalResponse(BaseModel):
    id: UUID
    organization_id: UUID
    customer_id: UUID
    rental_number: str
    status: RentalStatus
    start_datetime: datetime
    expected_return_datetime: datetime
    actual_return_datetime: Optional[datetime]
    pickup_method: PickupMethod
    notes: Optional[str]
    subtotal: Decimal
    discount_amount: Decimal
    tax_amount: Decimal
    security_deposit_amount: Decimal
    total_amount: Decimal
    created_at: datetime
    updated_at: datetime
    items: List[RentalItemResponse] = []

    model_config = ConfigDict(from_attributes=True)
