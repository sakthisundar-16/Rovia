import logging
import asyncio
from typing import Optional
import uuid
from datetime import datetime, timezone
from app.core.database import async_session_maker
from app.notifications.models import Notification

logger = logging.getLogger(__name__)

class NotificationService:
    @staticmethod
    async def create_notification(
        org_id: uuid.UUID,
        customer_id: uuid.UUID,
        notification_type: str,
        content: str,
        rental_id: Optional[uuid.UUID] = None,
        channel: str = "EMAIL"
    ) -> Notification:
        async with async_session_maker() as db:
            notif = Notification(
                organization_id=org_id,
                customer_id=customer_id,
                rental_id=rental_id,
                notification_type=notification_type,
                channel=channel,
                content=content
            )
            db.add(notif)
            await db.commit()
            await db.refresh(notif)
            return notif

    @staticmethod
    async def process_notification(notification_id: uuid.UUID):
        async with async_session_maker() as db:
            from sqlalchemy.future import select
            result = await db.execute(select(Notification).where(Notification.id == notification_id))
            notif = result.scalars().first()
            if not notif:
                return
                
            if notif.is_sent:
                return
                
            try:
                # Simulation of email sending
                logger.info(f"Sending {notif.notification_type} via {notif.channel} to customer {notif.customer_id}")
                logger.info(f"Content: {notif.content}")
                
                # Sleep briefly to simulate IO
                await asyncio.sleep(0.5)
                
                notif.is_sent = True
                notif.sent_at = datetime.now(timezone.utc)
            except Exception as e:
                logger.error(f"Failed to send notification {notif.id}: {str(e)}")
                notif.error_message = str(e)
                
            await db.commit()
