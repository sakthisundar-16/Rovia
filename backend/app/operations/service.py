import uuid
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime, timezone

from app.rentals.models import Rental
from app.rentals.service import RentalService
from app.assets.models import ProductAsset
from app.common.enums import RentalStatus, AssetStatus
from app.common.exceptions import (
    InvalidRentalTransitionException,
    InvalidQRException
)
from app.users.models import User
from app.operations.schemas import ReturnRequest


class OperationsService:
    @staticmethod
    async def process_pickup(db: AsyncSession, org_id: uuid.UUID, rental_id: uuid.UUID, qr_tokens: List[str], actor: User, notes: str = None) -> Rental:
        rental = await RentalService.get_rental(db, org_id, rental_id)
        if rental.status != RentalStatus.READY_FOR_PICKUP:
            raise InvalidRentalTransitionException()
            
        # Verify QR tokens
        allocated_asset_ids = [item.asset_id for item in rental.items if item.asset_id]
        if not allocated_asset_ids:
            # If no physical assets are allocated, just transition
            pass
        else:
            result = await db.execute(
                select(ProductAsset).where(ProductAsset.id.in_(allocated_asset_ids))
            )
            assets = result.scalars().all()
            
            valid_qr_tokens = set(asset.qr_token for asset in assets)
            provided_qr_tokens = set(qr_tokens)
            
            if not valid_qr_tokens.issubset(provided_qr_tokens):
                missing = valid_qr_tokens - provided_qr_tokens
                raise InvalidQRException()
                
        # Update Rental to PICKED_UP then ACTIVE
        rental = await RentalService.transition_rental(db, org_id, rental_id, RentalStatus.PICKED_UP, actor)
        rental = await RentalService.transition_rental(db, org_id, rental_id, RentalStatus.ACTIVE, actor)
        
        if notes:
            rental.notes = (rental.notes or "") + f"\nPickup Notes: {notes}"
            await db.commit()
            await db.refresh(rental)
            
        return rental

    @staticmethod
    async def process_return(db: AsyncSession, org_id: uuid.UUID, rental_id: uuid.UUID, data: 'ReturnRequest', actor: User) -> Rental:
        from app.operations.models import DamageReport
        from app.assets.service import AssetService
        from app.common.enums import AssetCondition
        
        rental = await RentalService.get_rental(db, org_id, rental_id)
        if rental.status not in [RentalStatus.ACTIVE, RentalStatus.RETURN_DUE, RentalStatus.OVERDUE]:
            raise InvalidRentalTransitionException()
            
        # Update Rental to RETURNED
        rental = await RentalService.transition_rental(db, org_id, rental_id, RentalStatus.RETURNED, actor)
        
        # Log actual return time
        rental.actual_return_datetime = data.actual_return_datetime
        if data.notes:
            rental.notes = (rental.notes or "") + f"\nReturn Notes: {data.notes}"
            
        has_damage = False
        
        for asset_info in data.assets:
            # Create DamageReport if needed
            is_damaged = asset_info.condition in ["DAMAGED", "CRITICAL"]
            has_missing = len(asset_info.missing_accessories) > 0
            
            if is_damaged or has_missing or asset_info.estimated_charge > 0:
                has_damage = True
                severity = "CRITICAL" if asset_info.condition == "CRITICAL" else "MAJOR" if is_damaged else "MISSING_ACCESSORY"
                report = DamageReport(
                    organization_id=org_id,
                    rental_id=rental_id,
                    asset_id=asset_info.asset_id,
                    severity=severity,
                    description=asset_info.damage_notes or f"Missing accessories: {asset_info.missing_accessories}",
                    estimated_charge=asset_info.estimated_charge,
                    created_by=actor.id
                )
                db.add(report)
                
            # Update asset status & condition
            asset = await AssetService.get_asset(db, org_id, asset_info.asset_id)
            asset.condition = AssetCondition(asset_info.condition)
            await AssetService.transition_asset(db, org_id, asset.id, AssetStatus.RETURN_INSPECTION)
            
            if is_damaged:
                from app.maintenance.models import MaintenanceTicket, MaintenanceStatus
                ticket = MaintenanceTicket(
                    organization_id=org_id,
                    asset_id=asset.id,
                    rental_id=rental_id,
                    issue=asset_info.damage_notes or "Automatic ticket created due to damage on return.",
                    severity="CRITICAL" if asset.condition.value == "CRITICAL" else "MAJOR",
                    status=MaintenanceStatus.OPEN,
                    repair_cost=asset_info.estimated_charge
                )
                db.add(ticket)
                await AssetService.transition_asset(db, org_id, asset.id, AssetStatus.MAINTENANCE)
            
        # Transition to INSPECTION
        rental = await RentalService.transition_rental(db, org_id, rental_id, RentalStatus.INSPECTION, actor)
        
        await db.commit()
        await db.refresh(rental)
        
        # Trigger settlement process
        from app.pricing.service import PricingService
        from app.deposits.service import DepositService
        from decimal import Decimal
        
        hourly_rate = Decimal('200.00')
        if rental.items:
            # Approximate hourly rate based on daily price
            hourly_rate = (rental.items[0].unit_price / Decimal('24')).quantize(Decimal('0.00'))
            
        late_fee = PricingService.calculate_late_fee(
            expected_return=rental.expected_return_datetime,
            actual_return=rental.actual_return_datetime,
            hourly_rate=hourly_rate
        )
        
        damage_fee = sum([a.estimated_charge for a in data.assets])
        
        if rental.has_protection_plan and rental.protection_limit > 0:
            # Plan covers up to the limit, so customer pays what exceeds the limit
            if damage_fee > rental.protection_limit:
                damage_fee -= rental.protection_limit
            else:
                damage_fee = Decimal('0.00')
        
        if rental.security_deposit_amount > Decimal('0.00'):
            await DepositService.settle_deposit(db, org_id, rental_id, late_fee=late_fee, damage_fee=damage_fee)
            
        rental = await RentalService.transition_rental(db, org_id, rental_id, RentalStatus.SETTLEMENT, actor)
        rental = await RentalService.transition_rental(db, org_id, rental_id, RentalStatus.COMPLETED, actor)
        
        # Update Trust Index
        from app.trust.service import TrustService
        is_on_time = late_fee == Decimal('0.00')
        is_damage_free = not has_damage
        await TrustService.update_trust_score(db, org_id, rental.customer_id, rental.id, is_on_time, is_damage_free)
        
        await db.commit()
        await db.refresh(rental)
        
        return rental

    @staticmethod
    async def process_sync(db: AsyncSession, org_id: uuid.UUID, data: "SyncRequest", actor: User) -> "SyncResponse":
        from app.operations.models import OfflineAction, OfflineActionStatus
        from app.operations.schemas import SyncResponse, PickupRequest, ReturnRequest
        from sqlalchemy import select
        
        processed = 0
        failed = 0
        results = {}

        for action in data.actions:
            stmt = select(OfflineAction).where(OfflineAction.action_id == action.action_id)
            existing = (await db.execute(stmt)).scalars().first()
            
            if existing and existing.status == OfflineActionStatus.SUCCESS:
                results[action.action_id] = "SUCCESS"
                continue
            
            offline_action = existing or OfflineAction(
                organization_id=org_id,
                action_id=action.action_id,
                action_type=action.action_type,
                rental_id=action.rental_id,
                payload=action.payload,
                created_by=actor.id
            )
            if not existing:
                db.add(offline_action)
            await db.commit() # Save pending status
            
            try:
                if action.action_type == "PICKUP":
                    pickup_req = PickupRequest(**action.payload)
                    await OperationsService.process_pickup(db, org_id, action.rental_id, pickup_req.scanned_qr_tokens, actor, pickup_req.notes)
                elif action.action_type == "RETURN":
                    return_req = ReturnRequest(**action.payload)
                    await OperationsService.process_return(db, org_id, action.rental_id, return_req, actor)
                else:
                    raise ValueError(f"Unknown action type {action.action_type}")
                
                offline_action.status = OfflineActionStatus.SUCCESS
                offline_action.processed_at = datetime.now(timezone.utc)
                results[action.action_id] = "SUCCESS"
                processed += 1
            except Exception as e:
                offline_action.status = OfflineActionStatus.FAILED
                offline_action.error_message = str(e)
                offline_action.processed_at = datetime.now(timezone.utc)
                results[action.action_id] = "FAILED"
                failed += 1
                
            db.add(offline_action)
            await db.commit()
            
        return SyncResponse(processed=processed, failed=failed, results=results)
