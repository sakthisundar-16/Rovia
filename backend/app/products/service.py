from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from uuid import UUID

from app.products.models import Product, ProductVariant
from app.products.schemas import ProductCreate, ProductUpdate
from app.common.enums import ProductCategory
from app.common.exceptions import ProductNotFoundException

class ProductService:
    @staticmethod
    async def create_product(db: AsyncSession, org_id: UUID, data: ProductCreate) -> Product:
        product_dict = data.model_dump(exclude={"variants"})
        product = Product(organization_id=org_id, **product_dict)
        db.add(product)
        await db.flush()

        if data.variants:
            for variant_data in data.variants:
                variant = ProductVariant(
                    organization_id=org_id,
                    product_id=product.id,
                    **variant_data.model_dump()
                )
                db.add(variant)
                
        await db.commit()
        await db.refresh(product)
        # return with variants loaded
        return await ProductService.get_product(db, org_id, product.id)

    @staticmethod
    async def get_product(db: AsyncSession, org_id: UUID, product_id: UUID) -> Product:
        result = await db.execute(
            select(Product)
            .options(selectinload(Product.variants))
            .where(Product.id == product_id, Product.organization_id == org_id)
        )
        product = result.scalars().first()
        if not product:
            raise ProductNotFoundException()
        return product

    @staticmethod
    async def list_products(
        db: AsyncSession, 
        org_id: UUID, 
        active_only: bool = False,
        category: Optional[ProductCategory] = None
    ) -> List[Product]:
        query = select(Product).options(selectinload(Product.variants)).where(Product.organization_id == org_id)
        if active_only:
            query = query.where(Product.is_active == True)
        if category:
            query = query.where(Product.category == category)
            
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def update_product(db: AsyncSession, org_id: UUID, product_id: UUID, data: ProductUpdate) -> Product:
        product = await ProductService.get_product(db, org_id, product_id)
        
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(product, key, value)
            
        await db.commit()
        await db.refresh(product)
        return product

    @staticmethod
    async def delete_product(db: AsyncSession, org_id: UUID, product_id: UUID):
        # Soft delete by deactivating
        product = await ProductService.get_product(db, org_id, product_id)
        product.is_active = False
        await db.commit()
