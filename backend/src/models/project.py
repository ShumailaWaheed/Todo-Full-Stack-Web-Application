from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
from datetime import datetime
import uuid

if TYPE_CHECKING:
    from .user import User
    from .task import Task


class ProjectBase(SQLModel):
    name: str = Field(max_length=100)
    slug: str = Field(max_length=100, unique=True)
    description: Optional[str] = Field(default=None, max_length=1000)
    due_date: Optional[datetime] = Field(default=None)
    priority: Optional[str] = Field(default="medium", max_length=20)  # low, medium, high
    completed: bool = Field(default=False)


class Project(ProjectBase, table=True):
    __tablename__ = "projects"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship
    user: "User" = Relationship(back_populates="projects")
    tasks: list["Task"] = Relationship(back_populates="project")


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(ProjectBase):
    name: Optional[str] = Field(default=None, max_length=100)
    completed: Optional[bool] = Field(default=None)


class ProjectRead(ProjectBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime