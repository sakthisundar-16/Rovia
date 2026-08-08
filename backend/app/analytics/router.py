from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.core.database import get_db
from app.common.dependencies import get_current_user, require_operations
from app.users.models import User
from app.common.enums import UserRole
from app.analytics.service import AnalyticsService
from app.analytics.schemas import DashboardMetrics

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard", response_model=DashboardMetrics)
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_operations)
):
    return await AnalyticsService.get_dashboard_metrics(db, current_user.organization_id)

from app.analytics.schemas import OperationsRadar
@router.get("/radar", response_model=OperationsRadar)
async def get_radar(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_operations)
):
    return await AnalyticsService.get_radar_metrics(db, current_user.organization_id)

