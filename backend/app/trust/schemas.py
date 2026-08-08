from pydantic import BaseModel
from typing import List, Optional
import uuid
from decimal import Decimal

class SmartDepositResponse(BaseModel):
    trust_score: int
    base_deposit: Decimal
    deposit_multiplier: float
    required_deposit: Decimal
    reason: str

class TrustHistoryResponse(BaseModel):
    old_score: int
    new_score: int
    reason: str
    created_at: str

class TrustProfileResponse(BaseModel):
    customer_id: uuid.UUID
    score: int
    total_completed_rentals: int
    on_time_returns: int
    damage_free_returns: int
    history: List[TrustHistoryResponse]
