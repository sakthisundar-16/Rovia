from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional
from app.common.enums import AssetStatus, AssetCondition

class AssetTransitionRequest(BaseModel):
    target_status: AssetStatus
    
class AssetBase(BaseModel):
    product_id: UUID
    variant_id: Optional[UUID] = None
    asset_code: str
    serial_number: Optional[str] = None
    condition: AssetCondition = AssetCondition.EXCELLENT

class AssetCreate(AssetBase):
    pass

class AssetUpdate(BaseModel):
    asset_code: Optional[str] = None
    serial_number: Optional[str] = None
    condition: Optional[AssetCondition] = None

class AssetResponse(AssetBase):
    id: UUID
    organization_id: UUID
    qr_token: str
    status: AssetStatus
    rental_count: int
    last_maintenance_at: Optional[datetime]
    next_maintenance_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AssetPassportResponse(BaseModel):
    asset_id: UUID
    qr_token: str
    asset_code: str
    product_name: str
    variant_name: Optional[str]
    status: AssetStatus
    condition: AssetCondition
    rental_count: int
    last_maintenance_at: Optional[datetime]
    next_maintenance_at: Optional[datetime]
