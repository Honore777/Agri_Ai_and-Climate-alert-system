"""add prediction_id to images

Revision ID: f3d8a1b2c4e5
Revises: 8c3f2a9b1d4e
Create Date: 2026-10-20

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f3d8a1b2c4e5'
down_revision = '8c3f2a9b1d4e'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('images', sa.Column('prediction_id', sa.Integer(), nullable=True))
    op.create_foreign_key(
        'fk_images_prediction_id', 'images', 'predictions', ['prediction_id'], ['id']
    )
    # Backfill: each prediction's primary image links back to the prediction
    op.execute(
        'UPDATE images SET prediction_id = predictions.id '
        'FROM predictions WHERE predictions.image_id = images.id'
    )


def downgrade() -> None:
    op.drop_constraint('fk_images_prediction_id', 'images', type_='foreignkey')
    op.drop_column('images', 'prediction_id')
