import pytest
import pytest_asyncio
import uuid
import asyncio
from decimal import Decimal
from datetime import datetime, timedelta, timezone
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.common.enums import RentalStatus, PaymentStatus, DepositStatus
from app.core.config import settings

@pytest_asyncio.fixture(scope="module")
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test/api/v1") as ac:
        yield ac

async def setup_org(client: AsyncClient, name: str):
    email = f"admin_{name}_{uuid.uuid4().hex[:6]}@example.com"
    await client.post("/auth/register", json={
        "email": email, "password": "pass",
        "first_name": "A", "last_name": "U",
        "organization_name": name, "organization_slug": f"org_{uuid.uuid4().hex[:6]}"
    })
    resp = await client.post("/auth/login", data={"username": email, "password": "pass"})
    return resp.json()["access_token"]

@pytest.mark.asyncio
async def test_pricing_preview(client: AsyncClient):
    token = await setup_org(client, "OrgP5_Pricing")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create product with fixed deposit
    resp = await client.post("/products", json={"name": "ProdP", "category": "CAMERA", "base_rental_price": "100.00", "security_deposit_configuration": "500.00"}, headers=headers)
    prod_id = resp.json()["id"]
    
    now = datetime.now(timezone.utc)
    start = now + timedelta(days=1)
    end = start + timedelta(days=3) # 2 days
    
    # Preview pricing
    resp = await client.post("/pricing/preview", json={
        "start_datetime": start.isoformat(),
        "expected_return_datetime": end.isoformat(),
        "items": [{"product_id": prod_id, "quantity": 2}]
    }, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert Decimal(data["subtotal"]) == Decimal("600.00") # 100 * 3 days * 2 qty
    assert Decimal(data["security_deposit"]) == Decimal("1000.00") # 500 * 2 qty
    assert Decimal(data["total_due"]) == Decimal("1600.00")

@pytest.mark.asyncio
async def test_payment_and_deposit_flow(client: AsyncClient):
    token = await setup_org(client, "OrgP5_Flow")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create product & asset
    resp = await client.post("/products", json={"name": "ProdF", "category": "CAMERA", "base_rental_price": "100.00", "security_deposit_configuration": "500.00"}, headers=headers)
    prod_id = resp.json()["id"]
    await client.post("/assets", json={"product_id": prod_id, "asset_code": f"A-{uuid.uuid4().hex[:4]}"}, headers=headers)
    
    now = datetime.now(timezone.utc)
    start = now + timedelta(days=1)
    end = start + timedelta(days=3)
    
    # Create rental
    resp = await client.post("/rentals", json={
        "start_datetime": start.isoformat(),
        "expected_return_datetime": end.isoformat(),
        "items": [{"product_id": prod_id, "quantity": 1}]
    }, headers=headers)
    rental_id = resp.json()["id"]
    assert Decimal(resp.json()["total_amount"]) == Decimal("800.00") # 100 * 3 + 500
    
    # Transition to PAYMENT_PENDING
    resp = await client.post(f"/rentals/{rental_id}/transition", json={"target_status": "CONFIRMED"}, headers=headers)
    resp = await client.post(f"/rentals/{rental_id}/transition", json={"target_status": "PAYMENT_PENDING"}, headers=headers)
    assert resp.status_code == 200
    
    # Create Payment
    resp = await client.post("/payments", json={"rental_id": rental_id}, headers=headers)
    assert resp.status_code == 201
    payment_id = resp.json()["id"]
    assert resp.json()["status"] == "PENDING"
    assert Decimal(resp.json()["amount"]) == Decimal("800.00")
    
    # Simulate Failure
    resp = await client.post(f"/payments/{payment_id}/simulate-failure", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "FAILED"
    
    # Rental should still be PAYMENT_PENDING
    resp = await client.get(f"/rentals/{rental_id}", headers=headers)
    assert resp.json()["status"] == "PAYMENT_PENDING"
    
    # Create new payment
    resp = await client.post("/payments", json={"rental_id": rental_id}, headers=headers)
    payment_id2 = resp.json()["id"]
    
    # Simulate Success
    resp = await client.post(f"/payments/{payment_id2}/simulate-success", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "SUCCESS"
    
    # Rental should automatically transition to PAYMENT_COMPLETED
    resp = await client.get(f"/rentals/{rental_id}", headers=headers)
    assert resp.json()["status"] == "PAYMENT_COMPLETED"
    
    # Check Deposit Account
    resp = await client.get(f"/deposits/rental/{rental_id}", headers=headers)
    assert resp.status_code == 200
    dep_data = resp.json()
    assert dep_data["status"] == "HELD"
    assert Decimal(dep_data["collected_amount"]) == Decimal("500.00")
    assert len(dep_data["ledger_entries"]) == 1
    
    # Now transition to READY_FOR_PICKUP should succeed
    resp = await client.post(f"/rentals/{rental_id}/transition", json={"target_status": "READY_FOR_PICKUP"}, headers=headers)
    assert resp.status_code == 200

@pytest.mark.asyncio
async def test_demo_mode_disabled(client: AsyncClient):
    token = await setup_org(client, "OrgP5_Demo")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Temporarily disable demo mode
    original_demo_mode = settings.DEMO_MODE
    settings.DEMO_MODE = False
    
    try:
        # Create product & asset
        resp = await client.post("/products", json={"name": "ProdD", "category": "CAMERA", "base_rental_price": "10"}, headers=headers)
        prod_id = resp.json()["id"]
        await client.post("/assets", json={"product_id": prod_id, "asset_code": f"A-{uuid.uuid4().hex[:4]}"}, headers=headers)
        
        now = datetime.now(timezone.utc)
        resp = await client.post("/rentals", json={
            "start_datetime": (now + timedelta(days=1)).isoformat(),
            "expected_return_datetime": (now + timedelta(days=2)).isoformat(),
            "items": [{"product_id": prod_id, "quantity": 1}]
        }, headers=headers)
        rental_id = resp.json()["id"]
        
        await client.post(f"/rentals/{rental_id}/transition", json={"target_status": "CONFIRMED"}, headers=headers)
        await client.post(f"/rentals/{rental_id}/transition", json={"target_status": "PAYMENT_PENDING"}, headers=headers)
        
        resp = await client.post("/payments", json={"rental_id": rental_id}, headers=headers)
        payment_id = resp.json()["id"]
        
        # Simulate success should fail
        resp = await client.post(f"/payments/{payment_id}/simulate-success", headers=headers)
        assert resp.status_code == 403
        assert "disabled" in resp.json()["detail"].lower()
    finally:
        settings.DEMO_MODE = original_demo_mode
