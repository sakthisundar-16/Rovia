from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from app.assets.models import ProductAsset
from app.products.models import Product, ProductVariant
from app.assets.schemas import AssetCreate, AssetUpdate, AssetPassportResponse
from app.common.enums import AssetStatus
from app.common.exceptions import (
    AssetNotFoundException, 
    InvalidAssetTransitionException,
    DuplicateAssetCodeException,
    DuplicateSerialNumberException,
    QrTokenNotFoundException,
    ProductNotFoundException
)

class AssetService:
    @staticmethod
    async def create_asset(db: AsyncSession, org_id: UUID, data: AssetCreate) -> ProductAsset:
        # Check product exists in org
        result = await db.execute(select(Product).where(Product.id == data.product_id, Product.organization_id == org_id))
        if not result.scalars().first():
            raise ProductNotFoundException()
            
        # Check unique constraints
        code_check = await db.execute(select(ProductAsset).where(ProductAsset.asset_code == data.asset_code, ProductAsset.organization_id == org_id))
        if code_check.scalars().first():
            raise DuplicateAssetCodeException()
            
        if data.serial_number:
            serial_check = await db.execute(select(ProductAsset).where(ProductAsset.serial_number == data.serial_number, ProductAsset.organization_id == org_id))
            if serial_check.scalars().first():
                raise DuplicateSerialNumberException()
        
        asset = ProductAsset(
            organization_id=org_id,
            **data.model_dump()
        )
        db.add(asset)
        await db.commit()
        await db.refresh(asset)
        return asset

    @staticmethod
    async def get_asset(db: AsyncSession, org_id: UUID, asset_id: UUID) -> ProductAsset:
        result = await db.execute(
            select(ProductAsset)
            .where(ProductAsset.id == asset_id, ProductAsset.organization_id == org_id)
        )
        asset = result.scalars().first()
        if not asset:
            raise AssetNotFoundException()
        return asset

    @staticmethod
    async def list_assets(db: AsyncSession, org_id: UUID) -> List[ProductAsset]:
        result = await db.execute(select(ProductAsset).where(ProductAsset.organization_id == org_id))
        return list(result.scalars().all())

    @staticmethod
    async def update_asset(db: AsyncSession, org_id: UUID, asset_id: UUID, data: AssetUpdate) -> ProductAsset:
        asset = await AssetService.get_asset(db, org_id, asset_id)
        
        if data.asset_code and data.asset_code != asset.asset_code:
            code_check = await db.execute(select(ProductAsset).where(ProductAsset.asset_code == data.asset_code, ProductAsset.organization_id == org_id))
            if code_check.scalars().first():
                raise DuplicateAssetCodeException()
                
        if data.serial_number and data.serial_number != asset.serial_number:
            serial_check = await db.execute(select(ProductAsset).where(ProductAsset.serial_number == data.serial_number, ProductAsset.organization_id == org_id))
            if serial_check.scalars().first():
                raise DuplicateSerialNumberException()
        
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(asset, key, value)
            
        await db.commit()
        await db.refresh(asset)
        return asset

    @staticmethod
    async def transition_asset(db: AsyncSession, org_id: UUID, asset_id: UUID, target_status: AssetStatus) -> ProductAsset:
        asset = await AssetService.get_asset(db, org_id, asset_id)
        current = asset.status
        
        valid = False
        if current == AssetStatus.AVAILABLE and target_status == AssetStatus.RESERVED:
            valid = True
        elif current == AssetStatus.RESERVED and target_status == AssetStatus.READY_FOR_PICKUP:
            valid = True
        elif current == AssetStatus.READY_FOR_PICKUP and target_status == AssetStatus.ACTIVE:
            valid = True
        elif current == AssetStatus.ACTIVE and target_status == AssetStatus.RETURN_INSPECTION:
            valid = True
        elif current == AssetStatus.RETURN_INSPECTION and target_status in [AssetStatus.AVAILABLE, AssetStatus.MAINTENANCE]:
            valid = True
        elif current == AssetStatus.MAINTENANCE and target_status == AssetStatus.AVAILABLE:
            valid = True
        elif target_status == AssetStatus.RETIRED:
            valid = True  # Can retire from almost any state except active maybe, but let's allow it

        if not valid:
            raise InvalidAssetTransitionException()
            
        asset.status = target_status
        await db.commit()
        await db.refresh(asset)
        return asset

    @staticmethod
    async def get_passport(db: AsyncSession, asset_id: UUID) -> AssetPassportResponse:
        # Note: passport is accessed by asset_id (could be public, no org_id enforcement needed to view basic passport if QR scanned, but let's keep it safe)
        result = await db.execute(
            select(ProductAsset)
            .options(selectinload(ProductAsset.product), selectinload(ProductAsset.variant))
            .where(ProductAsset.id == asset_id)
        )
        asset = result.scalars().first()
        if not asset:
            raise AssetNotFoundException()
            
        return AssetPassportResponse(
            asset_id=asset.id,
            qr_token=asset.qr_token,
            asset_code=asset.asset_code,
            product_name=asset.product.name,
            variant_name=asset.variant.name if asset.variant else None,
            status=asset.status,
            condition=asset.condition,
            rental_count=asset.rental_count,
            last_maintenance_at=asset.last_maintenance_at,
            next_maintenance_at=asset.next_maintenance_at
        )
        
    @staticmethod
    async def is_asset_available(db: AsyncSession, org_id: UUID, asset_id: UUID, start_datetime: datetime, end_datetime: datetime) -> bool:
        asset = await AssetService.get_asset(db, org_id, asset_id)
        if asset.status in [AssetStatus.MAINTENANCE, AssetStatus.RETIRED]:
            return False
            
        # In Phase 4, we will check actual rental overlap here.
        # For now, it's just based on status.
        return True
