import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.users.models import User
from app.common.types import GUID

class CustomerTrust(Base):
    __tablename__ = "customer_trusts"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    organization_id = Column(GUID(), ForeignKey("organizations.id", ondelete="CASCADE"), index=True, nullable=False)
    customer_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    
    score = Column(Integer, default=50, nullable=False)
    total_completed_rentals = Column(Integer, default=0, nullable=False)
    on_time_returns = Column(Integer, default=0, nullable=False)
    damage_free_returns = Column(Integer, default=0, nullable=False)
    
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    customer = relationship("User")
    history = relationship("TrustHistory", back_populates="trust_profile")

class TrustHistory(Base):
    __tablename__ = "trust_history"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    organization_id = Column(GUID(), ForeignKey("organizations.id", ondelete="CASCADE"), index=True, nullable=False)
    customer_trust_id = Column(GUID(), ForeignKey("customer_trusts.id", ondelete="CASCADE"), index=True, nullable=False)
    rental_id = Column(GUID(), ForeignKey("rentals.id", ondelete="SET NULL"), nullable=True)
    
    old_score = Column(Integer, nullable=False)
    new_score = Column(Integer, nullable=False)
    reason = Column(String(500), nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    trust_profile = relationship("CustomerTrust", back_populates="history")
