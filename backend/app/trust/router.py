from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.core.database import get_db
from app.common.dependencies import get_current_user
from app.users.models import User
from app.common.enums import UserRole
from app.trust.service import TrustService
from app.trust.schemas import TrustProfileResponse

router = APIRouter(prefix="/trust", tags=["Trust"])

@router.get("/{customer_id}", response_model=TrustProfileResponse)
async def get_trust_profile(
    customer_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Customer can only view their own
    if current_user.role == UserRole.CUSTOMER and current_user.customer_id != customer_id:
        from app.common.exceptions import TenantAccessDeniedException
        raise TenantAccessDeniedException()
        
    trust = await TrustService.get_or_create_trust(db, current_user.organization_id, customer_id)
    
    history_resp = []
    for h in trust.history:
        history_resp.append({
            "old_score": h.old_score,
            "new_score": h.new_score,
            "reason": h.reason,
            "created_at": h.created_at.isoformat()
        })
        
    return TrustProfileResponse(
        customer_id=trust.customer_id,
        score=trust.score,
        total_completed_rentals=trust.total_completed_rentals,
        on_time_returns=trust.on_time_returns,
        damage_free_returns=trust.damage_free_returns,
        history=history_resp
    )
