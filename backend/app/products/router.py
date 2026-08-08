from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from app.core.database import get_db
from app.products.schemas import ProductCreate, ProductUpdate, ProductResponse
from app.products.service import ProductService
from app.common.dependencies import get_current_active_user, require_admin, require_operations
from app.common.enums import ProductCategory
from app.users.models import User

router = APIRouter(prefix="/products", tags=["Products"])

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    data: ProductCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    return await ProductService.create_product(db, current_user.organization_id, data)

@router.get("", response_model=List[ProductResponse])
async def list_products(
    active_only: bool = True,
    category: Optional[ProductCategory] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Customers only see active
    if current_user.role.value == "CUSTOMER":
        active_only = True
    return await ProductService.list_products(db, current_user.organization_id, active_only, category)

@router.get("/{id}", response_model=ProductResponse)
async def get_product(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return await ProductService.get_product(db, current_user.organization_id, id)

@router.patch("/{id}", response_model=ProductResponse)
async def update_product(
    id: UUID,
    data: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    return await ProductService.update_product(db, current_user.organization_id, id, data)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    await ProductService.delete_product(db, current_user.organization_id, id)
