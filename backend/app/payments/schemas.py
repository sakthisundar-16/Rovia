from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional, Any, Dict
from decimal import Decimal
from app.common.enums import PaymentStatus, PaymentType

class PaymentCreateRequest(BaseModel):
    rental_id: UUID

class PaymentResponse(BaseModel):
    id: UUID
    organization_id: UUID
    rental_id: UUID
    payment_reference: str
    payment_type: PaymentType
    amount: Decimal
    currency: str
    status: PaymentStatus
    provider: str
    provider_reference: Optional[str]
    payment_metadata: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
