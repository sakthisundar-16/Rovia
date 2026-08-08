import pytest
from httpx import AsyncClient
import uuid
from datetime import datetime, timezone, timedelta
import asyncio
from app.main import app
import pytest_asyncio
from httpx import ASGITransport

@pytest_asyncio.fixture(scope="module")
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test/api/v1") as ac:
        yield ac

def generate_random_email():
    return f"test_{uuid.uuid4().hex[:8]}@example.com"

def generate_random_slug():
    return f"org_{uuid.uuid4().hex[:8]}"

@pytest.mark.asyncio
async def test_offline_sync(client: AsyncClient):
    org_slug = generate_random_slug()
    admin_email = generate_random_email()
    await client.post("/auth/register", json={
        "email": admin_email, "password": "pass",
        "first_name": "Admin", "last_name": "User",
        "organization_name": "Offline Org", "organization_slug": org_slug
    })

    admin_token = (await client.post("/auth/login", data={"username": admin_email, "password": "pass"})).json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    prod_resp = await client.post("/products", headers=admin_headers, json={
        "name": "Sync Product", "slug": f"sync-{uuid.uuid4().hex[:8]}",
        "category": "CAMERA", "base_rental_price": 500, "security_deposit_configuration": 2000
    })
    assert prod_resp.status_code == 201
    prod_id = prod_resp.json()["id"]

    asset_resp = await client.post(f"/assets", headers=admin_headers, json={
        "product_id": prod_id, "asset_code": f"SYNC-{uuid.uuid4().hex[:8]}", "serial_number": "SYNC123", "condition": "EXCELLENT"
    })
    assert asset_resp.status_code == 201
    qr_token = asset_resp.json()["qr_token"]
    asset_id = asset_resp.json()["id"]

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
    r1_id = rental_resp.json()["id"]

    await client.post(f"/rentals/{r1_id}/transition", headers=admin_headers, json={"target_status": "CONFIRMED"})
    await client.post(f"/rentals/{r1_id}/transition", headers=admin_headers, json={"target_status": "PAYMENT_PENDING"})
    
    pay_resp = await client.post("/payments", json={"rental_id": r1_id}, headers=admin_headers)
    payment_id = pay_resp.json()["id"]
    await client.post(f"/payments/{payment_id}/simulate-success", headers=admin_headers)
    
    await client.post(f"/rentals/{r1_id}/transition", headers=admin_headers, json={"target_status": "READY_FOR_PICKUP"})

    # Offline Sync test
    action_1 = str(uuid.uuid4())
    sync_req = {
        "actions": [
            {
                "action_id": action_1,
                "action_type": "PICKUP",
                "rental_id": r1_id,
                "payload": {
                    "scanned_qr_tokens": [qr_token],
                    "notes": "Offline pickup"
                },
                "timestamp": now.isoformat()
            }
        ]
    }

    sync_resp = await client.post("/operations/sync", headers=admin_headers, json=sync_req)
    assert sync_resp.status_code == 200, sync_resp.text
    sync_data = sync_resp.json()
    assert sync_data["processed"] == 1
    assert sync_data["results"][action_1] == "SUCCESS"

    # Check rental status
    r_check = await client.get(f"/rentals/{r1_id}", headers=admin_headers)
    assert r_check.json()["status"] == "ACTIVE"

    # Sync again with same ID to test idempotency
    sync_resp_2 = await client.post("/operations/sync", headers=admin_headers, json=sync_req)
    assert sync_resp_2.status_code == 200
    sync_data_2 = sync_resp_2.json()
    assert sync_data_2["processed"] == 0
    assert sync_data_2["results"][action_1] == "SUCCESS"
