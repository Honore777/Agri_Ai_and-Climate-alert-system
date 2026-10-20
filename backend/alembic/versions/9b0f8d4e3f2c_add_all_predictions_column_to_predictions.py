"""add all_predictions column to predictions

Revision ID: 9b0f8d4e3f2c
Revises: 8a9f7c3d2e1b
Create Date: 2026-02-17 16:05:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9b0f8d4e3f2c'
down_revision: Union[str, Sequence[str], None] = '8a9f7c3d2e1b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add all_predictions column to predictions table."""
    with op.batch_alter_table('predictions', schema=None) as batch_op:
        batch_op.add_column(sa.Column('all_predictions', sa.JSON(), nullable=False, server_default='{}'))


def downgrade() -> None:
    """Remove all_predictions column from predictions table."""
    with op.batch_alter_table('predictions', schema=None) as batch_op:
        batch_op.drop_column('all_predictions')
