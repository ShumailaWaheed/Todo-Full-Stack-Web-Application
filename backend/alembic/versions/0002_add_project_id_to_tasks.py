"""Add project_id to tasks table

Revision ID: 0003_add_project_id_to_tasks
Revises: 0002_create_projects_table
Create Date: 2025-12-17 22:40:00.000000

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel

# revision identifiers
revision = '0003_add_project_id_to_tasks'
down_revision = '0002_create_projects_table'
branch_labels = None
depends_on = None


def upgrade():
    # Add project_id column to tasks table
    with op.batch_alter_table("task") as batch_op:
        batch_op.add_column(sa.Column('project_id', sa.String(), nullable=True))
        batch_op.create_foreign_key('fk_task_project_id', 'projects', ['project_id'], ['id'])


def downgrade():
    # Remove project_id column from tasks table
    with op.batch_alter_table("task") as batch_op:
        batch_op.drop_constraint('fk_task_project_id', type_='foreignkey')
        batch_op.drop_column('project_id')