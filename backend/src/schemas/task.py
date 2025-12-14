from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TaskBase(BaseModel):
    """Base schema for task with common fields."""
    title: str
    description: Optional[str] = None
    completed: bool = False

class TaskCreate(TaskBase):
    """Schema for creating a new task."""
    title: str
    description: Optional[str] = None

class TaskUpdate(BaseModel):
    """Schema for updating an existing task."""
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None

class TaskToggleComplete(BaseModel):
    """Schema for toggling task completion status."""
    completed: bool

class Task(TaskBase):
    """Schema for returning task data with ID and timestamps."""
    id: int
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TaskListResponse(BaseModel):
    """Schema for returning a list of tasks."""
    tasks: list[Task]
    total: int
    offset: int
    limit: int