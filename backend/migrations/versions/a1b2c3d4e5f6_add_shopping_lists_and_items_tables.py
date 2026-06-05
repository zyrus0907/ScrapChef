"""add shopping_lists and shopping_list_items tables

Revision ID: a1b2c3d4e5f6
Revises: 27a31c69d769
Create Date: 2026-06-05 17:20:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '27a31c69d769'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('shopping_lists',
    sa.Column('household_id', sa.UUID(), nullable=False),
    sa.Column('created_by_user_id', sa.UUID(), nullable=True),
    sa.Column('name', sa.String(length=120), nullable=False),
    sa.Column('is_archived', sa.Boolean(), nullable=False),
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['household_id'], ['households.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['created_by_user_id'], ['users.id'], ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_shopping_lists_household_id'), 'shopping_lists', ['household_id'], unique=False)
    op.create_index(op.f('ix_shopping_lists_created_by_user_id'), 'shopping_lists', ['created_by_user_id'], unique=False)
    op.create_index(op.f('ix_shopping_lists_is_archived'), 'shopping_lists', ['is_archived'], unique=False)
    op.create_table('shopping_list_items',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('list_id', sa.UUID(), nullable=False),
    sa.Column('name', sa.String(length=200), nullable=False),
    sa.Column('quantity', sa.Numeric(precision=10, scale=3), nullable=False),
    sa.Column('unit', sa.String(length=30), nullable=False),
    sa.Column('category', sa.String(length=60), nullable=False),
    sa.Column('is_purchased', sa.Boolean(), nullable=False),
    sa.Column('source', sa.String(length=20), nullable=False),
    sa.Column('notes', sa.Text(), nullable=False),
    sa.ForeignKeyConstraint(['list_id'], ['shopping_lists.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_shopping_list_items_list_id'), 'shopping_list_items', ['list_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_shopping_list_items_list_id'), table_name='shopping_list_items')
    op.drop_table('shopping_list_items')
    op.drop_index(op.f('ix_shopping_lists_is_archived'), table_name='shopping_lists')
    op.drop_index(op.f('ix_shopping_lists_created_by_user_id'), table_name='shopping_lists')
    op.drop_index(op.f('ix_shopping_lists_household_id'), table_name='shopping_lists')
    op.drop_table('shopping_lists')
