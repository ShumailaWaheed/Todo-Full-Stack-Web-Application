# backend/tests/test_integration.py
"""
Integration and security tests covering:
- T108: Final integration testing of all user stories together
- T109: Security review of authentication and user isolation
- T110: Database query optimization verification
"""
import pytest
import uuid
import time


class TestFullIntegration:
    """T108: End-to-end integration test across all user stories."""

    def test_complete_user_journey(self, client):
        """Full user journey: register -> create tasks -> toggle -> analytics -> delete."""
        # Step 1: Login/Register
        email = f"journey_{uuid.uuid4().hex[:8]}@example.com"
        login_resp = client.post("/auth/login", json={"email": email, "password": "pass123"})
        assert login_resp.status_code == 200
        tokens = login_resp.json()
        headers = {"Authorization": f"Bearer {tokens['access_token']}"}

        from src.middleware.auth import verify_token
        payload = verify_token(tokens["access_token"])
        user_id = payload.get("sub")

        # Step 2: Create tasks
        task1_resp = client.post(
            f"/api/{user_id}/tasks/",
            json={"title": "Task 1", "priority": "high"},
            headers=headers
        )
        assert task1_resp.status_code == 201
        task1_id = task1_resp.json()["id"]

        task2_resp = client.post(
            f"/api/{user_id}/tasks/",
            json={"title": "Task 2", "priority": "low"},
            headers=headers
        )
        assert task2_resp.status_code == 201
        task2_id = task2_resp.json()["id"]

        # Step 3: List tasks
        list_resp = client.get(f"/api/{user_id}/tasks/", headers=headers)
        assert list_resp.status_code == 200
        assert len(list_resp.json()["tasks"]) == 2

        # Step 4: Toggle completion
        toggle_resp = client.patch(
            f"/api/{user_id}/tasks/{task1_id}/complete",
            json={"completed": True},
            headers=headers
        )
        assert toggle_resp.status_code == 200
        assert toggle_resp.json()["completed"] is True

        # Step 5: Check analytics
        analytics_resp = client.get(f"/api/{user_id}/tasks/analytics/summary", headers=headers)
        assert analytics_resp.status_code == 200
        data = analytics_resp.json()
        assert data["total_tasks"] == 2
        assert data["completed_tasks"] == 1
        assert data["pending_tasks"] == 1

        # Step 6: Update task
        update_resp = client.put(
            f"/api/{user_id}/tasks/{task2_id}",
            json={"title": "Updated Task 2", "priority": "high"},
            headers=headers
        )
        assert update_resp.status_code == 200
        assert update_resp.json()["title"] == "Updated Task 2"

        # Step 7: Delete task
        delete_resp = client.delete(f"/api/{user_id}/tasks/{task1_id}", headers=headers)
        assert delete_resp.status_code == 204

        # Verify deletion
        final_list = client.get(f"/api/{user_id}/tasks/", headers=headers)
        assert len(final_list.json()["tasks"]) == 1

    def test_project_task_integration(self, client):
        """Full project-task integration flow."""
        email = f"proj_{uuid.uuid4().hex[:8]}@example.com"
        login_resp = client.post("/auth/login", json={"email": email, "password": "pass123"})
        tokens = login_resp.json()
        headers = {"Authorization": f"Bearer {tokens['access_token']}"}

        from src.middleware.auth import verify_token
        payload = verify_token(tokens["access_token"])
        user_id = payload.get("sub")

        # Create project
        project_resp = client.post(
            f"/api/{user_id}/projects",
            json={"name": "Integration Project", "slug": "int-proj"},
            headers=headers
        )
        assert project_resp.status_code == 200
        project_id = project_resp.json()["id"]

        # Create task linked to project
        task_resp = client.post(
            f"/api/{user_id}/tasks/",
            json={"title": "Linked Task", "project_id": project_id},
            headers=headers
        )
        assert task_resp.status_code == 201
        assert task_resp.json()["project_id"] == project_id


