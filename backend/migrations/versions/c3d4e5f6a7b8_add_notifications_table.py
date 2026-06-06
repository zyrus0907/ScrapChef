"""add notifications table

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-06-06 22:20:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c3d4e5f6a7b8"
down_revision: Union[str, None] = "b2c3d4e5f6a7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "notifications",
        sa.Column("household_id", sa.UUID(), nullable=False),
        sa.Column("type", sa.String(length=30), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("related_item_id", sa.UUID(), nullable=True),
        sa.Column("dedup_key", sa.String(length=120), nullable=True),
        sa.Column("is_read", sa.Boolean(), nullable=False),
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["household_id"], ["households.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["related_item_id"], ["pantry_items.id"], ondelete="SET NULL"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_notifications_household_id"), "notifications", ["household_id"], unique=False
    )
    op.create_index(
        op.f("ix_notifications_dedup_key"), "notifications", ["dedup_key"], unique=False
    )
    op.create_index(
        op.f("ix_notifications_is_read"), "notifications", ["is_read"], unique=False
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_notifications_is_read"), table_name="notifications")
    op.drop_index(op.f("ix_notifications_dedup_key"), table_name="notifications")
    op.drop_index(op.f("ix_notifications_household_id"), table_name="notifications")
    op.drop_table("notifications")
