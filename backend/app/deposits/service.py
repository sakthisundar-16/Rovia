import uuid
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.deposits.models import DepositAccount, DepositLedgerEntry
from app.common.enums import DepositStatus, LedgerEntryType
from app.common.exceptions import DepositNotFoundException

class DepositService:
    @staticmethod
    async def create_or_update_requirement(db: AsyncSession, org_id: uuid.UUID, rental_id: uuid.UUID, required_amount: Decimal) -> DepositAccount:
        result = await db.execute(select(DepositAccount).where(DepositAccount.rental_id == rental_id, DepositAccount.organization_id == org_id))
        account = result.scalars().first()
        
        if not account:
            account = DepositAccount(
                organization_id=org_id,
                rental_id=rental_id,
                required_amount=required_amount,
                status=DepositStatus.REQUIRED
            )
            db.add(account)
        else:
            account.required_amount = required_amount
            
        await db.commit()
        await db.refresh(account)
        return account

    @staticmethod
    async def get_deposit_account(db: AsyncSession, org_id: uuid.UUID, rental_id: uuid.UUID) -> DepositAccount:
        result = await db.execute(
            select(DepositAccount)
            .options(selectinload(DepositAccount.ledger_entries))
            .where(DepositAccount.rental_id == rental_id, DepositAccount.organization_id == org_id)
        )
        account = result.scalars().first()
        if not account:
            raise DepositNotFoundException()
            
        # Calculate dynamic fields
        collected = Decimal('0.00')
        deducted = Decimal('0.00')
        for entry in account.ledger_entries:
            if entry.entry_type == LedgerEntryType.DEPOSIT_COLLECTED:
                collected += entry.amount
            elif entry.entry_type in [LedgerEntryType.DAMAGE_DEDUCTION, LedgerEntryType.LATE_FEE_DEDUCTION, LedgerEntryType.MISSING_ITEM_DEDUCTION, LedgerEntryType.OTHER_DEDUCTION]:
                deducted += entry.amount
                
        account.collected_amount = collected
        account.deducted_amount = deducted
        account.refundable_amount = collected - deducted
        
        return account

    @staticmethod
    async def record_collection(db: AsyncSession, org_id: uuid.UUID, rental_id: uuid.UUID, amount: Decimal) -> DepositAccount:
        # Idempotent lock could be placed here or handled by payment provider layer.
        account = await DepositService.get_deposit_account(db, org_id, rental_id)
        
        # Prevent double collecting if already held
        if account.status == DepositStatus.HELD:
            return account
            
        entry = DepositLedgerEntry(
            organization_id=org_id,
            account_id=account.id,
            entry_type=LedgerEntryType.DEPOSIT_COLLECTED,
            amount=amount,
            notes="Initial deposit collected via payment"
        )
        db.add(entry)
        
        account.status = DepositStatus.HELD
        await db.commit()
        
        return await DepositService.get_deposit_account(db, org_id, rental_id)

    @staticmethod
    async def settle_deposit(db: AsyncSession, org_id: uuid.UUID, rental_id: uuid.UUID, late_fee: Decimal = Decimal('0.00'), damage_fee: Decimal = Decimal('0.00'), missing_item_fee: Decimal = Decimal('0.00')) -> DepositAccount:
        account = await DepositService.get_deposit_account(db, org_id, rental_id)
        if account.status not in [DepositStatus.HELD, DepositStatus.REQUIRED]:
            # Can only settle if held (or if no deposit required but we need to record fees anyway)
            pass
            
        if late_fee > 0:
            db.add(DepositLedgerEntry(
                organization_id=org_id,
                account_id=account.id,
                entry_type=LedgerEntryType.LATE_FEE_DEDUCTION,
                amount=late_fee,
                notes="Late return fee"
            ))
            
        if damage_fee > 0:
            db.add(DepositLedgerEntry(
                organization_id=org_id,
                account_id=account.id,
                entry_type=LedgerEntryType.DAMAGE_DEDUCTION,
                amount=damage_fee,
                notes="Damage assessment deduction"
            ))
            
        if missing_item_fee > 0:
            db.add(DepositLedgerEntry(
                organization_id=org_id,
                account_id=account.id,
                entry_type=LedgerEntryType.MISSING_ITEM_DEDUCTION,
                amount=missing_item_fee,
                notes="Missing item deduction"
            ))
            
        await db.commit()
        await db.refresh(account)
        
        # Calculate refund
        account = await DepositService.get_deposit_account(db, org_id, rental_id)
        
        if account.refundable_amount > 0:
            db.add(DepositLedgerEntry(
                organization_id=org_id,
                account_id=account.id,
                entry_type=LedgerEntryType.REFUND,
                amount=account.refundable_amount,
                notes="Deposit refund"
            ))
            # If there was a real payment gateway, trigger refund here.
            
        account.status = DepositStatus.SETTLED
        await db.commit()
        
        return await DepositService.get_deposit_account(db, org_id, rental_id)

