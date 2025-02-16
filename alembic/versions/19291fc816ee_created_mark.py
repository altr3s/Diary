"""created mark

Revision ID: 19291fc816ee
Revises: c380f9622fcc
Create Date: 2022-08-30 15:47:32.249347

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '19291fc816ee'
down_revision = 'c380f9622fcc'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('marks', schema=None) as batch_op:
        batch_op.add_column(sa.Column('date', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('time', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('class_id', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('student_id', sa.Integer(), nullable=True))
        batch_op.create_foreign_key('fk_mark_student', 'students', ['student_id'], ['id'])

    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('marks', schema=None) as batch_op:
        batch_op.drop_constraint('fk_mark_student', type_='foreignkey')
        batch_op.drop_column('student_id')
        batch_op.drop_column('class_id')
        batch_op.drop_column('time')
        batch_op.drop_column('date')

    # ### end Alembic commands ###
