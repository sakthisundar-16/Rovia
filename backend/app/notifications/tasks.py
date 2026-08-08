import asyncio
from app.worker import celery_app
from app.notifications.service import NotificationService
import uuid

def run_async(coro):
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    return loop.run_until_complete(coro)

@celery_app.task(name="notifications.send_notification")
def send_notification_task(notification_id_str: str):
    notification_id = uuid.UUID(notification_id_str)
    run_async(NotificationService.process_notification(notification_id))

@celery_app.task(name="notifications.check_reminders")
def check_reminders_task():
    # In a real system, this would query rentals and spawn send_notification_task for each
    # e.g. finding rentals due tomorrow, overdue rentals, etc.
    pass
