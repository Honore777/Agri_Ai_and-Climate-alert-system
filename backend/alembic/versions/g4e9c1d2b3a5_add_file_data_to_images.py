"""add file_data to images

Stores the image binary in Postgres so photos survive Render's
ephemeral filesystem (which is wiped on every restart/redeploy).

Revision ID: g4e9c1d2b3a5
Revises: f3d8a1b2c4e5
Create Date: 2026-11-01
"""
from alembic import op
import sqlalchemy as sa

revision = 'g4e9c1d2b3a5'
down_revision = 'f3d8a1b2c4e5'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('images', sa.Column('file_data', sa.LargeBinary(), nullable=True))


def downgrade():
    op.drop_column('images', 'file_data')
