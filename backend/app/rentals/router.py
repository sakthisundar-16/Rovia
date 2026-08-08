from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from app.core.database import get_db
from app.rentals.schemas import RentalCreate, RentalResponse, RentalTransitionRequest
from app.rentals.service import RentalService
from app.common.dependencies import get_current_active_user, require_operations
from app.common.enums import RentalStatus
from app.users.models import User

router = APIRouter(prefix="/rentals", tags=["Rentals"])

@router.post("", response_model=RentalResponse, status_code=status.HTTP_201_CREATED)
async def create_rental(
    data: RentalCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return await RentalService.create_rental(db, current_user.organization_id, current_user.id, data)

@router.get("", response_model=List[RentalResponse])
async def list_rentals(
    status_filter: Optional[RentalStatus] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    is_customer = current_user.role.value == "CUSTOMER"
    return await RentalService.list_rentals(
        db, 
        current_user.organization_id, 
        current_user.id if is_customer else None,
        status_filter
    )

@router.get("/{id}", response_model=RentalResponse)
async def get_rental(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    is_customer = current_user.role.value == "CUSTOMER"
    return await RentalService.get_rental(
        db, 
        current_user.organization_id, 
        id, 
        current_user.id if is_customer else None
    )

@router.post("/{id}/transition", response_model=RentalResponse)
async def transition_rental(
    id: UUID,
    data: RentalTransitionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return await RentalService.transition_rental(
        db, 
        current_user.organization_id, 
        id, 
        data.target_status, 
        current_user
    )

@router.post("/{id}/cancel", status_code=status.HTTP_200_OK)
async def cancel_rental(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Customer can cancel their own eligible rentals.
    await RentalService.cancel_rental(db, current_user.organization_id, id, current_user)
    return {"message": "Rental cancelled successfully"}
