from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import Optional
from database.session import get_session_dep
from models.user import User
from schemas.user import UserUpdate, UserResponse
from middleware.auth import get_current_user
import uuid
from datetime import datetime

router = APIRouter()

@router.get("/profile", response_model=UserResponse)
def get_profile(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session_dep)
):
    """Get current user's profile information."""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        name=getattr(current_user, 'name', None),
        bio=getattr(current_user, 'bio', None),
        location=getattr(current_user, 'location', None),
        theme_preference=getattr(current_user, 'theme_preference', 'dark'),
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
    )

@router.put("/profile", response_model=UserResponse)
def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session_dep)
):
    """Update current user's profile information."""
    # Update user fields if provided
    if user_update.name is not None:
        current_user.name = user_update.name
    if user_update.bio is not None:
        current_user.bio = user_update.bio
    if user_update.location is not None:
        current_user.location = user_update.location
    if user_update.theme_preference is not None:
        current_user.theme_preference = user_update.theme_preference

    # Update the timestamp
    current_user.updated_at = datetime.utcnow()

    session.add(current_user)
    session.commit()
    session.refresh(current_user)

    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        name=current_user.name,
        bio=current_user.bio,
        location=current_user.location,
        theme_preference=getattr(current_user, 'theme_preference', 'dark'),
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
    )

@router.get("/export-data")
def export_user_data(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session_dep)
):
    """Export all user data in JSON format."""
    from models.task import Task
    from sqlmodel import select
    import json

    # Get all tasks for the user
    user_tasks = session.exec(select(Task).where(Task.user_id == current_user.id)).all()

    # Prepare data for export
    export_data = {
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "name": current_user.name,
            "bio": current_user.bio,
            "location": current_user.location,
            "created_at": current_user.created_at.isoformat(),
            "updated_at": current_user.updated_at.isoformat()
        },
        "tasks": [
            {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "completed": task.completed,
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "priority": task.priority,
                "created_at": task.created_at.isoformat(),
                "updated_at": task.updated_at.isoformat()
            }
            for task in user_tasks
        ]
    }

    return json.dumps(export_data, indent=2)