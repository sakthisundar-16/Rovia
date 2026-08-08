import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from app.main import app
from app.common.enums import AssetStatus

@pytest_asyncio.fixture(scope="module")
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test/api/v1") as ac:
        yield ac

def generate_random_email():
    return f"test_{uuid.uuid4().hex[:8]}@example.com"

def generate_random_slug():
    return f"org_{uuid.uuid4().hex[:8]}"

@pytest.mark.asyncio
async def test_advanced_repair_workflow(client: AsyncClient):
    org_slug = generate_random_slug()
    admin_email = generate_random_email()
    await client.post("/auth/register", json={
        "email": admin_email, "password": "pass",
        "first_name": "Admin", "last_name": "User",
        "organization_name": "Repair Org", "organization_slug": org_slug
    })
    
    admin_token = (await client.post("/auth/login", data={"username": admin_email, "password": "pass"})).json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # 1. Setup Product & Asset
    prod_resp = await client.post("/products", headers=admin_headers, json={
        "name": "Repair Camera", "slug": f"cam-{uuid.uuid4().hex[:8]}", 
        "category": "CAMERA", "base_rental_price": 500, "security_deposit_configuration": 2000
    })
    assert prod_resp.status_code == 201
    prod_id = prod_resp.json()["id"]
    
    asset_resp = await client.post(f"/assets", headers=admin_headers, json={
        "product_id": prod_id, "asset_code": f"CAM-REP-{uuid.uuid4().hex[:8]}", "serial_number": f"REP123-{uuid.uuid4().hex[:4]}", "condition": "EXCELLENT"
    })
    assert asset_resp.status_code == 201
    asset_id = asset_resp.json()["id"]
    qr_token = asset_resp.json()["qr_token"]
    
    # 2. Rent & Damage the item
    now = datetime.now(timezone.utc)
    start = now + timedelta(days=1)
    end = now + timedelta(days=3)
    
    rental_req = {
        "start_datetime": start.isoformat(),
        "expected_return_datetime": end.isoformat(),
        "pickup_method": "IN_STORE",
        "items": [{"product_id": prod_id, "quantity": 1}]
    }
    r_resp = await client.post("/rentals", headers=admin_headers, json=rental_req)
    r1_id = r_resp.json()["id"]
    
    await client.post(f"/rentals/{r1_id}/transition", headers=admin_headers, json={"target_status": "CONFIRMED"})
    await client.post(f"/rentals/{r1_id}/transition", headers=admin_headers, json={"target_status": "PAYMENT_PENDING"})
    
    pay_resp = await client.post("/payments", json={"rental_id": r1_id}, headers=admin_headers)
    payment_id = pay_resp.json()["id"]
    await client.post(f"/payments/{payment_id}/simulate-success", headers=admin_headers)
    
    await client.post(f"/rentals/{r1_id}/transition", headers=admin_headers, json={"target_status": "READY_FOR_PICKUP"})
    await client.post(f"/operations/pickup/{r1_id}", headers=admin_headers, json={"scanned_qr_tokens": [qr_token]})
    
    # 3. Return with damage -> should create ticket and mark MAINTENANCE
    ret_req = {
        "actual_return_datetime": end.isoformat(),
        "assets": [
            {
                "asset_id": asset_id,
                "condition": "DAMAGED",
                "estimated_charge": 500.0,
                "missing_accessories": []
            }
        ]
    }
    ret_resp = await client.post(f"/operations/return/{r1_id}", headers=admin_headers, json=ret_req)
    assert ret_resp.status_code == 200
    
    # 4. Check that asset is in MAINTENANCE
    asset_check = await client.get(f"/assets/{asset_id}", headers=admin_headers)
    assert asset_check.json()["status"] == "MAINTENANCE"
    
    # 5. Check ticket was created
    tickets_resp = await client.get(f"/maintenance/tickets", headers=admin_headers)
    # Wait, the route is /maintenance (from router prefix /maintenance) and then / or /{ticket_id}
    # Wait, the route is GET /maintenance/
    tickets_resp = await client.get(f"/maintenance/", headers=admin_headers)
    assert tickets_resp.status_code == 200
    tickets = tickets_resp.json()["items"]
    assert len(tickets) == 1
    t = tickets[0]
    assert t["asset_id"] == asset_id
    assert t["rental_id"] == r1_id
    assert float(t["repair_cost"]) == 500.0
    assert t["status"] == "OPEN"
    
    t_id = t["id"]
    
    # 6. Test Transitions
    # OPEN -> IN_PROGRESS
    patch1 = await client.patch(f"/maintenance/{t_id}", headers=admin_headers, json={"status": "IN_PROGRESS", "notes": "Parts ordered"})
    assert patch1.status_code == 200
    assert patch1.json()["status"] == "IN_PROGRESS"
    
    # IN_PROGRESS -> RESOLVED
    patch2 = await client.patch(f"/maintenance/{t_id}", headers=admin_headers, json={"status": "RESOLVED"})
    assert patch2.status_code == 200
    assert patch2.json()["status"] == "RESOLVED"
    
    # 7. Asset should be available again
    asset_check2 = await client.get(f"/assets/{asset_id}", headers=admin_headers)
    assert asset_check2.json()["status"] == "AVAILABLE"
