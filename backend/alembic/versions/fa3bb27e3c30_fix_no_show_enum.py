"""Fix NO_SHOW enum

Revision ID: fa3bb27e3c30
Revises: bceddf7b4faf
Create Date: 2026-08-08 13:55:00.264384

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fa3bb27e3c30'
down_revision: Union[str, Sequence[str], None] = 'bceddf7b4faf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add NO_SHOW to rentalstatus if using postgres enum
    # In alembic, we need autocommit or simple execute
    op.execute("ALTER TYPE rentalstatus ADD VALUE IF NOT EXISTS 'NO_SHOW'")
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
