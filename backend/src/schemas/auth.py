from pydantic import BaseModel
from typing import Optional

class Token(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    """Schema for JWT token data."""
    user_id: str
    username: Optional[str] = None

class LoginRequest(BaseModel):
    """Schema for login request."""
    email: str
    password: str

class RegisterRequest(BaseModel):
    """Schema for registration request."""
    email: str
    password: str
    confirm_password: str

class RefreshTokenRequest(BaseModel):
    """Schema for refresh token request."""
    refresh_token: str