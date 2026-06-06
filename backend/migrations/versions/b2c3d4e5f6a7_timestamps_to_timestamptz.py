"""convert TimestampMixin columns to timestamptz

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-06-06 22:05:00.000000

The domain emits timezone-aware UTC datetimes, but these columns were created as
naive ``timestamp``. asyncpg rejects aware datetimes on naive columns, so convert
them to ``timestamptz`` (interpreting existing values as UTC).
"""
from typing import Sequence, Union

from alembic import op

revision: str = "b2c3d4e5f6a7"
down_revision: Union[str, None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_TABLES = ["users", "households", "pantry_items", "recipes", "shopping_lists"]
_COLUMNS = ["created_at", "updated_at"]


def upgrade() -> None:
    for table in _TABLES:
        for col in _COLUMNS:
            op.execute(
                f"ALTER TABLE {table} ALTER COLUMN {col} "
                f"TYPE timestamptz USING {col} AT TIME ZONE 'UTC'"
            )


def downgrade() -> None:
    for table in _TABLES:
        for col in _COLUMNS:
            op.execute(
                f"ALTER TABLE {table} ALTER COLUMN {col} "
                f"TYPE timestamp USING {col} AT TIME ZONE 'UTC'"
            )
