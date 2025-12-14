from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Task(SQLModel, table=True):
    """
    Task model for the todo application.
    Represents a todo item with title, description, completion status, and user ownership.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=200, nullable=False)
    description: Optional[str] = Field(max_length=2000, default=None)
    completed: bool = Field(default=False)
    user_id: str = Field(nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "title": "Complete project",
                "description": "Finish the todo application project",
                "completed": False,
                "user_id": "user_123",
                "created_at": "2025-12-14T10:00:00Z",
                "updated_at": "2025-12-14T10:00:00Z"
            }
        }