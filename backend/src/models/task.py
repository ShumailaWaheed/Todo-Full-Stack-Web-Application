from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Task(SQLModel, table=True):
    """
    Task model for the todo application.
    Represents a todo item with title, description, completion status, and user ownership.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(default="", max_length=200)
    description: Optional[str] = Field(default="", max_length=2000)
    completed: bool = Field(default=False)
    user_id: str = Field(default="", foreign_key="user.id")  # Foreign key to User
    due_date: Optional[datetime] = Field(default=None)
    priority: str = Field(default="medium", max_length=20)  # low, medium, high
    project_id: Optional[int] = Field(default=None, foreign_key="project.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)