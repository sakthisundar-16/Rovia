import pytest
import pytest_asyncio
import uuid
from httpx import AsyncClient
from datetime import datetime, timezone
from app.notifications.service import NotificationService
from app.core.database import AsyncSessionLocal
from app.customers.models import Customer
from app.users.models import User
from app.rentals.models import Rental
from app.products.models import Product, ProductVariant
from app.assets.models import ProductAsset
from app.notifications.models import NotificationTemplate
from app.organizations.models import Organization
from app.common.enums import OrganizationStatus

@pytest.mark.asyncio
async def test_multi_language_notification():
    async with AsyncSessionLocal() as db:
        # Create org
        org_id = uuid.uuid4()
        org = Organization(id=org_id, name="Test Org", slug=f"org-{uuid.uuid4().hex[:6]}", status=OrganizationStatus.ACTIVE)
        db.add(org)
        await db.flush()
        
        # Create English Template
        en_template = NotificationTemplate(
            organization_id=org_id,
            name="WELCOME",
            language="en",
            body_template="Hello {name}, welcome to Rovia!"
        )
        db.add(en_template)
        
        # Create Tamil Template
        ta_template = NotificationTemplate(
            organization_id=org_id,
            name="WELCOME",
            language="ta",
            body_template="வணக்கம் {name}, Rovia க்கு வரவேற்கிறோம்!"
        )
        db.add(ta_template)

        # Create English Customer
        c_en = Customer(
            organization_id=org_id,
            customer_number="CUST-EN",
            name="John Doe",
            preferred_language="en"
        )
        db.add(c_en)
        
        # Create Tamil Customer
        c_ta = Customer(
            organization_id=org_id,
            customer_number="CUST-TA",
            name="Siva",
            preferred_language="ta"
        )
        db.add(c_ta)
        
        # Create Spanish Customer (fallback to EN)
        c_es = Customer(
            organization_id=org_id,
            customer_number="CUST-ES",
            name="Carlos",
            preferred_language="es"
        )
        db.add(c_es)
        
        await db.commit()
        
        # Now trigger notifications
        n_en = await NotificationService.create_notification(
            org_id, c_en.id, "WELCOME", context={"name": "John Doe"}
        )
        assert n_en.content == "Hello John Doe, welcome to Rovia!"
        
        n_ta = await NotificationService.create_notification(
            org_id, c_ta.id, "WELCOME", context={"name": "Siva"}
        )
        assert n_ta.content == "வணக்கம் Siva, Rovia க்கு வரவேற்கிறோம்!"
        
        n_es = await NotificationService.create_notification(
            org_id, c_es.id, "WELCOME", context={"name": "Carlos"}
        )
        assert n_es.content == "Hello Carlos, welcome to Rovia!"
