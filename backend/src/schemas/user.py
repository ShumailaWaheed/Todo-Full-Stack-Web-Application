from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    """Base schema for user with common fields."""
    email: str

class User(UserBase):
    """Schema for returning user data with ID and timestamps."""
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserCreate(UserBase):
    """Schema for creating a new user."""
    email: str

class UserUpdate(BaseModel):
    """Schema for updating an existing user."""
    email: Optional[str] = None