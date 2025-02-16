"""added days to group

Revision ID: bbc01ffeca65
Revises: 7dcd49db1f8d
Create Date: 2022-07-22 01:18:34.090516

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'bbc01ffeca65'
down_revision = '7dcd49db1f8d'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('scheduleclasses', schema=None) as batch_op:
        batch_op.add_column(sa.Column('day_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key('fk_class_day', 'days', ['day_id'], ['id'])

    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('scheduleclasses', schema=None) as batch_op:
        batch_op.drop_constraint('fk_class_day', type_='foreignkey')
        batch_op.drop_column('day_id')

    # ### end Alembic commands ###
