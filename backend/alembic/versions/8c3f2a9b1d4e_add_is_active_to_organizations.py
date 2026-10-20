"""add is_active to organizations

Revision ID: 8c3f2a9b1d4e
Revises: 5fa1f055ab1f
Create Date: 2026-10-11

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8c3f2a9b1d4e'
down_revision: Union[str, Sequence[str], None] = '5fa1f055ab1f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Existing orgs become active; new column is NOT NULL via server_default.
    op.add_column(
        'organizations',
        sa.Column('is_active', sa.Boolean(), server_default=sa.true(), nullable=False),
    )


def downgrade() -> None:
    op.drop_column('organizations', 'is_active')
