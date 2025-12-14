from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class User(SQLModel, table=True):
    """
    User model for the todo application.
    Note: User authentication is handled by Better Auth,
    this model is for reference and potential additional user data.
    """
    id: Optional[str] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "id": "user_123",
                "email": "user@example.com",
                "created_at": "2025-12-14T10:00:00Z",
                "updated_at": "2025-12-14T10:00:00Z"
            }
        }