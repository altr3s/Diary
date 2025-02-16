"""added subject table

Revision ID: 18dd3c70f8a8
Revises: 5510b3260062
Create Date: 2022-06-15 18:00:59.313664

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '18dd3c70f8a8'
down_revision = '5510b3260062'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('subjects',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('subjects')
    # ### end Alembic commands ###
