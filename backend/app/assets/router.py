from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.assets.schemas import AssetCreate, AssetUpdate, AssetResponse, AssetTransitionRequest, AssetPassportResponse
from app.assets.service import AssetService
from app.common.dependencies import get_current_active_user, require_admin, require_operations
from app.users.models import User

router = APIRouter(prefix="/assets", tags=["Assets"])

@router.post("", response_model=AssetResponse, status_code=status.HTTP_201_CREATED)
async def create_asset(
    data: AssetCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_operations)
):
    return await AssetService.create_asset(db, current_user.organization_id, data)

@router.get("", response_model=List[AssetResponse])
async def list_assets(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_operations)
):
    return await AssetService.list_assets(db, current_user.organization_id)

@router.get("/{id}", response_model=AssetResponse)
async def get_asset(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_operations)
):
    return await AssetService.get_asset(db, current_user.organization_id, id)

@router.patch("/{id}", response_model=AssetResponse)
async def update_asset(
    id: UUID,
    data: AssetUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_operations)
):
    return await AssetService.update_asset(db, current_user.organization_id, id, data)

@router.post("/{id}/transition", response_model=AssetResponse)
async def transition_asset(
    id: UUID,
    data: AssetTransitionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_operations)
):
    return await AssetService.transition_asset(db, current_user.organization_id, id, data.target_status)

@router.get("/{id}/passport", response_model=AssetPassportResponse)
async def get_asset_passport(
    id: UUID,
    db: AsyncSession = Depends(get_db)
    # Could be public for scanning, but for now we require no auth or simple auth depending on requirements.
    # We will make it public, but it doesn't expose sensitive info.
):
    return await AssetService.get_passport(db, id)
