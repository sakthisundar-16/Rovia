from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import uuid

from app.core.database import get_db
from app.common.dependencies import get_current_user, require_operations
from app.users.models import User
from app.common.enums import UserRole
from app.maintenance.service import MaintenanceService
from app.maintenance.schemas import MaintenanceCreate, MaintenanceUpdate, MaintenanceResponse, MaintenanceListResponse

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])

@router.post("/", response_model=MaintenanceResponse)
async def create_ticket(
    data: MaintenanceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_operations)
):
    return await MaintenanceService.create_ticket(db, current_user.organization_id, data)

@router.get("/", response_model=MaintenanceListResponse)
async def list_tickets(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    asset_id: Optional[uuid.UUID] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_operations)
):
    items, total = await MaintenanceService.list_tickets(db, current_user.organization_id, skip, limit, status, asset_id)
    return MaintenanceListResponse(items=items, total=total, page=skip // limit + 1, size=limit)

@router.get("/{ticket_id}", response_model=MaintenanceResponse)
async def get_ticket(
    ticket_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_operations)
):
    return await MaintenanceService.get_ticket(db, current_user.organization_id, ticket_id)

@router.patch("/{ticket_id}", response_model=MaintenanceResponse)
async def update_ticket(
    ticket_id: uuid.UUID,
    data: MaintenanceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_operations)
):
    return await MaintenanceService.update_ticket(db, current_user.organization_id, ticket_id, data)
