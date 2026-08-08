import logging
import asyncio
from typing import Optional
import uuid
from datetime import datetime, timezone
from app.core.database import AsyncSessionLocal
from app.notifications.models import Notification

logger = logging.getLogger(__name__)

class NotificationService:
    @staticmethod
    async def create_notification(
        org_id: uuid.UUID,
        customer_id: uuid.UUID,
        notification_type: str,
        content: Optional[str] = None,
        context: Optional[dict] = None,
        rental_id: Optional[uuid.UUID] = None,
        channel: str = "EMAIL"
    ) -> Notification:
        async with AsyncSessionLocal() as db:
            from app.customers.models import Customer
            from app.notifications.models import NotificationTemplate
            from sqlalchemy.future import select

            customer = (await db.execute(select(Customer).where(Customer.id == customer_id))).scalars().first()
            language = customer.preferred_language if customer else "en"

            final_content = content or ""
            
            if context:
                # Find template
                template_result = await db.execute(
                    select(NotificationTemplate).where(
                        NotificationTemplate.organization_id == org_id,
                        NotificationTemplate.name == notification_type,
                        NotificationTemplate.language == language
                    )
                )
                template = template_result.scalars().first()
                if not template and language != "en":
                    # Fallback to English
                    template_result = await db.execute(
                        select(NotificationTemplate).where(
                            NotificationTemplate.organization_id == org_id,
                            NotificationTemplate.name == notification_type,
                            NotificationTemplate.language == "en"
                        )
                    )
                    template = template_result.scalars().first()
                    
                if template:
                    # Simple string interpolation
                    try:
                        final_content = template.body_template.format(**context)
                    except KeyError as e:
                        logger.error(f"Missing template key: {e}")
                        final_content = template.body_template
                elif not final_content:
                    final_content = f"[{notification_type}] Notification missing template."

            notif = Notification(
                organization_id=org_id,
                customer_id=customer_id,
                rental_id=rental_id,
                notification_type=notification_type,
                channel=channel,
                content=final_content
            )
            db.add(notif)
            await db.commit()
            await db.refresh(notif)
            return notif

    @staticmethod
    async def process_notification(notification_id: uuid.UUID):
        async with AsyncSessionLocal() as db:
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
