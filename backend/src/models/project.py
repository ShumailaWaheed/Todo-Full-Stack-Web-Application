from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING, List
from datetime import datetime
from datetime import timezone
import uuid
from pydantic import ConfigDict

if TYPE_CHECKING:
    from .user import User


class ProjectBase(SQLModel):
    name: str = Field(max_length=100)
    slug: str = Field(max_length=100, unique=True)
    description: Optional[str] = Field(default=None, max_length=1000)
    due_date: Optional[datetime] = Field(default=None)
    priority: Optional[str] = Field(default="medium", max_length=20)  # low, medium, high
    completed: bool = Field(default=False)


class Project(ProjectBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: str = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationship
    user: "User" = Relationship(back_populates="projects")


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(ProjectBase):
    name: Optional[str] = Field(default=None, max_length=100)
    completed: Optional[bool] = Field(default=None)


class ProjectRead(ProjectBase):
    id: uuid.UUID
    user_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)