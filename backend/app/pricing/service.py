from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from decimal import Decimal
import uuid

from app.pricing.schemas import PricingPreviewRequest, PricingPreviewResponse
from app.products.models import Product, ProductVariant
from app.common.exceptions import ProductNotFoundException

class PricingService:
    @staticmethod
    async def calculate_preview(db: AsyncSession, org_id: uuid.UUID, data: PricingPreviewRequest) -> PricingPreviewResponse:
        subtotal = Decimal('0.00')
        security_deposit = Decimal('0.00')
        
        days = (data.expected_return_datetime - data.start_datetime).days
        if days < 1:
            days = 1
            
        for item in data.items:
            result = await db.execute(select(Product).where(Product.id == item.product_id, Product.organization_id == org_id))
            product = result.scalars().first()
            
            if not product:
                raise ProductNotFoundException()
                
            unit_price = product.base_rental_price
            
            if item.variant_id:
                var_res = await db.execute(select(ProductVariant).where(ProductVariant.id == item.variant_id, ProductVariant.product_id == product.id))
                variant = var_res.scalars().first()
                if variant:
                    unit_price += variant.price_adjustment

            item_total = unit_price * days * item.quantity
            subtotal += item_total
            
            # Basic security deposit sum
            security_deposit += (product.security_deposit_configuration * item.quantity)
            
        if data.customer_id and security_deposit > Decimal('0.00'):
            from app.trust.service import TrustService
            smart_deposit = await TrustService.calculate_smart_deposit(db, org_id, data.customer_id, security_deposit)
            security_deposit = smart_deposit.required_deposit
            
        protection_fee = Decimal('0.00')
        protection_limit = Decimal('0.00')
        if data.has_protection_plan:
            protection_fee = subtotal * Decimal('0.10') # 10% of subtotal
            protection_limit = protection_fee * Decimal('10') # covers up to 10x the fee
            
        discount = Decimal('0.00')
        tax = Decimal('0.00') # Tax engine placeholder
        rental_total = subtotal + protection_fee - discount + tax
        total_due = rental_total + security_deposit
        
        return PricingPreviewResponse(
            subtotal=subtotal,
            discount=discount,
            tax=tax,
            protection_fee=protection_fee,
            protection_limit=protection_limit,
            rental_total=rental_total,
            security_deposit=security_deposit,
            total_due=total_due,
            currency="INR"
        )

    @staticmethod
    def calculate_late_fee(expected_return, actual_return, hourly_rate: Decimal, grace_minutes: int = 30, penalty_percentage: Decimal = Decimal('1.5'), max_cap: Decimal = Decimal('10000.00')) -> Decimal:
        import math
        if actual_return <= expected_return:
            return Decimal('0.00')
            
        delta = actual_return - expected_return
        minutes_late = int(delta.total_seconds() / 60)
        
        if minutes_late <= grace_minutes:
            return Decimal('0.00')
            
        chargeable_hours = math.ceil((minutes_late - grace_minutes) / 60.0)
        fee = Decimal(str(chargeable_hours)) * hourly_rate * penalty_percentage
        fee = min(fee, max_cap)
        return fee.quantize(Decimal('0.00'))

