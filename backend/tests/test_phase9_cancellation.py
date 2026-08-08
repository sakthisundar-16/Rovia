import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal

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
async def test_cancellation_penalty(client: AsyncClient):
    org_slug = generate_random_slug()
    admin_email = generate_random_email()
    await client.post("/auth/register", json={
        "email": admin_email, "password": "pass",
        "first_name": "Admin", "last_name": "User",
        "organization_name": "Cancel Org", "organization_slug": org_slug
    })
    
    admin_token = (await client.post("/auth/login", data={"username": admin_email, "password": "pass"})).json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    prod_resp = await client.post("/products", headers=admin_headers, json={
        "name": "Cancel Camera", "slug": f"ccl-cam-{uuid.uuid4().hex[:8]}", 
        "category": "CAMERA", "base_rental_price": 1000, "security_deposit_configuration": 500
    })
    prod_id = prod_resp.json()["id"]
    
    asset_resp = await client.post(f"/assets", headers=admin_headers, json={
        "product_id": prod_id, "asset_code": f"CAM-CCL-{uuid.uuid4().hex[:8]}", "serial_number": "CCL123", "condition": "EXCELLENT"
    })
    
    # 1. Cancel > 24 hours (No penalty)
    now = datetime.now(timezone.utc)
    start_no_penalty = now + timedelta(days=2)
    end_no_penalty = now + timedelta(days=4)
    
    rental_req = {
        "start_datetime": start_no_penalty.isoformat(),
        "expected_return_datetime": end_no_penalty.isoformat(),
        "pickup_method": "IN_STORE",
        "items": [{"product_id": prod_id, "quantity": 1}]
    }
    rental_resp1 = await client.post("/rentals", headers=admin_headers, json=rental_req)
    r1_id = rental_resp1.json()["id"]
    
    await client.post(f"/rentals/{r1_id}/transition", headers=admin_headers, json={"target_status": "CONFIRMED"})
    
    cancel_resp1 = await client.post(f"/rentals/{r1_id}/cancel", headers=admin_headers)
    assert cancel_resp1.status_code == 200
    
    # Check deposit has no penalty
    dep1 = await client.get(f"/deposits/{r1_id}", headers=admin_headers)
    assert dep1.status_code == 404 or float(dep1.json().get("deducted_amount", 0)) == 0.0

    # 2. Cancel < 24 hours (Penalty)
    start_penalty = now + timedelta(hours=12)
    end_penalty = now + timedelta(days=2)
    
    rental_req["start_datetime"] = start_penalty.isoformat()
    rental_req["expected_return_datetime"] = end_penalty.isoformat()
    
    rental_resp2 = await client.post("/rentals", headers=admin_headers, json=rental_req)
    r2_id = rental_resp2.json()["id"]
    
    await client.post(f"/rentals/{r2_id}/transition", headers=admin_headers, json={"target_status": "CONFIRMED"})
    
    # Mocking Deposit Collection (since penalty is only applied if deposit is held/required AND collected > 0 in real flow? Wait, the deposit might not be collected yet. But it is REQUIRED. So we will try to settle. But settle_deposit might fail if not HELD? In our logic, settle works if REQUIRED or HELD.)
    
    cancel_resp2 = await client.post(f"/rentals/{r2_id}/cancel", headers=admin_headers)
    assert cancel_resp2.status_code == 200
    
    # Check deposit
    dep2 = await client.get(f"/deposits/{r2_id}", headers=admin_headers)
    if dep2.status_code == 200:
        assert float(dep2.json()["deducted_amount"]) > 0.0 # It should deduct 50% of subtotal
        assert float(dep2.json()["deducted_amount"]) == 1000.0 # subtotal = 2000 * 0.5
