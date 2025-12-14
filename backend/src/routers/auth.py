from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from src.database.session import get_session_dep
from src.middleware.auth import create_access_token
from src.schemas.auth import LoginRequest, Token
from src.models.user import User
from datetime import timedelta
import os
import uuid
from sqlmodel import select

router = APIRouter()

@router.post("/login", response_model=Token)
def login(login_request: LoginRequest, session: Session = Depends(get_session_dep)):
    """
    User login endpoint.
    In a real implementation, this would integrate with Better Auth for credential verification.
    For now, we're simulating user authentication and creating JWT tokens.
    """
    # Validate email format (basic validation)
    if "@" not in login_request.email or "." not in login_request.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )

    # In a real implementation, we would verify credentials with Better Auth
    # For demo purposes, we'll create a user if they don't exist, or return tokens for existing users
    user = session.exec(select(User).where(User.email == login_request.email)).first()

    if not user:
        # Create a new user (in a real implementation, this would be handled by Better Auth)
        user_id = str(uuid.uuid4())
        new_user = User(
            id=user_id,
            email=login_request.email
        )
        session.add(new_user)
        session.commit()
        session.refresh(new_user)
        user = new_user

    # Create access token (short-lived)
    access_token_expires = timedelta(minutes=15)  # Short-lived as per spec
    access_token = create_access_token(
        data={"sub": user.id, "email": user.email},
        expires_delta=access_token_expires
    )

    # Create refresh token (longer-lived)
    refresh_token_expires = timedelta(days=7)  # As per constitution
    refresh_token = create_access_token(
        data={"sub": user.id, "email": user.email, "type": "refresh"},
        expires_delta=refresh_token_expires
    )

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )

@router.post("/refresh", response_model=Token)
def refresh_token(refresh_request: dict, session: Session = Depends(get_session_dep)):
    """
    Refresh access token using refresh token.
    In a real implementation, this would validate the refresh token with Better Auth.
    """
    from src.middleware.auth import verify_token

    refresh_token_str = refresh_request.get("refresh_token")
    if not refresh_token_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token required"
        )

    # Verify the refresh token
    payload = verify_token(refresh_token_str)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )

    # Get user info from payload
    user_id = payload.get("sub")
    email = payload.get("email")

    if not user_id or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token data"
        )

    # Verify user still exists in our database
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists"
        )

    # Create new access token
    access_token_expires = timedelta(minutes=15)  # Short-lived as per spec
    access_token = create_access_token(
        data={"sub": user.id, "email": user.email},
        expires_delta=access_token_expires
    )

    # Create new refresh token (rolling refresh tokens)
    new_refresh_token_expires = timedelta(days=7)
    new_refresh_token = create_access_token(
        data={"sub": user.id, "email": user.email, "type": "refresh"},
        expires_delta=new_refresh_token_expires
    )

    return Token(
        access_token=access_token,
        refresh_token=new_refresh_token,
        token_type="bearer"
    )