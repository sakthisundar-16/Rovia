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
            
            # Simple deposit calculation: fixed amount per unit (from product.security_deposit_configuration)
            # Future expansion could support percentage-based deposits here
            security_deposit += (product.security_deposit_configuration * item.quantity)
            
        discount = Decimal('0.00')
        tax = Decimal('0.00') # Tax engine placeholder
        rental_total = subtotal - discount + tax
        total_due = rental_total + security_deposit
        
        return PricingPreviewResponse(
            subtotal=subtotal,
            discount=discount,
            tax=tax,
            rental_total=rental_total,
            security_deposit=security_deposit,
            total_due=total_due,
            currency="INR"
        )
