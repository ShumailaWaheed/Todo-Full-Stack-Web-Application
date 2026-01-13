import re
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from database.session import get_session_dep
from models.user import User
from models.project import Project, ProjectCreate, ProjectUpdate, ProjectRead
from schemas.project import ProjectResponse
from middleware.auth import get_current_user

router = APIRouter()


@router.get("/{user_id}/projects", response_model=List[ProjectResponse])
async def get_projects(
    user_id: str,  # Changed from UUID to str to match user_id format
    completed: Optional[bool] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session_dep)
):
    # Verify that the user_id in the URL matches the authenticated user
    if current_user.id != user_id:
        # Return 404 as per constitution requirement to prevent user enumeration
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )

    query = select(Project).where(Project.user_id == user_id)

    if completed is not None:
        query = query.where(Project.completed == completed)

    query = query.offset(offset).limit(limit)
    projects = session.exec(query).all()
    return projects


@router.get("/{user_id}/projects/{project_id}", response_model=ProjectResponse)
async def get_project(
    user_id: str,  # Changed from UUID to str to match user_id format
    project_id: str,  # Changed from UUID to str to match frontend expectations
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session_dep)
):
    # Verify that the user_id in the URL matches the authenticated user
    if current_user.id != user_id:
        # Return 404 as per constitution requirement to prevent user enumeration
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )

    # Try to convert project_id to int for database query (assuming it's an integer ID)
    try:
        proj_id = int(project_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid project ID format"
        )

    project = session.get(Project, proj_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    if project.user_id != user_id:
        # Return 404 as per constitution requirement to prevent user enumeration
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    return project


@router.post("/{user_id}/projects", response_model=ProjectResponse)
async def create_project(
    user_id: str,  # Changed from UUID to str to match user_id format
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session_dep)
):
    # Verify that the user_id in the URL matches the authenticated user
    if current_user.id != user_id:
        # Return 404 as per constitution requirement to prevent user enumeration
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )

    # Validate project data
    if not project_data.name or len(project_data.name.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Project name is required"
        )

    if len(project_data.name) > 100:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Project name must be 100 characters or less"
        )

    if not project_data.slug or len(project_data.slug.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Project slug is required"
        )

    if len(project_data.slug) > 100:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Project slug must be 100 characters or less"
        )

    if not re.match(r'^[a-z0-9-]+$', project_data.slug):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Slug can only contain lowercase letters, numbers, and hyphens"
        )

    # Check if slug already exists for this user
    existing_project = session.exec(
        select(Project).where(Project.user_id == user_id, Project.slug == project_data.slug)
    ).first()
    if existing_project:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Project with this slug already exists"
        )

    if project_data.description and len(project_data.description) > 1000:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Description must be 1000 characters or less"
        )

    if project_data.priority and project_data.priority not in ["low", "medium", "high"]:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Priority must be one of: low, medium, high"
        )

    project = Project(
        **project_data.model_dump(),
        user_id=user_id
    )
    session.add(project)
    session.commit()
    session.refresh(project)
    return project


@router.put("/{user_id}/projects/{project_id}", response_model=ProjectResponse)
async def update_project(
    user_id: str,  # Changed from UUID to str to match user_id format
    project_id: str,  # Changed from UUID to str to match frontend expectations
    project_data: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session_dep)
):
    # Verify that the user_id in the URL matches the authenticated user
    if current_user.id != user_id:
        # Return 404 as per constitution requirement to prevent user enumeration
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )

    # Try to convert project_id to int for database query (assuming it's an integer ID)
    try:
        proj_id = int(project_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid project ID format"
        )

    project = session.get(Project, proj_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    if project.user_id != user_id:
        # Return 404 as per constitution requirement to prevent user enumeration
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )

    # Validate project data
    if project_data.name and len(project_data.name) > 100:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Project name must be 100 characters or less"
        )

    if project_data.description and len(project_data.description) > 1000:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Description must be 1000 characters or less"
        )

    if project_data.priority and project_data.priority not in ["low", "medium", "high"]:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Priority must be one of: low, medium, high"
        )

    update_data = project_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)
    project.updated_at = datetime.utcnow()
    session.add(project)
    session.commit()
    session.refresh(project)
    return project


@router.delete("/{user_id}/projects/{project_id}")
async def delete_project(
    user_id: str,  # Changed from UUID to str to match user_id format
    project_id: str,  # Changed from UUID to str to match frontend expectations
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session_dep)
):
    # Verify that the user_id in the URL matches the authenticated user
    if current_user.id != user_id:
        # Return 404 as per constitution requirement to prevent user enumeration
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )

    # Try to convert project_id to int for database query (assuming it's an integer ID)
    try:
        proj_id = int(project_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid project ID format"
        )

    project = session.get(Project, proj_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    if project.user_id != user_id:
        # Return 404 as per constitution requirement to prevent user enumeration
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )

    session.delete(project)
    session.commit()
    return {"message": "Project deleted successfully"}


@router.patch("/{user_id}/projects/{project_id}/complete", response_model=ProjectResponse)
async def toggle_project_completion(
    user_id: str,  # Changed from UUID to str to match user_id format
    project_id: str,  # Changed from UUID to str to match frontend expectations
    completion_data: dict,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session_dep)
):
    # Verify that the user_id in the URL matches the authenticated user
    if current_user.id != user_id:
        # Return 404 as per constitution requirement to prevent user enumeration
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )

    # Try to convert project_id to int for database query (assuming it's an integer ID)
    try:
        proj_id = int(project_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid project ID format"
        )

    project = session.get(Project, proj_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    if project.user_id != user_id:
        # Return 404 as per constitution requirement to prevent user enumeration
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )

    completed = completion_data.get("completed")
    if completed is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Completed status is required"
        )

    project.completed = completed
    project.updated_at = datetime.utcnow()
    session.add(project)
    session.commit()
    session.refresh(project)
    return project