class TestSecurityReview:
    """T109: Security review of authentication and user isolation."""

    def test_no_auth_header_rejected(self, client):
        """Requests without Authorization header must be rejected."""
        response = client.get("/api/any-user/tasks/")
        assert response.status_code in [401, 403]

    def test_malformed_token_rejected(self, client):
        """Malformed JWT tokens must be rejected."""
        headers = {"Authorization": "Bearer not.a.valid.jwt.token"}
        response = client.get("/api/any-user/tasks/", headers=headers)
        assert response.status_code in [401, 403]

    def test_empty_bearer_rejected(self, client):
        """Empty Bearer token must be rejected."""
        headers = {"Authorization": "Bearer "}
        response = client.get("/api/any-user/tasks/", headers=headers)
        assert response.status_code in [401, 403]

    def test_cross_user_task_access_blocked(self, client, two_users_with_headers):
        """Cross-user task access must return 404 (not 403 to prevent enumeration)."""
        (user1_id, headers1), (user2_id, headers2) = two_users_with_headers

        # User 1 creates a task
        resp = client.post(
            f"/api/{user1_id}/tasks/",
            json={"title": "Secret"},
            headers=headers1
        )
        task_id = resp.json()["id"]

        # User 2 tries every operation on user 1's task
        assert client.get(f"/api/{user2_id}/tasks/{task_id}", headers=headers2).status_code == 404
        assert client.put(f"/api/{user2_id}/tasks/{task_id}", json={"title": "X"}, headers=headers2).status_code == 404
        assert client.delete(f"/api/{user2_id}/tasks/{task_id}", headers=headers2).status_code == 404
        assert client.patch(f"/api/{user2_id}/tasks/{task_id}/complete", json={"completed": True}, headers=headers2).status_code == 404

    def test_cross_user_project_access_blocked(self, client, two_users_with_headers):
        """Cross-user project access must be blocked."""
        (user1_id, headers1), (user2_id, headers2) = two_users_with_headers

        resp = client.post(
            f"/api/{user1_id}/projects",
            json={"name": "Private", "slug": "private"},
            headers=headers1
        )
        project_id = resp.json()["id"]

        # User 2 tries to access user 1's project
        get_resp = client.get(f"/api/{user2_id}/projects/{project_id}", headers=headers2)
        assert get_resp.status_code == 404


class TestDatabasePerformance:
    """T110: Database query optimization verification."""

    def test_task_listing_performance_with_multiple_tasks(self, client, user_with_headers):
        """Task listing should be fast even with many tasks."""
        user_id, headers = user_with_headers

        # Create 20 tasks
        for i in range(20):
            client.post(
                f"/api/{user_id}/tasks/",
                json={"title": f"Performance Task {i}", "priority": ["low", "medium", "high"][i % 3]},
                headers=headers
            )

        # Measure list query time
        start = time.time()
        response = client.get(f"/api/{user_id}/tasks/", headers=headers)
        elapsed = time.time() - start

        assert response.status_code == 200
        assert len(response.json()["tasks"]) == 20
        assert elapsed < 2.0, f"Task listing took {elapsed:.2f}s"

    def test_analytics_performance_with_tasks(self, client, user_with_headers):
        """Analytics queries should be fast with task data."""
        user_id, headers = user_with_headers

        # Create some tasks
        for i in range(10):
            resp = client.post(
                f"/api/{user_id}/tasks/",
                json={"title": f"Analytics Task {i}"},
                headers=headers
            )
            if i % 2 == 0:
                task_id = resp.json()["id"]
                client.patch(
                    f"/api/{user_id}/tasks/{task_id}/complete",
                    json={"completed": True},
                    headers=headers
                )

        # Measure analytics query time
        start = time.time()
        response = client.get(f"/api/{user_id}/tasks/analytics/summary", headers=headers)
        elapsed = time.time() - start

        assert response.status_code == 200
        assert elapsed < 2.0, f"Analytics query took {elapsed:.2f}s"
