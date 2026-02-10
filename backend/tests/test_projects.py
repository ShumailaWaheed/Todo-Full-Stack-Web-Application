# backend/tests/test_projects.py
"""
Project tests covering:
- T098: Project creation and association
- T099: Task-project relationship
"""
import pytest
import uuid


class TestProjectCreation:
    """Tests for project creation and CRUD (T098)."""

    def test_create_project(self, client, user_with_headers):
        """Create a project with valid data."""
        user_id, headers = user_with_headers
        response = client.post(
            f"/api/{user_id}/projects",
            json={
                "name": "Test Project",
                "slug": "test-project",
                "description": "A test project"
            },
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Test Project"
        assert data["slug"] == "test-project"
        assert data["user_id"] == user_id

    def test_list_projects(self, client, user_with_headers):
        """List projects should return only user's projects."""
        user_id, headers = user_with_headers
        # Create two projects
        client.post(f"/api/{user_id}/projects", json={"name": "P1", "slug": "p1"}, headers=headers)
        client.post(f"/api/{user_id}/projects", json={"name": "P2", "slug": "p2"}, headers=headers)

        response = client.get(f"/api/{user_id}/projects", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2

    def test_get_project_by_id(self, client, user_with_headers):
        """Get a specific project by ID."""
        user_id, headers = user_with_headers
        create_resp = client.post(
            f"/api/{user_id}/projects",
            json={"name": "Specific Project", "slug": "specific"},
            headers=headers
        )
        project_id = create_resp.json()["id"]

        get_resp = client.get(f"/api/{user_id}/projects/{project_id}", headers=headers)
        assert get_resp.status_code == 200
        assert get_resp.json()["name"] == "Specific Project"

    def test_update_project(self, client, user_with_headers):
        """Update project details."""
        user_id, headers = user_with_headers
        create_resp = client.post(
            f"/api/{user_id}/projects",
            json={"name": "Old Name", "slug": "old-name"},
            headers=headers
        )
        project_id = create_resp.json()["id"]

        update_resp = client.put(
            f"/api/{user_id}/projects/{project_id}",
            json={"name": "New Name"},
            headers=headers
        )
        assert update_resp.status_code == 200
        assert update_resp.json()["name"] == "New Name"

    def test_delete_project(self, client, user_with_headers):
        """Delete a project."""
        user_id, headers = user_with_headers
        create_resp = client.post(
            f"/api/{user_id}/projects",
            json={"name": "To Delete", "slug": "to-delete"},
            headers=headers
        )
        project_id = create_resp.json()["id"]

        delete_resp = client.delete(f"/api/{user_id}/projects/{project_id}", headers=headers)
        assert delete_resp.status_code in [200, 204]

    def test_toggle_project_completion(self, client, user_with_headers):
        """Toggle project completion status."""
        user_id, headers = user_with_headers
        create_resp = client.post(
            f"/api/{user_id}/projects",
            json={"name": "Toggle Project", "slug": "toggle"},
            headers=headers
        )
        project_id = create_resp.json()["id"]

        toggle_resp = client.patch(
            f"/api/{user_id}/projects/{project_id}/complete",
            json={"completed": True},
            headers=headers
        )
        assert toggle_resp.status_code == 200
        assert toggle_resp.json()["completed"] is True

    def test_project_user_isolation(self, client, two_users_with_headers):
        """Users should not see other users' projects."""
        (user1_id, headers1), (user2_id, headers2) = two_users_with_headers

        # User 1 creates a project
        client.post(f"/api/{user1_id}/projects", json={"name": "User1 Project", "slug": "u1p"}, headers=headers1)

        # User 2 should see zero projects
        response = client.get(f"/api/{user2_id}/projects", headers=headers2)
        assert response.status_code == 200
        assert len(response.json()) == 0


class TestTaskProjectRelationship:
    """Tests for task-project association (T099)."""

    def test_create_task_with_project_id(self, client, user_with_headers):
        """Create a task associated with a project."""
        user_id, headers = user_with_headers

        # Create a project first
        project_resp = client.post(
            f"/api/{user_id}/projects",
            json={"name": "Dev Project", "slug": "dev"},
            headers=headers
        )
        project_id = project_resp.json()["id"]

        # Create a task with project_id
        task_resp = client.post(
            f"/api/{user_id}/tasks/",
            json={"title": "Project Task", "project_id": project_id},
            headers=headers
        )
        assert task_resp.status_code == 201
        assert task_resp.json()["project_id"] == project_id

    def test_create_task_without_project_id(self, client, user_with_headers):
        """Create a task without a project association."""
        user_id, headers = user_with_headers
        task_resp = client.post(
            f"/api/{user_id}/tasks/",
            json={"title": "No Project Task"},
            headers=headers
        )
        assert task_resp.status_code == 201
        assert task_resp.json()["project_id"] is None

    def test_update_task_project_id(self, client, user_with_headers):
        """Update a task's project association."""
        user_id, headers = user_with_headers

        # Create project
        project_resp = client.post(
            f"/api/{user_id}/projects",
            json={"name": "New Project", "slug": "new"},
            headers=headers
        )
        project_id = project_resp.json()["id"]

        # Create task without project
        task_resp = client.post(
            f"/api/{user_id}/tasks/",
            json={"title": "Orphan Task"},
            headers=headers
        )
        task_id = task_resp.json()["id"]

        # Update task to associate with project
        update_resp = client.put(
            f"/api/{user_id}/tasks/{task_id}",
            json={"project_id": project_id},
            headers=headers
        )
        assert update_resp.status_code == 200
        assert update_resp.json()["project_id"] == project_id
