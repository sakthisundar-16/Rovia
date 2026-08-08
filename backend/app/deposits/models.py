import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, Enum as SAEnum, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.common.enums import DepositStatus, LedgerEntryType
from app.common.types import GUID

class DepositAccount(Base):
    __tablename__ = "deposit_accounts"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    organization_id = Column(GUID(), ForeignKey("organizations.id", ondelete="CASCADE"), index=True, nullable=False)
    rental_id = Column(GUID(), ForeignKey("rentals.id", ondelete="CASCADE"), index=True, nullable=False, unique=True)
    
    required_amount = Column(Numeric(12, 2), nullable=False, default=0.00)
    currency = Column(String(3), nullable=False, default="INR")
    status = Column(SAEnum(DepositStatus), default=DepositStatus.REQUIRED, nullable=False, index=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    rental = relationship("Rental")
    ledger_entries = relationship("DepositLedgerEntry", back_populates="account", cascade="all, delete-orphan")

class DepositLedgerEntry(Base):
    __tablename__ = "deposit_ledger_entries"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    organization_id = Column(GUID(), ForeignKey("organizations.id", ondelete="CASCADE"), index=True, nullable=False)
    account_id = Column(GUID(), ForeignKey("deposit_accounts.id", ondelete="CASCADE"), index=True, nullable=False)
    
    entry_type = Column(SAEnum(LedgerEntryType), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    
    account = relationship("DepositAccount", back_populates="ledger_entries")
