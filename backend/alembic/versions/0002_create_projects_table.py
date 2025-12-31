"""Create projects table

Revision ID: 0002_create_projects_table
Revises: 0001_initial_models
Create Date: 2025-12-17 22:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel
from datetime import datetime

# revision identifiers
revision = '0002_create_projects_table'
down_revision = '0001_initial_models'
branch_labels = None
depends_on = None


def upgrade():
    # Create projects table
    op.create_table('projects',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('slug', sa.String(length=100), nullable=False),
        sa.Column('description', sa.String(length=1000), nullable=True),
        sa.Column('due_date', sa.DateTime(), nullable=True),
        sa.Column('priority', sa.String(length=20), nullable=True),
        sa.Column('completed', sa.Boolean(), nullable=False, default=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('slug')
    )

    # Create index for performance
    op.create_index('ix_projects_user_id', 'projects', ['user_id'])
    op.create_index('ix_projects_completed', 'projects', ['completed'])


def downgrade():
    # Drop index first
    op.drop_index('ix_projects_completed', table_name='projects')
    op.drop_index('ix_projects_user_id', table_name='projects')

    # Drop projects table
    op.drop_table('projects')