# backend/tests/test_tasks.py
"""
Task management tests covering:
- T052: Task creation with authenticated user
- T053: Task listing showing only user's own tasks
- T054: Task updating with proper user isolation
- T055: Task deletion with proper user isolation
- T056: Users cannot access other users' tasks
- T063: Completion toggle incomplete -> complete
- T064: Completion toggle complete -> incomplete
- T065: Completion status persistence in database
- T066: Completion toggle with proper user isolation
"""
import pytest
import uuid


# --- T052: Task Creation ---

class TestTaskCreation:
    """Tests for task creation (T052)."""

    def test_create_task_with_all_fields(self, client, user_with_headers):
        """Create a task with all fields populated."""
        user_id, headers = user_with_headers
        response = client.post(
            f"/api/{user_id}/tasks/",
            json={
                "title": "Test Task",
                "description": "A test task description",
                "priority": "high",
                "due_date": "2026-12-31T00:00:00"
            },
            headers=headers
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Test Task"
        assert data["description"] == "A test task description"
        assert data["priority"] == "high"
        assert data["completed"] is False
        assert data["user_id"] == user_id

    def test_create_task_with_minimal_fields(self, client, user_with_headers):
        """Create a task with only required title."""
        user_id, headers = user_with_headers
        response = client.post(
            f"/api/{user_id}/tasks/",
            json={"title": "Minimal Task"},
            headers=headers
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Minimal Task"
        assert data["priority"] == "medium"  # default

    def test_create_task_title_max_200_chars(self, client, user_with_headers):
        """Task title should accept up to 200 characters."""
        user_id, headers = user_with_headers
        long_title = "A" * 200
        response = client.post(
            f"/api/{user_id}/tasks/",
            json={"title": long_title},
            headers=headers
        )
        assert response.status_code == 201
        assert response.json()["title"] == long_title

    def test_create_task_without_auth_fails(self, client):
        """Creating a task without authentication should fail."""
        response = client.post(
            "/api/fake-user/tasks/",
            json={"title": "Unauthorized Task"}
        )
        assert response.status_code in [401, 403]


# --- T053: Task Listing ---

class TestTaskListing:
    """Tests for task listing showing only user's own tasks (T053)."""

    def test_list_tasks_returns_own_tasks(self, client, user_with_headers):
        """List endpoint should return only the user's own tasks."""
        user_id, headers = user_with_headers
        # Create two tasks
        client.post(f"/api/{user_id}/tasks/", json={"title": "Task 1"}, headers=headers)
        client.post(f"/api/{user_id}/tasks/", json={"title": "Task 2"}, headers=headers)

        response = client.get(f"/api/{user_id}/tasks/", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["tasks"]) == 2
        for task in data["tasks"]:
            assert task["user_id"] == user_id

    def test_list_tasks_empty_for_new_user(self, client, user_with_headers):
        """New user should have zero tasks."""
        user_id, headers = user_with_headers
        response = client.get(f"/api/{user_id}/tasks/", headers=headers)
        assert response.status_code == 200
        assert len(response.json()["tasks"]) == 0

    def test_list_tasks_does_not_include_other_users_tasks(self, client, two_users_with_headers):
        """User should not see tasks created by other users."""
        (user1_id, headers1), (user2_id, headers2) = two_users_with_headers

        # User 1 creates a task
        client.post(f"/api/{user1_id}/tasks/", json={"title": "User1 Task"}, headers=headers1)

        # User 2 should see zero tasks
        response = client.get(f"/api/{user2_id}/tasks/", headers=headers2)
        assert response.status_code == 200
        assert len(response.json()["tasks"]) == 0


# --- T054: Task Updating ---

class TestTaskUpdating:
    """Tests for task updating with proper user isolation (T054)."""

    def test_update_task_title(self, client, user_with_headers):
        """User should be able to update task title."""
        user_id, headers = user_with_headers
        create_resp = client.post(
            f"/api/{user_id}/tasks/",
            json={"title": "Original Title"},
            headers=headers
        )
        task_id = create_resp.json()["id"]

        update_resp = client.put(
            f"/api/{user_id}/tasks/{task_id}",
            json={"title": "Updated Title"},
            headers=headers
        )
        assert update_resp.status_code == 200
        assert update_resp.json()["title"] == "Updated Title"

    def test_update_task_description_and_priority(self, client, user_with_headers):
        """User should be able to update description and priority."""
        user_id, headers = user_with_headers
        create_resp = client.post(
            f"/api/{user_id}/tasks/",
            json={"title": "Task", "description": "Old", "priority": "low"},
            headers=headers
        )
        task_id = create_resp.json()["id"]

        update_resp = client.put(
            f"/api/{user_id}/tasks/{task_id}",
            json={"description": "New description", "priority": "high"},
            headers=headers
        )
        assert update_resp.status_code == 200
        data = update_resp.json()
        assert data["description"] == "New description"
        assert data["priority"] == "high"

    def test_cannot_update_other_users_task(self, client, two_users_with_headers):
        """User should not be able to update another user's task."""
        (user1_id, headers1), (user2_id, headers2) = two_users_with_headers

        # User 1 creates a task
        create_resp = client.post(
            f"/api/{user1_id}/tasks/",
            json={"title": "User1 Task"},
            headers=headers1
        )
        task_id = create_resp.json()["id"]

        # User 2 tries to update it
        update_resp = client.put(
            f"/api/{user2_id}/tasks/{task_id}",
            json={"title": "Hacked!"},
            headers=headers2
        )
        assert update_resp.status_code == 404


# --- T055: Task Deletion ---

class TestTaskDeletion:
    """Tests for task deletion with proper user isolation (T055)."""

    def test_delete_own_task(self, client, user_with_headers):
        """User should be able to delete their own task."""
        user_id, headers = user_with_headers
        create_resp = client.post(
            f"/api/{user_id}/tasks/",
            json={"title": "To Delete"},
            headers=headers
        )
        task_id = create_resp.json()["id"]

        delete_resp = client.delete(f"/api/{user_id}/tasks/{task_id}", headers=headers)
        assert delete_resp.status_code == 204

        # Verify task is gone
        get_resp = client.get(f"/api/{user_id}/tasks/{task_id}", headers=headers)
        assert get_resp.status_code == 404

    def test_cannot_delete_other_users_task(self, client, two_users_with_headers):
        """User should not be able to delete another user's task."""
        (user1_id, headers1), (user2_id, headers2) = two_users_with_headers

        create_resp = client.post(
            f"/api/{user1_id}/tasks/",
            json={"title": "User1 Protected Task"},
            headers=headers1
        )
        task_id = create_resp.json()["id"]

        # User 2 tries to delete
        delete_resp = client.delete(f"/api/{user2_id}/tasks/{task_id}", headers=headers2)
        assert delete_resp.status_code == 404

        # Verify task still exists for user 1
        get_resp = client.get(f"/api/{user1_id}/tasks/{task_id}", headers=headers1)
        assert get_resp.status_code == 200


# --- T056: User Isolation ---

class TestUserIsolation:
    """Tests that users cannot access other users' tasks (T056)."""

    def test_cannot_read_other_users_task(self, client, two_users_with_headers):
        """User should get 404 when accessing another user's task."""
        (user1_id, headers1), (user2_id, headers2) = two_users_with_headers

        create_resp = client.post(
            f"/api/{user1_id}/tasks/",
            json={"title": "Private Task"},
            headers=headers1
        )
        task_id = create_resp.json()["id"]

        get_resp = client.get(f"/api/{user2_id}/tasks/{task_id}", headers=headers2)
        assert get_resp.status_code == 404

    def test_cannot_toggle_other_users_task(self, client, two_users_with_headers):
        """User should not be able to toggle another user's task completion."""
        (user1_id, headers1), (user2_id, headers2) = two_users_with_headers

        create_resp = client.post(
            f"/api/{user1_id}/tasks/",
            json={"title": "Private Task"},
            headers=headers1
        )
        task_id = create_resp.json()["id"]

        toggle_resp = client.patch(
            f"/api/{user2_id}/tasks/{task_id}/complete",
            json={"completed": True},
            headers=headers2
        )
        assert toggle_resp.status_code == 404


# --- T063-T066: Completion Toggle ---

class TestCompletionToggle:
    """Tests for task completion toggle (T063-T066)."""

    def test_toggle_incomplete_to_complete(self, client, user_with_headers):
        """T063: Toggle task from incomplete to complete."""
        user_id, headers = user_with_headers
        create_resp = client.post(
            f"/api/{user_id}/tasks/",
            json={"title": "Toggle Test"},
            headers=headers
        )
        task_id = create_resp.json()["id"]
        assert create_resp.json()["completed"] is False

        toggle_resp = client.patch(
            f"/api/{user_id}/tasks/{task_id}/complete",
            json={"completed": True},
            headers=headers
        )
        assert toggle_resp.status_code == 200
        assert toggle_resp.json()["completed"] is True

    def test_toggle_complete_to_incomplete(self, client, user_with_headers):
        """T064: Toggle task from complete back to incomplete."""
        user_id, headers = user_with_headers
        create_resp = client.post(
            f"/api/{user_id}/tasks/",
            json={"title": "Toggle Back Test"},
            headers=headers
        )
        task_id = create_resp.json()["id"]

        # Complete it
        client.patch(
            f"/api/{user_id}/tasks/{task_id}/complete",
            json={"completed": True},
            headers=headers
        )
        # Un-complete it
        toggle_resp = client.patch(
            f"/api/{user_id}/tasks/{task_id}/complete",
            json={"completed": False},
            headers=headers
        )
        assert toggle_resp.status_code == 200
        assert toggle_resp.json()["completed"] is False

    def test_completion_status_persists(self, client, user_with_headers):
        """T065: Completion status should persist when retrieved later."""
        user_id, headers = user_with_headers
        create_resp = client.post(
            f"/api/{user_id}/tasks/",
            json={"title": "Persistence Test"},
            headers=headers
        )
        task_id = create_resp.json()["id"]

        # Toggle to complete
        client.patch(
            f"/api/{user_id}/tasks/{task_id}/complete",
            json={"completed": True},
            headers=headers
        )

        # Retrieve and verify persistence
        get_resp = client.get(f"/api/{user_id}/tasks/{task_id}", headers=headers)
        assert get_resp.status_code == 200
        assert get_resp.json()["completed"] is True

    def test_cannot_toggle_other_users_task_completion(self, client, two_users_with_headers):
        """T066: User should not be able to toggle another user's task."""
        (user1_id, headers1), (user2_id, headers2) = two_users_with_headers

        create_resp = client.post(
            f"/api/{user1_id}/tasks/",
            json={"title": "Isolated Toggle"},
            headers=headers1
        )
        task_id = create_resp.json()["id"]

        toggle_resp = client.patch(
            f"/api/{user2_id}/tasks/{task_id}/complete",
            json={"completed": True},
            headers=headers2
        )
        assert toggle_resp.status_code == 404

        # Verify original task unchanged
        get_resp = client.get(f"/api/{user1_id}/tasks/{task_id}", headers=headers1)
        assert get_resp.json()["completed"] is False
