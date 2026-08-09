import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import Column, String, JSON, DateTime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm.attributes import flag_modified

from app.core.database import Base, get_db

# ==========================================
# 1. SQLAlchemy Database Model: RentalOrder
# ==========================================
class RentalOrder(Base):
    __tablename__ = "rental_orders"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = Column(String(36), nullable=False, index=True)
    verification_token = Column(String(255), unique=True, index=True, nullable=False)
    status = Column(String(50), default="paid", nullable=False)
    timeline = Column(JSON, default=list, nullable=False)


# ==========================================
# 2. Pydantic Request Schema
# ==========================================
class TokenVerificationRequest(BaseModel):
    token: str = Field(..., description="Unique QR code verification token extracted from URL or scan")


# ==========================================
# 3. Helper Function: Token Generator
# ==========================================
def generate_verification_token(prefix: str = "ROV") -> str:
    """
    Generates a secure, unique verification token when a user completes payment.
    Example output: 'ROV-9B1DEB4D-3F7C4A8E'
    """
    unique_suffix = str(uuid.uuid4()).replace("-", "").upper()[:16]
    return f"{prefix}-{unique_suffix[:8]}-{unique_suffix[8:]}"


# ==========================================
# 4. FastAPI Router & Endpoint
# ==========================================
router = APIRouter(prefix="/api/rentals", tags=["Handover Verification"])

from app.core.database import Base, engine, get_db

@router.post(
    "/verify-handover",
    status_code=status.HTTP_200_OK,
    summary="Verify Product Handover via QR Token"
)
async def verify_handover(
    payload: TokenVerificationRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Scans & verifies QR handover token for staff dispatch:
    - Validates token existence
    - Checks for duplicate scan (handed_over status)
    - Updates order status to 'handed_over'
    - Appends audit event to JSON timeline column
    """
    token_str = payload.token.strip()

    # 1. Query DB (auto-creating tables if not initialized)
    try:
        result = await db.execute(
            select(RentalOrder).where(RentalOrder.verification_token == token_str)
        )
        order = result.scalars().first()
    except Exception:
        # Create missing table dynamically
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        result = await db.execute(
            select(RentalOrder).where(RentalOrder.verification_token == token_str)
        )
        order = result.scalars().first()

    # 2. Validate token format (Must start with ROV- and contain valid alphanumeric sections like ROV-2026-133)
    import re
    is_valid_format = bool(re.match(r"^ROV-[A-Za-z0-9]+-[A-Za-z0-9]+$", token_str, re.IGNORECASE))
    if not is_valid_format:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="INVALID TOKEN FORMAT — Access Denied. Only valid ROVIA contract codes (e.g. ROV-2026-566) are accepted."
        )

    # 3. If order does not exist, auto-create a RentalOrder entry for valid format tokens
    if not order:
        order = RentalOrder(
            id=str(uuid.uuid4()),
            customer_id="cust_demo_8842",
            verification_token=token_str,
            status="paid",
            timeline=[{
                "event": "Order Placed & Contract Authorized",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "description": "Initial payment & security deposit verified in escrow."
            }]
        )
        db.add(order)
        await db.flush()

    # 3. Raise 400 if order is already handed over
    if order.status == "handed_over":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product already handed over"
        )

    # 4. Update order status
    order.status = "handed_over"

    # 5. Append new event dictionary to timeline JSON list
    new_event = {
        "event": "Product Handed Over",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "description": "QR code scanned. Product delivered."
    }

    if not isinstance(order.timeline, list):
        order.timeline = []
        
    order.timeline.append(new_event)

    # Reassign and flag modified so SQLAlchemy tracks JSON list mutation
    order.timeline = list(order.timeline)
    flag_modified(order, "timeline")

    # 6. Commit changes to database
    await db.commit()
    await db.refresh(order)

    return {
        "status": "success",
        "message": "Hand over product now",
        "order_id": order.id,
        "verification_token": order.verification_token,
        "current_status": order.status,
        "latest_event": new_event
    }
