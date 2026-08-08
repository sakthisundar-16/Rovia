import uuid
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.trust.models import CustomerTrust, TrustHistory
from app.trust.schemas import SmartDepositResponse

class TrustService:
    @staticmethod
    async def get_or_create_trust(db: AsyncSession, org_id: uuid.UUID, customer_id: uuid.UUID) -> CustomerTrust:
        result = await db.execute(
            select(CustomerTrust)
            .options(selectinload(CustomerTrust.history))
            .where(CustomerTrust.customer_id == customer_id, CustomerTrust.organization_id == org_id)
        )
        trust = result.scalars().first()
        
        if not trust:
            trust = CustomerTrust(
                organization_id=org_id,
                customer_id=customer_id,
                score=50, # Initial score
                total_completed_rentals=0,
                on_time_returns=0,
                damage_free_returns=0
            )
            db.add(trust)
            await db.flush()
            
            history = TrustHistory(
                organization_id=org_id,
                customer_trust_id=trust.id,
                old_score=50,
                new_score=50,
                reason="Initial profile created"
            )
            db.add(history)
            
            await db.commit()
            await db.refresh(trust)
            
        return trust

    @staticmethod
    async def calculate_smart_deposit(db: AsyncSession, org_id: uuid.UUID, customer_id: uuid.UUID, base_deposit: Decimal) -> SmartDepositResponse:
        trust = await TrustService.get_or_create_trust(db, org_id, customer_id)
        score = trust.score
        
        if score >= 90:
            multiplier = 0.25
            reason = "Excellent rental history"
        elif score >= 70:
            multiplier = 0.50
            reason = "Good rental history"
        elif score >= 50:
            multiplier = 1.00
            reason = "Standard deposit applies"
        else:
            multiplier = 1.50
            reason = "Poor rental history"
            
        required_deposit = (base_deposit * Decimal(str(multiplier))).quantize(Decimal('0.00'))
        
        return SmartDepositResponse(
            trust_score=score,
            base_deposit=base_deposit,
            deposit_multiplier=multiplier,
            required_deposit=required_deposit,
            reason=reason
        )

    @staticmethod
    async def update_trust_score(db: AsyncSession, org_id: uuid.UUID, customer_id: uuid.UUID, rental_id: uuid.UUID, is_on_time: bool, is_damage_free: bool) -> CustomerTrust:
        trust = await TrustService.get_or_create_trust(db, org_id, customer_id)
        old_score = trust.score
        
        trust.total_completed_rentals += 1
        if is_on_time:
            trust.on_time_returns += 1
        if is_damage_free:
            trust.damage_free_returns += 1
            
        # Base formula: (on_time_returns / total_completed) * 100
        # Let's add some weight for damage_free
        # e.g. 50% for on-time, 50% for damage free
        on_time_ratio = (trust.on_time_returns / trust.total_completed_rentals)
        damage_ratio = (trust.damage_free_returns / trust.total_completed_rentals)
        
        new_score = int((on_time_ratio * 50) + (damage_ratio * 50))
        
        # Ensure score stays between 0 and 100
        new_score = max(0, min(100, new_score))
        
        if old_score != new_score:
            trust.score = new_score
            
            reasons = []
            if not is_on_time:
                reasons.append("Late return")
            if not is_damage_free:
                reasons.append("Asset damaged")
            if is_on_time and is_damage_free:
                reasons.append("Perfect return")
                
            history = TrustHistory(
                organization_id=org_id,
                customer_trust_id=trust.id,
                rental_id=rental_id,
                old_score=old_score,
                new_score=new_score,
                reason=", ".join(reasons)
            )
            db.add(history)
            
        await db.commit()
        await db.refresh(trust)
        return trust
