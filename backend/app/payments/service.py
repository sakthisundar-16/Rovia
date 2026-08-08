import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.payments.models import Payment
from app.payments.schemas import PaymentCreateRequest
from app.payments.provider import DemoPaymentProvider
from app.rentals.service import RentalService
from app.deposits.service import DepositService
from app.common.enums import PaymentStatus, PaymentType, RentalStatus
from app.common.exceptions import (
    PaymentNotFoundException,
    InvalidRentalTransitionException,
    DemoModeDisabledException,
    TenantAccessDeniedException
)
from app.users.models import User
from app.core.config import settings

class PaymentService:
    @staticmethod
    async def create_payment(db: AsyncSession, org_id: uuid.UUID, actor: User, data: PaymentCreateRequest) -> Payment:
        # Check rental (and isolate to customer if customer)
        is_customer = actor.role.value == "CUSTOMER"
        rental = await RentalService.get_rental(db, org_id, data.rental_id, actor.id if is_customer else None)
        
        if rental.status != RentalStatus.PAYMENT_PENDING:
            raise InvalidRentalTransitionException()

        now = datetime.now(timezone.utc)
        payment_ref = f"ROV-PAY-{now.year}-{uuid.uuid4().hex[:6].upper()}"
        
        amount_due = rental.total_amount # In Phase 5, total_amount already includes security_deposit (from PricingService applied to Rental in next step)
        
        provider_ref, redirect_url = DemoPaymentProvider.initiate_payment(amount_due, "INR", payment_ref)
        
        payment = Payment(
            organization_id=org_id,
            rental_id=rental.id,
            payment_reference=payment_ref,
            payment_type=PaymentType.RENTAL,
            amount=amount_due,
            currency="INR",
            status=PaymentStatus.PENDING,
            provider="DEMO",
            provider_reference=provider_ref,
            payment_metadata={"redirect_url": redirect_url}
        )
        
        db.add(payment)
        await db.commit()
        await db.refresh(payment)
        
        return payment

    @staticmethod
    async def get_payment(db: AsyncSession, org_id: uuid.UUID, payment_id: uuid.UUID, customer_id: Optional[uuid.UUID] = None) -> Payment:
        query = select(Payment).join(Payment.rental).where(Payment.id == payment_id, Payment.organization_id == org_id)
        if customer_id:
            # Requires importing Rental to join properly, let's just do it directly
            from app.rentals.models import Rental
            query = query.where(Rental.customer_id == customer_id)
            
        result = await db.execute(query)
        payment = result.scalars().first()
        if not payment:
            raise PaymentNotFoundException()
        return payment

    @staticmethod
    async def simulate_success(db: AsyncSession, org_id: uuid.UUID, payment_id: uuid.UUID, actor: User) -> Payment:
        if not settings.DEMO_MODE:
            raise DemoModeDisabledException()
            
        payment = await PaymentService.get_payment(db, org_id, payment_id, actor.id if actor.role.value == "CUSTOMER" else None)
        
        # Idempotency check
        if payment.status == PaymentStatus.SUCCESS:
            return payment
            
        payment.status = PaymentStatus.SUCCESS
        await db.flush()
        
        # Transactional Financial Operation
        rental = await RentalService.get_rental(db, org_id, payment.rental_id)
        
        # Collect deposit if required
        from app.deposits.models import DepositAccount
        dep_acc = await db.execute(select(DepositAccount).where(DepositAccount.rental_id == rental.id))
        if dep_acc.scalars().first():
            # In Phase 5 we bundle deposit in total_due. So this single payment covers it.
            # Record collection
            await DepositService.record_collection(db, org_id, rental.id, rental.security_deposit_amount)
            
        # Transition rental
        await RentalService.transition_rental(db, org_id, rental.id, RentalStatus.PAYMENT_COMPLETED, actor)
        
        await db.commit()
        await db.refresh(payment)
        return payment

    @staticmethod
    async def simulate_failure(db: AsyncSession, org_id: uuid.UUID, payment_id: uuid.UUID, actor: User) -> Payment:
        if not settings.DEMO_MODE:
            raise DemoModeDisabledException()
            
        payment = await PaymentService.get_payment(db, org_id, payment_id, actor.id if actor.role.value == "CUSTOMER" else None)
        
        if payment.status == PaymentStatus.SUCCESS:
            raise InvalidRentalTransitionException() # Cannot fail a successful payment
            
        payment.status = PaymentStatus.FAILED
        await db.commit()
        await db.refresh(payment)
        return payment
