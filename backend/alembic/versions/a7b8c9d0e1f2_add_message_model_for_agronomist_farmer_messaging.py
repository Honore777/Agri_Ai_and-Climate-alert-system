"""add message model for agronomist farmer messaging

Revision ID: a7b8c9d0e1f2
Revises: 9b0f8d4e3f2c
Create Date: 2026-02-17 09:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a7b8c9d0e1f2'
down_revision: Union[str, Sequence[str], None] = '9b0f8d4e3f2c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema - add messages table for agronomist-farmer communication."""
    # Create messages table
    op.create_table(
        'messages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('agronomist_id', sa.Integer(), nullable=False),
        sa.Column('farmer_id', sa.Integer(), nullable=False),
        sa.Column('prediction_id', sa.Integer(), nullable=True),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('body', sa.Text(), nullable=False),
        sa.Column('is_read', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['agronomist_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['farmer_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['prediction_id'], ['predictions.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.Index('ix_messages_agronomist_id', 'agronomist_id'),
        sa.Index('ix_messages_farmer_id', 'farmer_id'),
        sa.Index('ix_messages_prediction_id', 'prediction_id'),
        sa.Index('ix_messages_created_at', 'created_at'),
    )


def downgrade() -> None:
    """Downgrade schema - remove messages table."""
    op.drop_table('messages')
