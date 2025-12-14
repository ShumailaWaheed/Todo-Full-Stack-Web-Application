# backend/tests/test_integration.py
"""
Integration tests that verify all user stories work together.
This test simulates a complete user journey through the application.
"""
import pytest
from fastapi.testclient import TestClient
from src.main import app
import uuid

client = TestClient(app)


def test_complete_user_journey():
    """
    Test the complete user journey:
    1. User registration/login (User Story 1)
    2. Task management - CRUD operations (User Story 2)
    3. Task completion toggle (User Story 3)
    """
    # User Story 1: Authentication
    # Register/login a new user
    email = f"integration_test_{uuid.uuid4()}@example.com"
    login_response = client.post(
        "/api/auth/login",
        json={"email": email, "password": "securepassword123"}
    )
    assert login_response.status_code == 200
    tokens = login_response.json()
    assert "access_token" in tokens
    assert "refresh_token" in tokens
    access_token = tokens["access_token"]

    # Verify we can use the token for authenticated requests
    auth_headers = {"Authorization": f"Bearer {access_token}"}

    # User Story 2: Task Management (CRUD operations)
    # Create a task
    create_task_response = client.post(
        "/api/users/temp_user_id/tasks",
        json={
            "title": "Integration Test Task",
            "description": "This is a test task for integration testing",
            "completed": False
        },
        headers=auth_headers
    )
    assert create_task_response.status_code == 201
    created_task = create_task_response.json()
    task_id = created_task["id"]
    assert created_task["title"] == "Integration Test Task"
    assert created_task["description"] == "This is a test task for integration testing"
    assert created_task["completed"] is False

    # Retrieve the task
    get_task_response = client.get(
        f"/api/users/temp_user_id/tasks/{task_id}",
        headers=auth_headers
    )
    assert get_task_response.status_code == 200
    retrieved_task = get_task_response.json()
    assert retrieved_task["id"] == task_id
    assert retrieved_task["title"] == "Integration Test Task"

    # Update the task
    update_task_response = client.put(
        f"/api/users/temp_user_id/tasks/{task_id}",
        json={
            "title": "Updated Integration Test Task",
            "description": "Updated description for integration test"
        },
        headers=auth_headers
    )
    assert update_task_response.status_code == 200
    updated_task = update_task_response.json()
    assert updated_task["title"] == "Updated Integration Test Task"
    assert updated_task["description"] == "Updated description for integration test"

    # List tasks and verify our task is there
    list_tasks_response = client.get(
        "/api/users/temp_user_id/tasks",
        headers=auth_headers
    )
    assert list_tasks_response.status_code == 200
    tasks_list = list_tasks_response.json()
    assert len(tasks_list["tasks"]) >= 1
    task_in_list = next((t for t in tasks_list["tasks"] if t["id"] == task_id), None)
    assert task_in_list is not None
    assert task_in_list["title"] == "Updated Integration Test Task"

    # User Story 3: Task Completion Toggle
    # Toggle task completion to true
    toggle_response = client.patch(
        f"/api/users/temp_user_id/tasks/{task_id}/complete",
        json={"completed": True},
        headers=auth_headers
    )
    assert toggle_response.status_code == 200
    toggled_task = toggle_response.json()
    assert toggled_task["completed"] is True

    # Toggle task completion back to false
    toggle_back_response = client.patch(
        f"/api/users/temp_user_id/tasks/{task_id}/complete",
        json={"completed": False},
        headers=auth_headers
    )
    assert toggle_back_response.status_code == 200
    toggled_back_task = toggle_back_response.json()
    assert toggled_back_task["completed"] is False

    # Verify the completion status persists in the database by retrieving the task
    verify_completion_response = client.get(
        f"/api/users/temp_user_id/tasks/{task_id}",
        headers=auth_headers
    )
    assert verify_completion_response.status_code == 200
    verified_task = verify_completion_response.json()
    assert verified_task["completed"] is False

    # Delete the task
    delete_task_response = client.delete(
        f"/api/users/temp_user_id/tasks/{task_id}",
        headers=auth_headers
    )
    assert delete_task_response.status_code == 204

    # Verify the task is deleted
    verify_deletion_response = client.get(
        f"/api/users/temp_user_id/tasks/{task_id}",
        headers=auth_headers
    )
    assert verify_deletion_response.status_code == 404


