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
    name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    theme_preference: Optional[str] = None


class UserResponse(BaseModel):
    """Schema for returning user profile data."""
    id: str
    email: str
    name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    theme_preference: Optional[str] = 'dark'
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True