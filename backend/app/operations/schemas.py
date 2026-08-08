from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime
from decimal import Decimal

class PickupRequest(BaseModel):
    scanned_qr_tokens: List[str]
    notes: Optional[str] = None

class AssetReturnInfo(BaseModel):
    asset_id: uuid.UUID
    condition: str  # AssetCondition value string
    missing_accessories: List[str] = []
    damage_notes: Optional[str] = None
    estimated_charge: Decimal = Decimal('0.00')

class ReturnRequest(BaseModel):
    actual_return_datetime: datetime
    assets: List[AssetReturnInfo]
    notes: Optional[str] = None

class SyncAction(BaseModel):
    action_id: str
    action_type: str # PICKUP, RETURN
    rental_id: uuid.UUID
    payload: dict
    timestamp: datetime

class SyncRequest(BaseModel):
    actions: List[SyncAction]

class SyncResponse(BaseModel):
    processed: int
    failed: int
    results: dict # action_id -> "SUCCESS" | "FAILED"