def test_user_isolation_integration():
    """
    Test that user isolation works properly across all features.
    Users should not be able to access other users' data.
    """
    # Create first user
    email1 = f"user1_{uuid.uuid4()}@example.com"
    login_response1 = client.post(
        "/api/auth/login",
        json={"email": email1, "password": "password1"}
    )
    assert login_response1.status_code == 200
    user1_tokens = login_response1.json()
    user1_access_token = user1_tokens["access_token"]

    # Create second user
    email2 = f"user2_{uuid.uuid4()}@example.com"
    login_response2 = client.post(
        "/api/auth/login",
        json={"email": email2, "password": "password2"}
    )
    assert login_response2.status_code == 200
    user2_tokens = login_response2.json()
    user2_access_token = user2_tokens["access_token"]

    # User 1 creates a task
    create_task_response = client.post(
        "/api/users/temp_user_id/tasks",
        json={
            "title": "User 1's Private Task",
            "description": "This should only be accessible by user 1",
            "completed": False
        },
        headers={"Authorization": f"Bearer {user1_access_token}"}
    )
    assert create_task_response.status_code == 201
    private_task = create_task_response.json()
    private_task_id = private_task["id"]

    # User 2 tries to access User 1's task (should fail)
    access_response = client.get(
        f"/api/users/temp_user_id/tasks/{private_task_id}",
        headers={"Authorization": f"Bearer {user2_access_token}"}
    )
    # Should return 404 due to user isolation
    assert access_response.status_code == 404

    # User 2 tries to update User 1's task (should fail)
    update_response = client.put(
        f"/api/users/temp_user_id/tasks/{private_task_id}",
        json={"title": "Attempted update by user 2"},
        headers={"Authorization": f"Bearer {user2_access_token}"}
    )
    assert update_response.status_code == 404

    # User 2 tries to delete User 1's task (should fail)
    delete_response = client.delete(
        f"/api/users/temp_user_id/tasks/{private_task_id}",
        headers={"Authorization": f"Bearer {user2_access_token}"}
    )
    assert delete_response.status_code == 404

    # User 2 tries to toggle completion of User 1's task (should fail)
    toggle_response = client.patch(
        f"/api/users/temp_user_id/tasks/{private_task_id}/complete",
        json={"completed": True},
        headers={"Authorization": f"Bearer {user2_access_token}"}
    )
    assert toggle_response.status_code == 404

    # Clean up: User 1 deletes their task
    cleanup_response = client.delete(
        f"/api/users/temp_user_id/tasks/{private_task_id}",
        headers={"Authorization": f"Bearer {user1_access_token}"}
    )
    assert cleanup_response.status_code == 204


def test_token_refresh_integration():
    """
    Test that token refresh works properly with all features.
    """
    # Login to get tokens
    email = f"refresh_test_{uuid.uuid4()}@example.com"
    login_response = client.post(
        "/api/auth/login",
        json={"email": email, "password": "password"}
    )
    assert login_response.status_code == 200
    tokens = login_response.json()
    initial_access_token = tokens["access_token"]
    refresh_token = tokens["refresh_token"]

    # Use initial token to create a task
    create_response = client.post(
        "/api/users/temp_user_id/tasks",
        json={
            "title": "Task with initial token",
            "description": "Created with initial access token",
            "completed": False
        },
        headers={"Authorization": f"Bearer {initial_access_token}"}
    )
    assert create_response.status_code == 201
    task = create_response.json()
    task_id = task["id"]

    # Refresh the token
    refresh_response = client.post(
        "/api/auth/refresh",
        json={"refresh_token": refresh_token}
    )
    assert refresh_response.status_code == 200
    new_tokens = refresh_response.json()
    new_access_token = new_tokens["access_token"]
    new_refresh_token = new_tokens["refresh_token"]

    # Use new token to update the task
    update_response = client.put(
        f"/api/users/temp_user_id/tasks/{task_id}",
        json={"title": "Task updated with new token"},
        headers={"Authorization": f"Bearer {new_access_token}"}
    )
    assert update_response.status_code == 200
    updated_task = update_response.json()
    assert updated_task["title"] == "Task updated with new token"

    # Clean up: delete the task
    delete_response = client.delete(
        f"/api/users/temp_user_id/tasks/{task_id}",
        headers={"Authorization": f"Bearer {new_access_token}"}
    )
    assert delete_response.status_code == 204