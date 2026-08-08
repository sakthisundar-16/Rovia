from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.core.database import get_db
from app.common.dependencies import get_current_user, require_operations
from app.users.models import User
from app.common.enums import UserRole
from app.maintenance.service import MaintenanceService
from app.maintenance.schemas import MaintenanceCreate, MaintenanceUpdate, MaintenanceResponse

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])

@router.post("/", response_model=MaintenanceResponse)
async def create_ticket(
    data: MaintenanceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_operations)
):
    return await MaintenanceService.create_ticket(db, current_user.organization_id, data)

@router.put("/{ticket_id}", response_model=MaintenanceResponse)
async def update_ticket(
    ticket_id: uuid.UUID,
    data: MaintenanceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_operations)
):
    return await MaintenanceService.update_ticket(db, current_user.organization_id, ticket_id, data)
