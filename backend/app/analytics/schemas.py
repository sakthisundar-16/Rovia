from pydantic import BaseModel
from decimal import Decimal

class DashboardMetrics(BaseModel):
    total_active_rentals: int
    revenue_this_month: Decimal
    assets_in_maintenance: int
    total_deposit_held: Decimal

from typing import List
import uuid
from datetime import datetime

class RadarItem(BaseModel):
    rental_id: uuid.UUID
    customer_id: uuid.UUID
    start_datetime: datetime
    expected_return_datetime: datetime
    status: str

class OperationsRadar(BaseModel):
    pickups_today: int
    pickups_list: List[RadarItem]
    returns_today: int
    returns_list: List[RadarItem]
    overdue_rentals: int
    overdue_list: List[RadarItem]

