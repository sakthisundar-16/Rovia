from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import List, Optional
from decimal import Decimal
from app.common.enums import DepositStatus, LedgerEntryType

class DepositLedgerEntryResponse(BaseModel):
    id: UUID
    entry_type: LedgerEntryType
    amount: Decimal
    notes: Optional[str]
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class DepositAccountResponse(BaseModel):
    id: UUID
    rental_id: UUID
    required_amount: Decimal
    currency: str
    status: DepositStatus
    created_at: datetime
    updated_at: datetime
    
    collected_amount: Decimal = Decimal('0.00')
    deducted_amount: Decimal = Decimal('0.00')
    refundable_amount: Decimal = Decimal('0.00')
    
    ledger_entries: List[DepositLedgerEntryResponse] = []
    
    model_config = ConfigDict(from_attributes=True)
