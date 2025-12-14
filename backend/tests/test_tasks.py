# backend/tests/test_tasks.py
import pytest
from fastapi.testclient import TestClient
from src.main import app
import uuid

client = TestClient(app)


def test_task_lifecycle():
    """Test the complete task lifecycle: create, read, update, delete."""
    # First, login to get a user
    login_response = client.post(
        "/api/auth/login",
        json={"email": f"test_{uuid.uuid4()}@example.com", "password": "password123"}
    )
    assert login_response.status_code == 200
    tokens = login_response.json()
    user_id = "temp_user_id"  # In the real implementation, we'd extract this from the token
    access_token = tokens["access_token"]

    # Add auth headers for subsequent requests
    auth_headers = {"Authorization": f"Bearer {access_token}"}

    # Create a task
    create_response = client.post(
        f"/api/users/{user_id}/tasks",
        json={"title": "Test Task", "description": "Test Description", "completed": False},
        headers=auth_headers
    )
    assert create_response.status_code == 201
    created_task = create_response.json()
    task_id = created_task["id"]

    # Get the task
    get_response = client.get(
        f"/api/users/{user_id}/tasks/{task_id}",
        headers=auth_headers
    )
    assert get_response.status_code == 200
    retrieved_task = get_response.json()
    assert retrieved_task["title"] == "Test Task"

    # Update the task
    update_response = client.put(
        f"/api/users/{user_id}/tasks/{task_id}",
        json={"title": "Updated Task", "description": "Updated Description"},
        headers=auth_headers
    )
    assert update_response.status_code == 200
    updated_task = update_response.json()
    assert updated_task["title"] == "Updated Task"

    # Toggle task completion
    toggle_response = client.patch(
        f"/api/users/{user_id}/tasks/{task_id}/complete",
        json={"completed": True},
        headers=auth_headers
    )
    assert toggle_response.status_code == 200
    toggled_task = toggle_response.json()
    assert toggled_task["completed"] is True

    # List tasks
    list_response = client.get(
        f"/api/users/{user_id}/tasks",
        headers=auth_headers
    )
    assert list_response.status_code == 200
    tasks_list = list_response.json()
    assert len(tasks_list["tasks"]) >= 1

    # Delete the task
    delete_response = client.delete(
        f"/api/users/{user_id}/tasks/{task_id}",
        headers=auth_headers
    )
    assert delete_response.status_code == 204


def test_user_isolation():
    """Test that users cannot access other users' tasks."""
    # Login as first user
    login1_response = client.post(
        "/api/auth/login",
        json={"email": f"test1_{uuid.uuid4()}@example.com", "password": "password123"}
    )
    assert login1_response.status_code == 200
    user1_tokens = login1_response.json()
    user1_access_token = user1_tokens["access_token"]

    # Login as second user
    login2_response = client.post(
        "/api/auth/login",
        json={"email": f"test2_{uuid.uuid4()}@example.com", "password": "password123"}
    )
    assert login2_response.status_code == 200
    user2_tokens = login2_response.json()
    user2_access_token = user2_tokens["access_token"]

    # Create a task for user 1
    create_response = client.post(
        f"/api/users/temp_user_id/tasks",
        json={"title": "User 1 Task", "description": "For user 1 only", "completed": False},
        headers={"Authorization": f"Bearer {user1_access_token}"}
    )
    assert create_response.status_code == 201
    created_task = create_response.json()
    task_id = created_task["id"]

    # Try to access user 1's task with user 2's token (should fail)
    get_response = client.get(
        f"/api/users/temp_user_id/tasks/{task_id}",
        headers={"Authorization": f"Bearer {user2_access_token}"}
    )
    # Should return 404 due to user isolation
    assert get_response.status_code == 404