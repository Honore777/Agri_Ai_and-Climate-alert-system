"""added new fields

Revision ID: 74037ae81247
Revises: 5a54c29c5cdf
Create Date: 2026-02-17 15:32:10.227891

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '74037ae81247'
down_revision: Union[str, Sequence[str], None] = '5a54c29c5cdf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema - Add is_used and used_by_user_id to registration_codes."""
    # SQLite requires batch mode for adding columns with constraints
    with op.batch_alter_table('registration_codes', schema=None) as batch_op:
        batch_op.add_column(sa.Column('is_used', sa.Boolean(), nullable=False, server_default='0'))
        batch_op.add_column(sa.Column('used_by_user_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key('fk_registration_codes_used_by_user_id', 'users', ['used_by_user_id'], ['id'])
    
    # Create index after batch alter
    op.create_index(op.f('ix_registration_codes_is_used'), 'registration_codes', ['is_used'], unique=False)


def downgrade() -> None:
    """Downgrade schema - Remove is_used and used_by_user_id from registration_codes."""
    # Drop index first (outside batch mode)
    op.drop_index(op.f('ix_registration_codes_is_used'), table_name='registration_codes')
    
    # SQLite requires batch mode for dropping columns
    with op.batch_alter_table('registration_codes', schema=None) as batch_op:
        batch_op.drop_constraint('fk_registration_codes_used_by_user_id', type_='foreignkey')
        batch_op.drop_column('used_by_user_id')
        batch_op.drop_column('is_used')
