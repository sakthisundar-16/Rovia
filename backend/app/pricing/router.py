from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.pricing.schemas import PricingPreviewRequest, PricingPreviewResponse
from app.pricing.service import PricingService
from app.common.dependencies import get_current_active_user
from app.users.models import User

router = APIRouter(prefix="/pricing", tags=["Pricing"])

@router.post("/preview", response_model=PricingPreviewResponse)
async def preview_pricing(
    data: PricingPreviewRequest, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return await PricingService.calculate_preview(db, current_user.organization_id, data)
