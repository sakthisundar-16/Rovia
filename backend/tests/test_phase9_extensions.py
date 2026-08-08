import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
import uuid
from datetime import datetime, timedelta, timezone

from app.main import app
from app.common.enums import RentalStatus

@pytest_asyncio.fixture(scope="module")
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test/api/v1") as ac:
        yield ac

def generate_random_email():
    return f"test_{uuid.uuid4().hex[:8]}@example.com"

def generate_random_slug():
    return f"org_{uuid.uuid4().hex[:8]}"

@pytest.mark.asyncio
async def test_rental_extension_flow(client: AsyncClient):
    # 1. Setup Org and Customer
    org_slug = generate_random_slug()
    admin_email = generate_random_email()
    await client.post("/auth/register", json={
        "email": admin_email, "password": "pass",
        "first_name": "Admin", "last_name": "User",
        "organization_name": "Ext Org", "organization_slug": org_slug
    })
    
    admin_token = (await client.post("/auth/login", data={"username": admin_email, "password": "pass"})).json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Create a Product
    prod_resp = await client.post("/products", headers=admin_headers, json={
        "name": "Extension Camera", "slug": f"ext-cam-{uuid.uuid4().hex[:8]}", 
        "category": "CAMERA", "base_rental_price": 1000
    })
    assert prod_resp.status_code == 201
    prod_id = prod_resp.json()["id"]
    
    # Create Asset
    asset_resp = await client.post(f"/assets", headers=admin_headers, json={
        "product_id": prod_id, "asset_code": f"CAM-EXT-{uuid.uuid4().hex[:8]}", "serial_number": "EXT123", "condition": "EXCELLENT"
    })
    assert asset_resp.status_code == 201
    
    # 2. Create a Rental
    now = datetime.now(timezone.utc)
    start = now + timedelta(days=1)
    end = now + timedelta(days=3)
    
    rental_req = {
        "start_datetime": start.isoformat(),
        "expected_return_datetime": end.isoformat(),
        "pickup_method": "IN_STORE",
        "items": [{"product_id": prod_id, "quantity": 1}]
    }
    rental_resp = await client.post("/rentals", headers=admin_headers, json=rental_req)
    if rental_resp.status_code != 201:
        print("RENTAL CREATION FAILED:", rental_resp.json())
    assert rental_resp.status_code == 201
    rental_id = rental_resp.json()["id"]
    
    # Need to be ACTIVE to extend
    await client.post(f"/rentals/{rental_id}/transition", headers=admin_headers, json={"target_status": "CONFIRMED"})
    await client.post(f"/rentals/{rental_id}/transition", headers=admin_headers, json={"target_status": "PAYMENT_PENDING"})
    
    # Just skip actual payment and force transition for testing (simulate webhook logic or force)
    # Actually wait, we can't easily skip payment in integration test without mocking if transition requires it.
    # Ah, transition PAYMENT_PENDING -> READY_FOR_PICKUP requires deposit.
    # We will just test that extension on DRAFT/CONFIRMED fails, and we can directly hit the service with ACTIVE.
    
    ext_req = {"additional_days": 2}
    resp_invalid = await client.post(f"/rentals/{rental_id}/extension", headers=admin_headers, json=ext_req)
    assert resp_invalid.status_code == 400
    assert "Invalid rental transition" in resp_invalid.json()["detail"]
    
    # Let's mock it to ACTIVE
    from app.core.database import get_db
    from app.rentals.models import Rental
    async for db in app.dependency_overrides.get(get_db, get_db)():
        rental_obj = await db.get(Rental, rental_id)
        rental_obj.status = RentalStatus.ACTIVE
        await db.commit()
        break
        
    # Now extend
    resp_valid = await client.post(f"/rentals/{rental_id}/extension", headers=admin_headers, json=ext_req)
    assert resp_valid.status_code == 200
    data = resp_valid.json()
    assert data["additional_days"] == 2
    assert float(data["additional_amount"]) == 2000.0
    assert data["status"] == "APPROVED"
    
    # Verify rental got updated
    resp_rental = await client.get(f"/rentals/{rental_id}", headers=admin_headers)
    assert float(resp_rental.json()["total_amount"]) == 4000.0
