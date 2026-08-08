import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.maintenance.models import MaintenanceTicket
from app.maintenance.schemas import MaintenanceCreate, MaintenanceUpdate
from app.assets.service import AssetService
from app.common.enums import AssetStatus
from app.common.exceptions import OperationsException

class MaintenanceService:
    @staticmethod
    async def create_ticket(db: AsyncSession, org_id: uuid.UUID, data: MaintenanceCreate) -> MaintenanceTicket:
        ticket = MaintenanceTicket(
            organization_id=org_id,
            **data.model_dump()
        )
        db.add(ticket)
        
        await AssetService.transition_asset(db, org_id, data.asset_id, AssetStatus.MAINTENANCE)
        
        await db.commit()
        await db.refresh(ticket)
        return ticket

    @staticmethod
    async def update_ticket(db: AsyncSession, org_id: uuid.UUID, ticket_id: uuid.UUID, data: MaintenanceUpdate) -> MaintenanceTicket:
        result = await db.execute(select(MaintenanceTicket).where(MaintenanceTicket.id == ticket_id, MaintenanceTicket.organization_id == org_id))
        ticket = result.scalars().first()
        if not ticket:
            raise OperationsException("Maintenance ticket not found")
            
        ticket.status = data.status
        if data.notes:
            ticket.notes = (ticket.notes or "") + f"\nUpdate: {data.notes}"
            
        if ticket.status == "RESOLVED":
            ticket.resolved_at = datetime.now(timezone.utc)
            await AssetService.transition_asset(db, org_id, ticket.asset_id, AssetStatus.AVAILABLE)
            
        await db.commit()
        await db.refresh(ticket)
        return ticket
