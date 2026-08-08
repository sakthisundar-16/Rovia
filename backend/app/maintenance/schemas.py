from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime

class MaintenanceCreate(BaseModel):
    asset_id: uuid.UUID
    issue: str
    severity: str
    notes: Optional[str] = None

class MaintenanceUpdate(BaseModel):
    status: str
    notes: Optional[str] = None

class MaintenanceResponse(BaseModel):
    id: uuid.UUID
    asset_id: uuid.UUID
    issue: str
    severity: str
    status: str
    notes: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None
