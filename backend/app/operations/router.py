from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.core.database import get_db
from app.common.dependencies import get_current_user, require_operations
from app.users.models import User
from app.common.enums import UserRole
from app.operations.schemas import PickupRequest, ReturnRequest
from app.operations.service import OperationsService
from app.rentals.schemas import RentalResponse

router = APIRouter(prefix="/operations", tags=["Operations"])

@router.post("/pickup/{rental_id}", response_model=RentalResponse)
async def process_pickup(
    rental_id: uuid.UUID,
    data: PickupRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_operations)
):
    rental = await OperationsService.process_pickup(
        db=db,
        org_id=current_user.organization_id,
        rental_id=rental_id,
        qr_tokens=data.scanned_qr_tokens,
        actor=current_user,
        notes=data.notes
    )
    return rental

@router.post("/return/{rental_id}", response_model=RentalResponse)
async def process_return(
    rental_id: uuid.UUID,
    data: ReturnRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_operations)
):
    rental = await OperationsService.process_return(
        db=db,
        org_id=current_user.organization_id,
        rental_id=rental_id,
        data=data,
        actor=current_user
    )
    return rental

