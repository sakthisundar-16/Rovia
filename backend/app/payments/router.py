from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.payments.schemas import PaymentCreateRequest, PaymentResponse
from app.payments.service import PaymentService
from app.common.dependencies import get_current_active_user
from app.users.models import User

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.post("", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def create_payment(
    data: PaymentCreateRequest, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return await PaymentService.create_payment(db, current_user.organization_id, current_user, data)

@router.get("/{id}", response_model=PaymentResponse)
async def get_payment(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return await PaymentService.get_payment(
        db, 
        current_user.organization_id, 
        id, 
        current_user.id if current_user.role.value == "CUSTOMER" else None
    )

@router.post("/{id}/simulate-success", response_model=PaymentResponse)
async def simulate_success(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return await PaymentService.simulate_success(db, current_user.organization_id, id, current_user)

@router.post("/{id}/simulate-failure", response_model=PaymentResponse)
async def simulate_failure(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return await PaymentService.simulate_failure(db, current_user.organization_id, id, current_user)
