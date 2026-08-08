import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List, Tuple

from app.maintenance.models import MaintenanceTicket, MaintenanceStatus
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
    async def get_ticket(db: AsyncSession, org_id: uuid.UUID, ticket_id: uuid.UUID) -> MaintenanceTicket:
        result = await db.execute(select(MaintenanceTicket).where(MaintenanceTicket.id == ticket_id, MaintenanceTicket.organization_id == org_id))
        ticket = result.scalars().first()
        if not ticket:
            raise OperationsException("Maintenance ticket not found")
        return ticket

    @staticmethod
    async def list_tickets(db: AsyncSession, org_id: uuid.UUID, skip: int = 0, limit: int = 20, status: str = None, asset_id: uuid.UUID = None) -> Tuple[List[MaintenanceTicket], int]:
        query = select(MaintenanceTicket).where(MaintenanceTicket.organization_id == org_id)
        if status:
            query = query.where(MaintenanceTicket.status == MaintenanceStatus(status))
        if asset_id:
            query = query.where(MaintenanceTicket.asset_id == asset_id)
            
        count_query = select(func.count()).select_from(query.subquery())
        total = (await db.execute(count_query)).scalar_one()
        
        query = query.order_by(MaintenanceTicket.created_at.desc()).offset(skip).limit(limit)
        result = await db.execute(query)
        items = list(result.scalars().all())
        return items, total

    @staticmethod
    async def update_ticket(db: AsyncSession, org_id: uuid.UUID, ticket_id: uuid.UUID, data: MaintenanceUpdate) -> MaintenanceTicket:
        ticket = await MaintenanceService.get_ticket(db, org_id, ticket_id)
        
        # Validate transitions
        valid = False
        current = ticket.status
        target = MaintenanceStatus(data.status.value)
        
        if current == target:
            valid = True
        elif current == MaintenanceStatus.OPEN and target in [MaintenanceStatus.IN_PROGRESS, MaintenanceStatus.CANCELLED]:
            valid = True
        elif current == MaintenanceStatus.IN_PROGRESS and target in [MaintenanceStatus.RESOLVED, MaintenanceStatus.CANCELLED]:
            valid = True
            
        if not valid:
            raise OperationsException(f"Invalid transition from {current.value} to {target.value}")
            
        ticket.status = target
        if data.notes:
            ticket.notes = (ticket.notes or "") + f"\nUpdate: {data.notes}"
        if data.repair_cost is not None:
            ticket.repair_cost = data.repair_cost
            
        if ticket.status == MaintenanceStatus.RESOLVED and current != MaintenanceStatus.RESOLVED:
            ticket.resolved_at = datetime.now(timezone.utc)
            await AssetService.transition_asset(db, org_id, ticket.asset_id, AssetStatus.AVAILABLE)
            
        await db.commit()
        await db.refresh(ticket)
        return ticket
