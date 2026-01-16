from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING, List
from datetime import datetime

if TYPE_CHECKING:
    from .project import Project

class User(SQLModel, table=True):
    """
    User model for the todo application.
    Note: User authentication is handled by Better Auth,
    this model is for reference and potential additional user data.
    """
    id: Optional[str] = Field(default=None, primary_key=True)
    email: str = Field(default="")
    name: Optional[str] = Field(default=None)
    bio: Optional[str] = Field(default=None)
    location: Optional[str] = Field(default=None)
    theme_preference: Optional[str] = Field(default='dark')
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship
    projects: List["Project"] = Relationship(back_populates="user")