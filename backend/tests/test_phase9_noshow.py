import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
import uuid
from datetime import datetime, timedelta, timezone

from app.main import app
from app.common.enums import RentalStatus, AssetStatus

@pytest_asyncio.fixture(scope="module")
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test/api/v1") as ac:
        yield ac

def generate_random_email():
    return f"test_{uuid.uuid4().hex[:8]}@example.com"

def generate_random_slug():
    return f"org_{uuid.uuid4().hex[:8]}"

@pytest.mark.asyncio
async def test_rental_no_show(client: AsyncClient):
    # Setup Org and Operations User
    org_slug = generate_random_slug()
    admin_email = generate_random_email()
    await client.post("/auth/register", json={
        "email": admin_email, "password": "pass",
        "first_name": "Admin", "last_name": "User",
        "organization_name": "NoShow Org", "organization_slug": org_slug
    })
    
    admin_token = (await client.post("/auth/login", data={"username": admin_email, "password": "pass"})).json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # Create a Product
    prod_resp = await client.post("/products", headers=admin_headers, json={
        "name": "NoShow Camera", "slug": f"ns-cam-{uuid.uuid4().hex[:8]}", 
        "category": "CAMERA", "base_rental_price": 500
    })
    prod_id = prod_resp.json()["id"]
    
    # Create Asset
    asset_resp = await client.post(f"/assets", headers=admin_headers, json={
        "product_id": prod_id, "asset_code": f"CAM-NS-{uuid.uuid4().hex[:8]}", "serial_number": "NS123", "condition": "EXCELLENT"
    })
    asset_id = asset_resp.json()["id"]
    
    # Create a Rental in the future first to pass validation
    now = datetime.now(timezone.utc)
    start = now + timedelta(days=1)
    end = now + timedelta(days=2)
    
    rental_req = {
        "start_datetime": start.isoformat(),
        "expected_return_datetime": end.isoformat(),
        "pickup_method": "IN_STORE",
        "items": [{"product_id": prod_id, "quantity": 1}]
    }
    rental_resp = await client.post("/rentals", headers=admin_headers, json=rental_req)
    assert rental_resp.status_code == 201, rental_resp.text
    rental_id = rental_resp.json()["id"]
    
    # Needs to be CONFIRMED or READY_FOR_PICKUP to be a NO_SHOW
    await client.post(f"/rentals/{rental_id}/transition", headers=admin_headers, json={"target_status": "CONFIRMED"})
    
    # Optional: Mock start_datetime to past to simulate a real no-show
    from app.core.database import get_db
    from app.rentals.models import Rental
    async for db in app.dependency_overrides.get(get_db, get_db)():
        rental_obj = await db.get(Rental, rental_id)
        rental_obj.start_datetime = now - timedelta(days=1)
        await db.commit()
        break
    
    # Mark No Show
    resp = await client.post(f"/rentals/{rental_id}/mark-no-show", headers=admin_headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "NO_SHOW"
    
    # Verify asset is available
    asset_check = await client.get(f"/assets/{asset_id}", headers=admin_headers)
    assert asset_check.json()["status"] == "AVAILABLE"
