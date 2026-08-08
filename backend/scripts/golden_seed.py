import asyncio
import sys
import os
import random
from datetime import datetime, timezone, timedelta
from decimal import Decimal

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.core.database import AsyncSessionLocal
from sqlalchemy.future import select
from sqlalchemy import update
from app.organizations.models import Organization
from app.users.models import User
from app.customers.models import Customer
from app.products.models import Product
from app.assets.models import ProductAsset
from app.rentals.models import Rental
from app.rentals.schemas import RentalCreate, RentalItemCreate
from app.rentals.service import RentalService
from app.common.enums import OrganizationStatus, UserRole, CustomerStatus, ProductCategory, AssetStatus, AssetCondition, PickupMethod, RentalStatus
from app.core.security import get_password_hash
from app.trust.service import TrustService
from app.payments.service import PaymentService
from app.payments.schemas import PaymentCreateRequest

async def run_golden_seed():
    async with AsyncSessionLocal() as session:
        print("Starting Golden Demo Seed...")
        org_slug = "rovia-demo"
        result = await session.execute(select(Organization).where(Organization.slug == org_slug))
        org = result.scalars().first()
        if not org:
            org = Organization(name="Rovia Demo", slug=org_slug, status=OrganizationStatus.ACTIVE)
            session.add(org)
            await session.commit()
            await session.refresh(org)

        # Users
        admin = await session.execute(select(User).where(User.email == "admin@rovia.demo"))
        admin = admin.scalars().first()
        if not admin:
            admin = User(organization_id=org.id, email="admin@rovia.demo", password_hash=get_password_hash("rovia"), first_name="Admin", last_name="User", role=UserRole.ADMIN)
            session.add(admin)

        cust_user = await session.execute(select(User).where(User.email == "customer@rovia.demo"))
        cust_user = cust_user.scalars().first()
        if not cust_user:
            cust_user = User(organization_id=org.id, email="customer@rovia.demo", password_hash=get_password_hash("rovia"), first_name="Demo", last_name="Customer", role=UserRole.CUSTOMER)
            session.add(cust_user)
        
        await session.commit()

        # Customer
        customer = await session.execute(select(Customer).where(Customer.email == "customer@rovia.demo"))
        customer = customer.scalars().first()
        if not customer:
            customer = Customer(organization_id=org.id, linked_user_id=cust_user.id, customer_number="CUST-0001", name="Demo Customer", email="customer@rovia.demo", status=CustomerStatus.ACTIVE)
            session.add(customer)
            await session.commit()

        # Products
        cam_res = await session.execute(select(Product).where(Product.slug == "sony-a7siii"))
        cam = cam_res.scalars().first()
        if not cam:
            cam = Product(organization_id=org.id, name="Sony A7S III", slug="sony-a7siii", category=ProductCategory.CAMERA, base_rental_price=100.0, security_deposit_configuration=500.0)
            session.add(cam)
        
        lens_res = await session.execute(select(Product).where(Product.slug == "sony-24-70"))
        lens = lens_res.scalars().first()
        if not lens:
            lens = Product(organization_id=org.id, name="Sony 24-70mm f/2.8 GM", slug="sony-24-70", category=ProductCategory.CAMERA, base_rental_price=60.0, security_deposit_configuration=300.0)
            session.add(lens)

        await session.commit()
        await session.refresh(cam)
        await session.refresh(lens)

        # Assets
        cam_assets_res = await session.execute(select(ProductAsset).where(ProductAsset.product_id == cam.id))
        if not cam_assets_res.scalars().first():
            a1 = ProductAsset(organization_id=org.id, product_id=cam.id, asset_code="CAM-A7S3-001", serial_number="SN-10001", status=AssetStatus.AVAILABLE)
            a2 = ProductAsset(organization_id=org.id, product_id=cam.id, asset_code="CAM-A7S3-002", serial_number="SN-10002", status=AssetStatus.AVAILABLE)
            a3 = ProductAsset(organization_id=org.id, product_id=cam.id, asset_code="CAM-A7S3-003", serial_number="SN-10003", status=AssetStatus.AVAILABLE)
            a4 = ProductAsset(organization_id=org.id, product_id=cam.id, asset_code="CAM-A7S3-004", serial_number="SN-10004", status=AssetStatus.AVAILABLE)
            a5 = ProductAsset(organization_id=org.id, product_id=cam.id, asset_code="CAM-A7S3-005", serial_number="SN-10005", status=AssetStatus.AVAILABLE)
            session.add_all([a1, a2, a3, a4, a5])
        
        await session.commit()

        # Trust Profile
        await TrustService.get_or_create_trust(session, org.id, customer.id)
        for i in range(3):
            await TrustService.update_trust_score(session, org.id, customer.id, None, True, True)

        now = datetime.now(timezone.utc)
        
        # 1. Pickup Today (READY_FOR_PICKUP)
        start = now + timedelta(days=1)
        end = now + timedelta(days=3)
        r1 = RentalCreate(start_datetime=start, expected_return_datetime=end, pickup_method=PickupMethod.IN_STORE, items=[RentalItemCreate(product_id=cam.id, quantity=1)])
        rental1 = await RentalService.create_rental(session, org.id, cust_user.id, r1)
        await RentalService.transition_rental(session, org.id, rental1.id, RentalStatus.CONFIRMED, admin)
        await RentalService.transition_rental(session, org.id, rental1.id, RentalStatus.PAYMENT_PENDING, admin)
        p1 = await PaymentService.create_payment(session, org.id, admin, PaymentCreateRequest(rental_id=rental1.id))
        await PaymentService.simulate_success(session, org.id, p1.id, admin)
        await RentalService.transition_rental(session, org.id, rental1.id, RentalStatus.READY_FOR_PICKUP, admin)
        await session.execute(update(Rental).where(Rental.id == rental1.id).values(start_datetime=now - timedelta(hours=1), expected_return_datetime=now + timedelta(days=2)))

        # 2. Return Today (ACTIVE)
        r2 = RentalCreate(start_datetime=start, expected_return_datetime=end, pickup_method=PickupMethod.IN_STORE, items=[RentalItemCreate(product_id=cam.id, quantity=1)])
        rental2 = await RentalService.create_rental(session, org.id, cust_user.id, r2)
        await RentalService.transition_rental(session, org.id, rental2.id, RentalStatus.CONFIRMED, admin)
        await RentalService.transition_rental(session, org.id, rental2.id, RentalStatus.PAYMENT_PENDING, admin)
        p2 = await PaymentService.create_payment(session, org.id, admin, PaymentCreateRequest(rental_id=rental2.id))
        await PaymentService.simulate_success(session, org.id, p2.id, admin)
        await RentalService.transition_rental(session, org.id, rental2.id, RentalStatus.READY_FOR_PICKUP, admin)
        await RentalService.transition_rental(session, org.id, rental2.id, RentalStatus.PICKED_UP, admin)
        await RentalService.transition_rental(session, org.id, rental2.id, RentalStatus.ACTIVE, admin)
        await session.execute(update(Rental).where(Rental.id == rental2.id).values(start_datetime=now - timedelta(days=2), expected_return_datetime=now + timedelta(hours=1)))

        # 3. Overdue (ACTIVE, expected past)
        r3 = RentalCreate(start_datetime=start, expected_return_datetime=end, pickup_method=PickupMethod.IN_STORE, items=[RentalItemCreate(product_id=cam.id, quantity=1)])
        rental3 = await RentalService.create_rental(session, org.id, cust_user.id, r3)
        await RentalService.transition_rental(session, org.id, rental3.id, RentalStatus.CONFIRMED, admin)
        await RentalService.transition_rental(session, org.id, rental3.id, RentalStatus.PAYMENT_PENDING, admin)
        p3 = await PaymentService.create_payment(session, org.id, admin, PaymentCreateRequest(rental_id=rental3.id))
        await PaymentService.simulate_success(session, org.id, p3.id, admin)
        await RentalService.transition_rental(session, org.id, rental3.id, RentalStatus.READY_FOR_PICKUP, admin)
        await RentalService.transition_rental(session, org.id, rental3.id, RentalStatus.PICKED_UP, admin)
        await RentalService.transition_rental(session, org.id, rental3.id, RentalStatus.ACTIVE, admin)
        await session.execute(update(Rental).where(Rental.id == rental3.id).values(start_datetime=now - timedelta(days=5), expected_return_datetime=now - timedelta(days=1), status=RentalStatus.OVERDUE))
        
        await session.commit()

        print("Golden Seed Complete!")

if __name__ == "__main__":
    asyncio.run(run_golden_seed())
