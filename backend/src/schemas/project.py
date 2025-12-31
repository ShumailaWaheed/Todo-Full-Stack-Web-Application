from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid
from pydantic import field_serializer


class ProjectBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = "medium"  # low, medium, high
    completed: bool = False


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(ProjectBase):
    name: Optional[str] = None
    completed: Optional[bool] = None


class ProjectResponse(ProjectBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

    @field_serializer('id', 'user_id')
    def serialize_uuid(self, value):
        if value is not None:
            return str(value)
        return value