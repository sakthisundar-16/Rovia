"""
seed_user.py — Creates a demo renter user + organization in the database
so the frontend can authenticate and save products/orders.
Run: python seed_user.py
"""
import asyncio
import sys, os

# Make sure we can import app modules
sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import engine, Base, AsyncSessionLocal
from app.core.security import get_password_hash
import uuid
from datetime import datetime, timezone


async def seed():
    # Import all models to ensure tables exist
    import app.organizations.models
    import app.users.models
    import app.products.models
    import app.assets.models
    import app.rentals.models
    import app.payments.models
    import app.deposits.models
    import app.operations.models
    import app.trust.models
    import app.maintenance.models

    # Auto-create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("[OK] Tables created/verified")

    from app.organizations.models import Organization
    from app.users.models import User
    from app.common.enums import UserRole

    async with AsyncSessionLocal() as db:
        from sqlalchemy import select

        # Check if org already exists
        org_slug = "rovia-demo"
        result = await db.execute(select(Organization).where(Organization.slug == org_slug))
        org = result.scalars().first()

        if not org:
            org = Organization(
                id=uuid.uuid4(),
                name="ROVIA Demo Company",
                slug=org_slug,
                status="ACTIVE",
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            db.add(org)
            await db.flush()
            print(f"[OK] Organization created: {org.name} (id={org.id})")
        else:
            print(f"[INFO] Organization already exists: {org.name} (id={org.id})")

        # Seed: Admin user
        admin_email = "admin@rovia-demo.com"
        result = await db.execute(select(User).where(User.email == admin_email))
        admin = result.scalars().first()
        if not admin:
            admin = User(
                id=uuid.uuid4(),
                organization_id=org.id,
                email=admin_email,
                password_hash=get_password_hash("Admin@2026!"),
                first_name="Marcus",
                last_name="Sterling",
                role=UserRole.ADMIN,
                is_active=True,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            db.add(admin)
            print(f"[OK] Admin user created: {admin_email} / Admin@2026!")
        else:
            print(f"[INFO] Admin user already exists: {admin_email}")

        # Seed: Renter/Operations user
        renter_email = "renter@rovia-demo.com"
        result = await db.execute(select(User).where(User.email == renter_email))
        renter = result.scalars().first()
        if not renter:
            renter = User(
                id=uuid.uuid4(),
                organization_id=org.id,
                email=renter_email,
                password_hash=get_password_hash("Renter@2026!"),
                first_name="Ravi",
                last_name="Kapoor",
                role=UserRole.OPERATIONS,
                is_active=True,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            db.add(renter)
            print(f"[OK] Renter user created: {renter_email} / Renter@2026!")
        else:
            print(f"[INFO] Renter user already exists: {renter_email}")

        # Seed: Customer user
        customer_email = "customer@rovia-demo.com"
        result = await db.execute(select(User).where(User.email == customer_email))
        customer = result.scalars().first()
        if not customer:
            customer = User(
                id=uuid.uuid4(),
                organization_id=org.id,
                email=customer_email,
                password_hash=get_password_hash("Customer@2026!"),
                first_name="Elena",
                last_name="Vance",
                role=UserRole.CUSTOMER,
                is_active=True,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            db.add(customer)
            print(f"[OK] Customer user created: {customer_email} / Customer@2026!")
        else:
            print(f"[INFO] Customer user already exists: {customer_email}")

        await db.commit()
        print("\n=== Seed complete! Use these credentials in the app ===")
        print(f"   Admin:    {admin_email}  /  Admin@2026!")
        print(f"   Renter:   {renter_email}  /  Renter@2026!")
        print(f"   Customer: {customer_email}  /  Customer@2026!")


if __name__ == "__main__":
    asyncio.run(seed())
