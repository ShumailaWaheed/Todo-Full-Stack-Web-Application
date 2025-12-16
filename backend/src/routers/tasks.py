from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select, func
from typing import List
from src.database.session import get_session_dep
from src.models.task import Task as TaskModel
from src.schemas.task import TaskCreate, TaskUpdate, Task as TaskSchema, TaskToggleComplete, TaskListResponse
from src.middleware.auth import get_current_user, verify_user_owns_resource
from src.models.user import User
import os

router = APIRouter()

@router.get("/", response_model=TaskListResponse)
def list_tasks(
    user_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session_dep),
    completed: bool = Query(None, description="Filter by completion status"),
    limit: int = Query(50, ge=1, le=100, description="Number of tasks to return"),
    offset: int = Query(0, ge=0, description="Offset for pagination")
):
    """List tasks for the authenticated user."""
    # Verify that the user_id in the URL matches the authenticated user
    if current_user.id != user_id:
        # Return 404 as per constitution requirement to prevent user enumeration
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )

    # Build query
    query = select(TaskModel).where(TaskModel.user_id == user_id)

    if completed is not None:
        query = query.where(TaskModel.completed == completed)

    # Get total count
    count_query = select(func.count(TaskModel.id)).where(TaskModel.user_id == user_id)
    if completed is not None:
        count_query = count_query.where(TaskModel.completed == completed)
    total_count = session.exec(count_query).one()

    # Apply pagination
    query = query.offset(offset).limit(limit).order_by(TaskModel.created_at.desc())

    tasks = session.exec(query).all()

    return TaskListResponse(
        tasks=tasks,
        total=total_count,
        offset=offset,
        limit=limit
    )

@router.post("/", response_model=TaskSchema, status_code=status.HTTP_201_CREATED)
def create_task(
    user_id: str,
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session_dep)
):
    """Create a new task for the authenticated user."""
    # Verify that the user_id in the URL matches the authenticated user
    if current_user.id != user_id:
        # Return 404 as per constitution requirement to prevent user enumeration
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )

    # Validate title length
    if len(task_data.title) > 200:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title must be 200 characters or less"
        )

    # Validate description length
    if task_data.description and len(task_data.description) > 2000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Description must be 2000 characters or less"
        )

    # Create task
    task = TaskModel(
        title=task_data.title,
        description=task_data.description,
        completed=task_data.completed or False,
        due_date=task_data.due_date,
        priority=task_data.priority or "medium",
        user_id=user_id
    )

    session.add(task)
    session.commit()
    session.refresh(task)

    return task

@router.get("/{id}", response_model=TaskSchema)
def get_task(
    user_id: str,
    id: str,  # Changed from int to str to match frontend expectations
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session_dep)
):
    """Get a specific task for the authenticated user."""
    # Verify that the user_id in the URL matches the authenticated user
    if current_user.id != user_id:
        # Return 404 as per constitution requirement to prevent user enumeration
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )

    # Try to convert id to int for database query
    try:
        task_id = int(id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID format"
        )

    task = session.get(TaskModel, task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )

    # Verify that the task belongs to the authenticated user
    if task.user_id != user_id:
        # Return 404 as per constitution requirement to prevent user enumeration
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )

    return task

@router.put("/{id}", response_model=TaskSchema)
def update_task(
    user_id: str,
    id: str,  # Changed from int to str to match frontend expectations
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session_dep)
):
    """Update a specific task for the authenticated user."""
    # Verify that the user_id in the URL matches the authenticated user
    if current_user.id != user_id:
        # Return 404 as per constitution requirement to prevent user enumeration
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )

    # Try to convert id to int for database query
    try:
        task_id = int(id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID format"
        )

    task = session.get(TaskModel, task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )

    # Verify that the task belongs to the authenticated user
    if task.user_id != user_id:
        # Return 404 as per constitution requirement to prevent user enumeration
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )

    # Apply updates
    if task_data.title is not None:
        # Validate title length
        if len(task_data.title) > 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Title must be 200 characters or less"
            )
        task.title = task_data.title

    if task_data.description is not None:
        # Validate description length
        if len(task_data.description) > 2000:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Description must be 2000 characters or less"
            )
        task.description = task_data.description

    if task_data.completed is not None:
        task.completed = task_data.completed

    if task_data.due_date is not None:
        task.due_date = task_data.due_date

    if task_data.priority is not None:
        task.priority = task_data.priority

    session.add(task)
    session.commit()
    session.refresh(task)

    return task

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    user_id: str,
    id: str,  # Changed from int to str to match frontend expectations
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session_dep)
):
    """Delete a specific task for the authenticated user."""
    # Verify that the user_id in the URL matches the authenticated user
    if current_user.id != user_id:
        # Return 404 as per constitution requirement to prevent user enumeration
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )

    # Try to convert id to int for database query
    try:
        task_id = int(id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID format"
        )

    task = session.get(TaskModel, task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )

    # Verify that the task belongs to the authenticated user
    if task.user_id != user_id:
        # Return 404 as per constitution requirement to prevent user enumeration
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )

    session.delete(task)
    session.commit()

    return

@router.patch("/{id}/complete", response_model=TaskSchema)
def toggle_task_completion(
    user_id: str,
    id: str,  # Changed from int to str to match frontend expectations
    completion_data: TaskToggleComplete,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session_dep)
):
    """Toggle the completion status of a specific task for the authenticated user."""
    # Verify that the user_id in the URL matches the authenticated user
    if current_user.id != user_id:
        # Return 404 as per constitution requirement to prevent user enumeration
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )

    # Try to convert id to int for database query
    try:
        task_id = int(id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid task ID format"
        )

    task = session.get(TaskModel, task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )

    # Verify that the task belongs to the authenticated user
    if task.user_id != user_id:
        # Return 404 as per constitution requirement to prevent user enumeration
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )

    # Update completion status
    task.completed = completion_data.completed

    session.add(task)
    session.commit()
    session.refresh(task)

    return task