from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.core.database import get_db
from app.deposits.schemas import DepositAccountResponse
from app.deposits.service import DepositService
from app.common.dependencies import get_current_active_user
from app.users.models import User
from app.rentals.service import RentalService

router = APIRouter(prefix="/deposits", tags=["Deposits"])

@router.get("/rental/{rental_id}", response_model=DepositAccountResponse)
async def get_deposit_for_rental(
    rental_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Ensure user has access to the rental before exposing deposit info
    is_customer = current_user.role.value == "CUSTOMER"
    await RentalService.get_rental(db, current_user.organization_id, rental_id, current_user.id if is_customer else None)
    
    return await DepositService.get_deposit_account(db, current_user.organization_id, rental_id)
