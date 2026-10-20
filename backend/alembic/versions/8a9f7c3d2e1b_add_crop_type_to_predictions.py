"""add crop_type to predictions

Revision ID: 8a9f7c3d2e1b
Revises: 74037ae81247
Create Date: 2026-02-17 16:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8a9f7c3d2e1b'
down_revision: Union[str, Sequence[str], None] = '74037ae81247'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add crop_type column to predictions table."""
    with op.batch_alter_table('predictions', schema=None) as batch_op:
        batch_op.add_column(sa.Column('crop_type', sa.String(), nullable=True))


def downgrade() -> None:
    """Remove crop_type column from predictions table."""
    with op.batch_alter_table('predictions', schema=None) as batch_op:
        batch_op.drop_column('crop_type')
