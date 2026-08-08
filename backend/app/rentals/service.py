import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import or_, and_, update

from app.rentals.models import Rental, RentalItem
from app.rentals.schemas import RentalCreate
from app.products.models import Product
from app.assets.models import ProductAsset
from app.common.enums import RentalStatus, AssetStatus
from app.common.exceptions import (
    RentalNotFoundException,
    InvalidRentalTransitionException,
    InvalidRentalDatesException,
    PastDatesProhibitedException,
    ProductNotFoundException,
    ProductInactiveException,
    InsufficientAssetAvailabilityException,
    TenantAccessDeniedException
)
from app.users.models import User

class RentalService:
    @staticmethod
    async def is_asset_available(
        db: AsyncSession,
        org_id: uuid.UUID,
        asset_id: uuid.UUID,
        start_dt: datetime,
        end_dt: datetime,
        exclude_rental_id: Optional[uuid.UUID] = None
    ) -> bool:
        # 1. Check current asset status (e.g., MAINTENANCE or RETIRED are strictly blocked)
        asset_result = await db.execute(select(ProductAsset).where(ProductAsset.id == asset_id, ProductAsset.organization_id == org_id))
        asset = asset_result.scalars().first()
        if not asset or asset.status in [AssetStatus.MAINTENANCE, AssetStatus.RETIRED]:
            return False

        # 2. Check for overlapping rentals
        # An overlap occurs if: rental.start < requested.end AND rental.end > requested.start
        blocking_statuses = [
            RentalStatus.DRAFT,
            RentalStatus.QUOTED,
            RentalStatus.CONFIRMED,
            RentalStatus.PAYMENT_PENDING,
            RentalStatus.PAYMENT_COMPLETED,
            RentalStatus.READY_FOR_PICKUP,
            RentalStatus.PICKED_UP,
            RentalStatus.ACTIVE,
            RentalStatus.RETURN_DUE,
            RentalStatus.OVERDUE,
            RentalStatus.INSPECTION
        ]
        
        query = (
            select(RentalItem)
            .join(Rental)
            .where(
                RentalItem.asset_id == asset_id,
                Rental.status.in_(blocking_statuses),
                Rental.start_datetime < end_dt,
                Rental.expected_return_datetime > start_dt
            )
        )
        if exclude_rental_id:
            query = query.where(Rental.id != exclude_rental_id)
            
        result = await db.execute(query)
        overlapping_item = result.scalars().first()
        
        return overlapping_item is None

    @staticmethod
    async def create_rental(db: AsyncSession, org_id: uuid.UUID, customer_id: uuid.UUID, data: RentalCreate) -> Rental:
        now = datetime.now(timezone.utc)
        
        # Validate dates
        if data.start_datetime >= data.expected_return_datetime:
            raise InvalidRentalDatesException()
        if data.start_datetime < now:
            raise PastDatesProhibitedException()

        # Generate Rental Number
        rental_num = f"ROV-{now.year}-{uuid.uuid4().hex[:6].upper()}"

        rental = Rental(
            organization_id=org_id,
            customer_id=customer_id,
            rental_number=rental_num,
            start_datetime=data.start_datetime,
            expected_return_datetime=data.expected_return_datetime,
            pickup_method=data.pickup_method,
            notes=data.notes,
            status=RentalStatus.DRAFT,
            created_by=customer_id
        )
        db.add(rental)
        await db.flush()  # to get rental.id

        subtotal = Decimal('0.00')

        # Allocate assets transactionally
        for item_data in data.items:
            # Check product
            prod_result = await db.execute(select(Product).where(Product.id == item_data.product_id, Product.organization_id == org_id))
            product = prod_result.scalars().first()
            if not product:
                raise ProductNotFoundException()
            if not product.is_active:
                raise ProductInactiveException()

            # Find available physical assets
            # Lock rows to prevent concurrent double booking
            assets_result = await db.execute(
                select(ProductAsset)
                .where(ProductAsset.product_id == product.id, ProductAsset.organization_id == org_id)
                .with_for_update()
            )
            all_assets = assets_result.scalars().all()
            
            allocated_assets = []
            for asset in all_assets:
                if len(allocated_assets) == item_data.quantity:
                    break
                if await RentalService.is_asset_available(db, org_id, asset.id, data.start_datetime, data.expected_return_datetime):
                    allocated_assets.append(asset)
            
            if len(allocated_assets) < item_data.quantity:
                raise InsufficientAssetAvailabilityException(product.name)

            # Create RentalItems for each allocated asset (1 item per physical asset allocated)
            days = (data.expected_return_datetime - data.start_datetime).days or 1
            unit_price = product.base_rental_price
            if item_data.variant_id:
                var_res = await db.execute(select(ProductVariant).where(ProductVariant.id == item_data.variant_id))
                variant = var_res.scalars().first()
                if variant:
                    unit_price += variant.price_adjustment
            
            for asset in allocated_assets:
                r_item = RentalItem(
                    rental_id=rental.id,
                    product_id=product.id,
                    variant_id=item_data.variant_id,
                    asset_id=asset.id,
                    quantity=1,
                    unit_price=unit_price,
                    rental_days=days,
                    line_total=unit_price * days
                )
                db.add(r_item)

        # Use PricingService to calculate totals correctly
        from app.pricing.service import PricingService
        from app.pricing.schemas import PricingPreviewRequest, PricingItemRequest
        
        pricing_req = PricingPreviewRequest(
            start_datetime=data.start_datetime,
            expected_return_datetime=data.expected_return_datetime,
            items=[PricingItemRequest(product_id=i.product_id, variant_id=i.variant_id, quantity=i.quantity) for i in data.items]
        )
        
        preview = await PricingService.calculate_preview(db, org_id, pricing_req)
        
        rental.subtotal = preview.subtotal
        rental.discount_amount = preview.discount
        rental.tax_amount = preview.tax
        rental.security_deposit_amount = preview.security_deposit
        rental.total_amount = preview.total_due
        
        await db.commit()
        await db.refresh(rental)
        
        # Initialize DepositAccount if required
        if rental.security_deposit_amount > Decimal('0.00'):
            from app.deposits.service import DepositService
            await DepositService.create_or_update_requirement(db, org_id, rental.id, rental.security_deposit_amount)
        
        # Load items for response
        return await RentalService.get_rental(db, org_id, rental.id)

    @staticmethod
    async def get_rental(db: AsyncSession, org_id: uuid.UUID, rental_id: uuid.UUID, customer_id: Optional[uuid.UUID] = None) -> Rental:
        query = select(Rental).options(selectinload(Rental.items)).where(Rental.id == rental_id, Rental.organization_id == org_id)
        if customer_id:
            query = query.where(Rental.customer_id == customer_id)
            
        result = await db.execute(query)
        rental = result.scalars().first()
        if not rental:
            raise RentalNotFoundException()
        return rental

    @staticmethod
    async def list_rentals(db: AsyncSession, org_id: uuid.UUID, customer_id: Optional[uuid.UUID] = None, status_filter: Optional[RentalStatus] = None) -> List[Rental]:
        query = select(Rental).options(selectinload(Rental.items)).where(Rental.organization_id == org_id)
        if customer_id:
            query = query.where(Rental.customer_id == customer_id)
        if status_filter:
            query = query.where(Rental.status == status_filter)
            
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def transition_rental(db: AsyncSession, org_id: uuid.UUID, rental_id: uuid.UUID, target_status: RentalStatus, actor: User) -> Rental:
        rental = await RentalService.get_rental(db, org_id, rental_id)
        current = rental.status
        
        # Only internal operations/admin can transition beyond Draft natively (or if customer pays, via payment webhook later)
        is_customer = actor.role.value == "CUSTOMER"
        
        # Valid Transitions Map
        valid = False
        if current == RentalStatus.DRAFT and target_status in [RentalStatus.QUOTED, RentalStatus.CONFIRMED, RentalStatus.CANCELLED]:
            valid = True
        elif current == RentalStatus.QUOTED and target_status in [RentalStatus.CONFIRMED, RentalStatus.CANCELLED]:
            valid = True
        elif current == RentalStatus.CONFIRMED and target_status in [RentalStatus.PAYMENT_PENDING, RentalStatus.CANCELLED]:
            valid = True
        elif current == RentalStatus.PAYMENT_PENDING and target_status in [RentalStatus.PAYMENT_COMPLETED, RentalStatus.CANCELLED]:
            valid = True
        elif current == RentalStatus.PAYMENT_COMPLETED and target_status == RentalStatus.READY_FOR_PICKUP:
            # Enforce deposit requirement
            if rental.security_deposit_amount > Decimal('0.00'):
                from app.deposits.service import DepositService
                from app.common.enums import DepositStatus
                
                dep_acc = await DepositService.get_deposit_account(db, org_id, rental.id)
                if dep_acc.status not in [DepositStatus.HELD, DepositStatus.SETTLED]:
                    # For demo purposes, we enforce it tightly
                    raise InvalidRentalTransitionException()
            valid = True
        elif current == RentalStatus.READY_FOR_PICKUP and target_status in [RentalStatus.PICKED_UP, RentalStatus.CANCELLED]:
            valid = True
        elif current == RentalStatus.PICKED_UP and target_status == RentalStatus.ACTIVE:
            valid = True
        elif current == RentalStatus.ACTIVE and target_status in [RentalStatus.RETURN_DUE, RentalStatus.OVERDUE, RentalStatus.RETURNED]:
            valid = True
        elif current == RentalStatus.RETURN_DUE and target_status in [RentalStatus.RETURNED, RentalStatus.OVERDUE]:
            valid = True
        elif current == RentalStatus.OVERDUE and target_status == RentalStatus.RETURNED:
            valid = True
        elif current == RentalStatus.RETURNED and target_status == RentalStatus.INSPECTION:
            valid = True
        elif current == RentalStatus.INSPECTION and target_status == RentalStatus.SETTLEMENT:
            valid = True
        elif current == RentalStatus.SETTLEMENT and target_status == RentalStatus.COMPLETED:
            valid = True
            
        if not valid:
            raise InvalidRentalTransitionException()
            
        if is_customer and target_status not in [RentalStatus.CANCELLED]:
            # Customers cannot arbitrarily progress states
            raise TenantAccessDeniedException()

        rental.status = target_status
        
        # If transitioning to CONFIRMED, mark assets as RESERVED
        if target_status == RentalStatus.CONFIRMED:
            for item in rental.items:
                if item.asset_id:
                    await db.execute(update(ProductAsset).where(ProductAsset.id == item.asset_id).values(status=AssetStatus.RESERVED))
        
        # If transitioning to PICKED_UP or ACTIVE, mark assets as ACTIVE
        if target_status in [RentalStatus.PICKED_UP, RentalStatus.ACTIVE]:
            for item in rental.items:
                if item.asset_id:
                    await db.execute(update(ProductAsset).where(ProductAsset.id == item.asset_id).values(status=AssetStatus.ACTIVE))

        # If transitioning to CANCELLED or COMPLETED, release assets (to AVAILABLE, or let return inspection handle it)
        if target_status in [RentalStatus.CANCELLED, RentalStatus.COMPLETED]:
            for item in rental.items:
                if item.asset_id:
                    # In real life, might go to RETURN_INSPECTION. For cancellation, it goes to AVAILABLE.
                    await db.execute(update(ProductAsset).where(ProductAsset.id == item.asset_id).values(status=AssetStatus.AVAILABLE))

        await db.commit()
        await db.refresh(rental)
        return rental

    @staticmethod
    async def cancel_rental(db: AsyncSession, org_id: uuid.UUID, rental_id: uuid.UUID, actor: User) -> None:
        rental = await RentalService.get_rental(db, org_id, rental_id, actor.id if actor.role.value == "CUSTOMER" else None)
        if rental.status not in [RentalStatus.DRAFT, RentalStatus.QUOTED, RentalStatus.CONFIRMED, RentalStatus.PAYMENT_PENDING]:
            raise InvalidRentalTransitionException()
            
        rental.status = RentalStatus.CANCELLED
        
        # Release assets
        for item in rental.items:
            if item.asset_id:
                await db.execute(update(ProductAsset).where(ProductAsset.id == item.asset_id).values(status=AssetStatus.AVAILABLE))
                
        await db.commit()
