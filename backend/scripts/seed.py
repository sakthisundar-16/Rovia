import asyncio
import sys
import os
from sqlalchemy import update

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal
from app.organizations.models import Organization
from app.users.models import User
from app.customers.models import Customer
from app.common.enums import OrganizationStatus, UserRole, CustomerStatus
from app.core.security import get_password_hash

async def seed_data():
    async with AsyncSessionLocal() as session:
        print("Starting seed script...")
        
        # 1. Create Organization
        org_slug = "rovia-demo"
        result = await session.execute(select(Organization).where(Organization.slug == org_slug))
        org = result.scalars().first()
        
        if not org:
            org = Organization(
                name="Rovia Demo Rentals",
                slug=org_slug,
                status=OrganizationStatus.ACTIVE
            )
            session.add(org)
            await session.commit()
            await session.refresh(org)
            print(f"Created organization: {org.name}")
        else:
            print(f"Organization '{org.name}' already exists.")
            
        # 2. Create Users
        users_to_create = [
            {"email": "admin@rovia.demo", "role": UserRole.ADMIN, "first": "Admin", "last": "User"},
            {"email": "operations@rovia.demo", "role": UserRole.OPERATIONS, "first": "Ops", "last": "User"},
            {"email": "customer@rovia.demo", "role": UserRole.CUSTOMER, "first": "Customer", "last": "User"}
        ]
        
        created_users = {}
        for u in users_to_create:
            result = await session.execute(select(User).where(User.email == u["email"]))
            user = result.scalars().first()
            if not user:
                user = User(
                    organization_id=org.id,
                    email=u["email"],
                    password_hash=get_password_hash("rovia_demo_123"),
                    first_name=u["first"],
                    last_name=u["last"],
                    role=u["role"]
                )
                session.add(user)
                await session.commit()
                await session.refresh(user)
                print(f"Created user: {user.email} (Role: {user.role})")
            else:
                print(f"User '{user.email}' already exists.")
            created_users[u["role"]] = user
            
        # 3. Create Sample Customer Profile
        customer_email = "customer@rovia.demo"
        result = await session.execute(select(Customer).where(Customer.email == customer_email))
        customer = result.scalars().first()
        
        if not customer:
            customer_user = created_users[UserRole.CUSTOMER]
            customer = Customer(
                organization_id=org.id,
                linked_user_id=customer_user.id,
                customer_number="CUST-0001",
                name="Demo Customer",
                email=customer_email,
                phone="+1234567890",
                address="123 Hackathon St, Demo City",
                status=CustomerStatus.ACTIVE
            )
            session.add(customer)
            print("Created sample customer profile.")
        else:
            print("Sample customer profile already exists.")

        from app.products.models import Product
        from app.assets.models import ProductAsset
        from app.common.enums import ProductCategory, AssetStatus, AssetCondition

        # 4. Create Products
        products_data = [
            {"name": "Sony Alpha Camera", "slug": "sony-alpha", "category": ProductCategory.CAMERA, "price": 50.0},
            {"name": "Epson 4K Projector", "slug": "epson-4k", "category": ProductCategory.PROJECTOR, "price": 100.0},
            {"name": "JBL Professional Speaker", "slug": "jbl-pro", "category": ProductCategory.AUDIO, "price": 75.0},
            {"name": "Honda Portable Generator", "slug": "honda-gen", "category": ProductCategory.GENERATOR, "price": 120.0},
            {"name": "Dell Business Laptop", "slug": "dell-laptop", "category": ProductCategory.LAPTOP, "price": 60.0}
        ]
        
        created_products = {}
        for pd in products_data:
            result = await session.execute(select(Product).where(Product.slug == pd["slug"]))
            prod = result.scalars().first()
            if not prod:
                prod = Product(
                    organization_id=org.id,
                    name=pd["name"],
                    slug=pd["slug"],
                    category=pd["category"],
                    base_rental_price=pd["price"]
                )
                session.add(prod)
                await session.commit()
                await session.refresh(prod)
                print(f"Created product: {prod.name}")
            else:
                print(f"Product '{prod.name}' already exists.")
            created_products[pd["slug"]] = prod

        # 5. Create Assets
        assets_data = [
            {"product_slug": "sony-alpha", "code": "CAM-001", "status": AssetStatus.AVAILABLE},
            {"product_slug": "sony-alpha", "code": "CAM-002", "status": AssetStatus.AVAILABLE},
            {"product_slug": "sony-alpha", "code": "CAM-003", "status": AssetStatus.ACTIVE},
            {"product_slug": "epson-4k", "code": "PROJ-001", "status": AssetStatus.MAINTENANCE},
            {"product_slug": "epson-4k", "code": "PROJ-002", "status": AssetStatus.RESERVED},
            {"product_slug": "jbl-pro", "code": "SPK-001", "status": AssetStatus.AVAILABLE},
            {"product_slug": "jbl-pro", "code": "SPK-002", "status": AssetStatus.AVAILABLE},
            {"product_slug": "honda-gen", "code": "GEN-001", "status": AssetStatus.ACTIVE},
            {"product_slug": "dell-laptop", "code": "LAP-001", "status": AssetStatus.AVAILABLE},
            {"product_slug": "dell-laptop", "code": "LAP-002", "status": AssetStatus.AVAILABLE},
        ]
        
        for ad in assets_data:
            result = await session.execute(select(ProductAsset).where(ProductAsset.asset_code == ad["code"]))
            asset = result.scalars().first()
            if not asset:
                prod = created_products[ad["product_slug"]]
                asset = ProductAsset(
                    organization_id=org.id,
                    product_id=prod.id,
                    asset_code=ad["code"],
                    status=ad["status"],
                    condition=AssetCondition.EXCELLENT
                )
                session.add(asset)
                await session.commit()
                print(f"Created asset: {asset.asset_code} ({asset.status})")
            else:
                print(f"Asset '{asset.asset_code}' already exists.")

        from app.rentals.schemas import RentalCreate, RentalItemCreate
        from app.rentals.service import RentalService
        from app.common.enums import PickupMethod, RentalStatus
        from datetime import datetime, timedelta, timezone

        # 6. Create Rentals
        print("Seeding rentals...")
        now = datetime.now(timezone.utc)
        
        # We need a customer for the rentals
        cust_user = created_users[UserRole.CUSTOMER]
        
        # Check if rentals already exist
        from app.rentals.models import Rental
        existing_rentals_count = (await session.execute(select(Rental).where(Rental.organization_id == org.id))).scalars().all()
        
        if not existing_rentals_count:
            # We will create 5 rentals directly using RentalService to ensure assets are correctly assigned
            # Sony Camera (id: created_products["sony-alpha"].id)
            cam_prod_id = created_products["sony-alpha"].id
            proj_prod_id = created_products["epson-4k"].id
            
            rentals_to_seed = [
                {"status": RentalStatus.CONFIRMED, "offset": 1, "product_id": cam_prod_id},
                {"status": RentalStatus.PAYMENT_PENDING, "offset": 2, "product_id": cam_prod_id},
                {"status": RentalStatus.READY_FOR_PICKUP, "offset": 3, "product_id": cam_prod_id},
                {"status": RentalStatus.ACTIVE, "offset": -1, "product_id": proj_prod_id},
                {"status": RentalStatus.RETURN_DUE, "offset": -3, "product_id": proj_prod_id}
            ]
            
            # Since some assets are marked as ACTIVE/MAINTENANCE, they might not be available.
            # To ensure the seed script doesn't crash on "Insufficient Asset Availability", 
            # we will reset all assets to AVAILABLE before creating rentals, then let the rental transition logic set them correctly.
            from app.assets.models import ProductAsset
            await session.execute(update(ProductAsset).where(ProductAsset.organization_id == org.id).values(status=AssetStatus.AVAILABLE))
            await session.commit()
            
            for rt in rentals_to_seed:
                start = now + timedelta(days=rt["offset"])
                end = start + timedelta(days=2)
                
                req = RentalCreate(
                    start_datetime=start,
                    expected_return_datetime=end,
                    pickup_method=PickupMethod.IN_STORE,
                    items=[RentalItemCreate(product_id=rt["product_id"], quantity=1)]
                )
                
                try:
                    rental = await RentalService.create_rental(session, org.id, cust_user.id, req)
                    
                    # Manually jump states for seed purposes (bypassing normal state machine blocks for speed)
                    await session.execute(update(Rental).where(Rental.id == rental.id).values(status=rt["status"]))
                    await session.commit()
                    
                    # Also update the assigned asset status for realism
                    if rt["status"] in [RentalStatus.CONFIRMED, RentalStatus.PAYMENT_PENDING, RentalStatus.READY_FOR_PICKUP]:
                        await session.execute(update(ProductAsset).where(ProductAsset.id == rental.items[0].asset_id).values(status=AssetStatus.RESERVED))
                    elif rt["status"] in [RentalStatus.ACTIVE, RentalStatus.RETURN_DUE]:
                        await session.execute(update(ProductAsset).where(ProductAsset.id == rental.items[0].asset_id).values(status=AssetStatus.ACTIVE))
                    await session.commit()
                    print(f"Created seeded rental: {rental.rental_number} in {rt['status']}")
                except Exception as e:
                    print(f"Failed to seed rental: {str(e)}")

        else:
            print("Rentals already seeded.")

        # Seed Payments
    from app.payments.service import PaymentService
    from app.payments.schemas import PaymentCreateRequest
    from app.common.enums import PaymentStatus
    
    print("Seeding payments and deposits...")
    admin_user = created_users[UserRole.ADMIN]
    rentals_result = await session.execute(select(Rental).where(Rental.organization_id == org.id))
    rentals = rentals_result.scalars().all()
    
    for rental in rentals:
        try:
            if rental.status in [RentalStatus.PAYMENT_PENDING, RentalStatus.PAYMENT_COMPLETED, RentalStatus.READY_FOR_PICKUP, RentalStatus.ACTIVE]:
                # In previous seed, we manually changed statuses. Let's create proper payments for them to match Phase 5 consistency.
                if rental.status != RentalStatus.PAYMENT_PENDING:
                    # Fake it back to pending temporarily so PaymentService accepts it
                    rental.status = RentalStatus.PAYMENT_PENDING
                    await session.commit()
                    
                payment = await PaymentService.create_payment(session, org.id, admin_user, PaymentCreateRequest(rental_id=rental.id))
                
                if rental.rental_number.endswith("1") or rental.rental_number.endswith("3"):
                    # Simulate failure and retry for some
                    await PaymentService.simulate_failure(session, org.id, payment.id, admin_user)
                    payment = await PaymentService.create_payment(session, org.id, admin_user, PaymentCreateRequest(rental_id=rental.id))
                    await PaymentService.simulate_success(session, org.id, payment.id, admin_user)
                else:
                    await PaymentService.simulate_success(session, org.id, payment.id, admin_user)
                    
                # Put it in READY_FOR_PICKUP if appropriate
                await RentalService.transition_rental(session, org.id, rental.id, RentalStatus.READY_FOR_PICKUP, admin_user)
        except Exception as e:
            print(f"Payment seed skipped for {rental.rental_number}: {e}")

    await session.commit()
    print("Seed script completed successfully.")

if __name__ == "__main__":
    asyncio.run(seed_data())
