from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime

class TaskBase(BaseModel):
    """Base schema for task with common fields."""
    title: str
    description: Optional[str] = None
    completed: bool = False
    due_date: Optional[datetime] = None
    priority: Optional[str] = "medium"

    @field_validator('due_date', mode='before')
    @classmethod
    def parse_due_date(cls, v):
        """Parse due_date from string if needed."""
        if v is None:
            return None
        if isinstance(v, datetime):
            return v
        try:
            return datetime.fromisoformat(v.replace('Z', '+00:00'))
        except (ValueError, AttributeError):
            return None

class TaskCreate(TaskBase):
    """Schema for creating a new task."""
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = "medium"
    project_id: Optional[int] = None

class TaskUpdate(BaseModel):
    """Schema for updating an existing task."""
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = None
    project_id: Optional[int] = None

    @field_validator('due_date', mode='before')
    @classmethod
    def parse_due_date(cls, v):
        """Parse due_date from string if needed."""
        if v is None:
            return None
        if isinstance(v, datetime):
            return v
        try:
            return datetime.fromisoformat(v.replace('Z', '+00:00'))
        except (ValueError, AttributeError):
            return None

class TaskToggleComplete(BaseModel):
    """Schema for toggling task completion status."""
    completed: bool

class Task(TaskBase):
    """Schema for returning task data with ID and timestamps."""
    id: int
    user_id: str
    project_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = {'from_attributes': True}

class TaskListResponse(BaseModel):
    """Schema for returning a list of tasks."""
    tasks: List[Task]
    total: int
    offset: int
    limit: int

    model_config = {'from_attributes': True}


class TaskCompletionTrend(BaseModel):
    """Schema for task completion trend data point."""
    week: str  # ISO date string for start of week
    completed: int


class TaskCompletionTrendsResponse(BaseModel):
    """Schema for returning task completion trends."""
    trends: list[TaskCompletionTrend]


class WeeklyTaskActivity(BaseModel):
    """Schema for weekly task activity data point."""
    week: str  # ISO date string for start of week
    created: int
    completed: int


class WeeklyTaskActivityResponse(BaseModel):
    """Schema for returning weekly task activity."""
    activity: list[WeeklyTaskActivity]


class TaskAnalyticsSummary(BaseModel):
    """Schema for task analytics summary."""
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    overdue_tasks: int
    completion_rate: float
    tasks_completed_this_week: int
    tasks_created_this_week: int
    high_priority_pending: int
    medium_priority_pending: int
    low_priority_pending: int