import uuid
from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.analytics.schemas import DashboardMetrics
from app.rentals.models import Rental
from app.assets.models import ProductAsset
from app.deposits.models import DepositAccount
from app.payments.models import Payment
from app.common.enums import RentalStatus, AssetStatus, DepositStatus

class AnalyticsService:
    @staticmethod
    async def get_dashboard_metrics(db: AsyncSession, org_id: uuid.UUID) -> DashboardMetrics:
        active_rentals_query = select(func.count(Rental.id)).where(
            Rental.organization_id == org_id,
            Rental.status == RentalStatus.ACTIVE
        )
        active_rentals = (await db.execute(active_rentals_query)).scalar() or 0
        
        now = datetime.now(timezone.utc)
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        revenue_query = select(func.sum(Payment.amount)).where(
            Payment.organization_id == org_id,
            Payment.status == "COMPLETED",
            Payment.created_at >= start_of_month
        )
        revenue = (await db.execute(revenue_query)).scalar() or Decimal('0.00')
        
        maintenance_assets_query = select(func.count(ProductAsset.id)).where(
            ProductAsset.organization_id == org_id,
            ProductAsset.status == AssetStatus.MAINTENANCE
        )
        maintenance_assets = (await db.execute(maintenance_assets_query)).scalar() or 0
        
        deposits_held_query = select(func.sum(DepositAccount.required_amount)).where(
            DepositAccount.organization_id == org_id,
            DepositAccount.status == DepositStatus.HELD
        )
        deposits_held = (await db.execute(deposits_held_query)).scalar() or Decimal('0.00')
        
        return DashboardMetrics(
            total_active_rentals=active_rentals,
            revenue_this_month=revenue,
            assets_in_maintenance=maintenance_assets,
            total_deposit_held=deposits_held
        )

    @staticmethod
    async def get_radar_metrics(db: AsyncSession, org_id: uuid.UUID):
        from app.analytics.schemas import OperationsRadar, RadarItem
        
        now = datetime.now(timezone.utc)
        start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_today = start_of_today + timedelta(days=1)
        
        # Pickups today
        pickups_query = select(Rental).where(
            Rental.organization_id == org_id,
            Rental.status == RentalStatus.READY_FOR_PICKUP,
            Rental.start_datetime >= start_of_today,
            Rental.start_datetime < end_of_today
        )
        pickups = (await db.execute(pickups_query)).scalars().all()
        
        # Returns today
        returns_query = select(Rental).where(
            Rental.organization_id == org_id,
            Rental.status == RentalStatus.ACTIVE,
            Rental.expected_return_datetime >= start_of_today,
            Rental.expected_return_datetime < end_of_today
        )
        returns = (await db.execute(returns_query)).scalars().all()
        
        # Overdue rentals
        overdue_query = select(Rental).where(
            Rental.organization_id == org_id,
            Rental.status.in_([RentalStatus.ACTIVE, RentalStatus.OVERDUE]),
            Rental.expected_return_datetime < now
        )
        overdue = (await db.execute(overdue_query)).scalars().all()
        
        def to_radar_item(r):
            return RadarItem(
                rental_id=r.id,
                customer_id=r.customer_id,
                start_datetime=r.start_datetime,
                expected_return_datetime=r.expected_return_datetime,
                status=r.status.value
            )
            
        return OperationsRadar(
            pickups_today=len(pickups),
            pickups_list=[to_radar_item(r) for r in pickups],
            returns_today=len(returns),
            returns_list=[to_radar_item(r) for r in returns],
            overdue_rentals=len(overdue),
            overdue_list=[to_radar_item(r) for r in overdue]
        )

