import uuid
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from enum import Enum

class MaintenanceStatusSchema(str, Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CANCELLED = "CANCELLED"

class MaintenanceCreate(BaseModel):
    asset_id: uuid.UUID
    rental_id: Optional[uuid.UUID] = None
    issue: str
    severity: str
    repair_cost: Optional[Decimal] = Decimal('0.00')

class MaintenanceUpdate(BaseModel):
    status: MaintenanceStatusSchema
    notes: Optional[str] = None
    repair_cost: Optional[Decimal] = None

class MaintenanceResponse(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    asset_id: uuid.UUID
    rental_id: Optional[uuid.UUID]
    issue: str
    severity: str
    status: MaintenanceStatusSchema
    repair_cost: Decimal
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime]

    class Config:
        from_attributes = True

class MaintenanceListResponse(BaseModel):
    items: List[MaintenanceResponse]
    total: int
    page: int
    size: int
