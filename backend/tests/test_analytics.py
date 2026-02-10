# backend/tests/test_analytics.py
"""
Analytics and dashboard tests covering:
- T088: Dashboard loads correctly (API response time)
- T089: Dashboard sections display correct data
- T090: Responsive design (API returns valid data for all screen sizes)
- T091: Analytics data accuracy
"""
import pytest
import uuid
import time


class TestAnalyticsEndpoints:
    """Tests for analytics API endpoints (T088-T091)."""

    def test_analytics_summary_returns_correct_structure(self, client, user_with_headers):
        """T089: Analytics summary should return all required fields."""
        user_id, headers = user_with_headers
        response = client.get(f"/api/{user_id}/tasks/analytics/summary", headers=headers)
        assert response.status_code == 200
        data = response.json()
        required_fields = [
            "total_tasks", "completed_tasks", "pending_tasks", "overdue_tasks",
            "completion_rate", "tasks_completed_this_week", "tasks_created_this_week",
            "high_priority_pending", "medium_priority_pending", "low_priority_pending"
        ]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"

    def test_analytics_summary_empty_user(self, client, user_with_headers):
        """T089: New user with no tasks should get zero values."""
        user_id, headers = user_with_headers
        response = client.get(f"/api/{user_id}/tasks/analytics/summary", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total_tasks"] == 0
        assert data["completed_tasks"] == 0
        assert data["pending_tasks"] == 0
        assert data["completion_rate"] == 0.0

    def test_analytics_summary_accuracy(self, client, user_with_headers):
        """T091: Analytics data should accurately reflect task states."""
        user_id, headers = user_with_headers

        # Create 3 tasks: 2 pending, 1 completed
        client.post(f"/api/{user_id}/tasks/", json={"title": "Task 1", "priority": "high"}, headers=headers)
        resp2 = client.post(f"/api/{user_id}/tasks/", json={"title": "Task 2", "priority": "medium"}, headers=headers)
        client.post(f"/api/{user_id}/tasks/", json={"title": "Task 3", "priority": "low"}, headers=headers)

        # Complete task 2
        task2_id = resp2.json()["id"]
        client.patch(f"/api/{user_id}/tasks/{task2_id}/complete", json={"completed": True}, headers=headers)

        # Verify analytics
        response = client.get(f"/api/{user_id}/tasks/analytics/summary", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total_tasks"] == 3
        assert data["completed_tasks"] == 1
        assert data["pending_tasks"] == 2
        assert data["high_priority_pending"] == 1
        assert data["low_priority_pending"] == 1

    def test_completion_trends_returns_data(self, client, user_with_headers):
        """T089: Completion trends endpoint should return valid response."""
        user_id, headers = user_with_headers
        response = client.get(
            f"/api/{user_id}/tasks/analytics/completion-trends?weeks=4",
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "trends" in data
        assert isinstance(data["trends"], list)

    def test_weekly_activity_returns_data(self, client, user_with_headers):
        """T089: Weekly activity endpoint should return valid response."""
        user_id, headers = user_with_headers
        response = client.get(
            f"/api/{user_id}/tasks/analytics/weekly-activity?weeks=4",
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "activity" in data
        assert isinstance(data["activity"], list)

    def test_dashboard_api_response_time(self, client, user_with_headers):
        """T088: Dashboard API endpoints should respond within 2 seconds."""
        user_id, headers = user_with_headers

        endpoints = [
            f"/api/{user_id}/tasks/",
            f"/api/{user_id}/tasks/analytics/summary",
            f"/api/{user_id}/tasks/analytics/completion-trends?weeks=8",
            f"/api/{user_id}/tasks/analytics/weekly-activity?weeks=8",
        ]

        for endpoint in endpoints:
            start = time.time()
            response = client.get(endpoint, headers=headers)
            elapsed = time.time() - start
            assert response.status_code == 200, f"Failed: {endpoint}"
            assert elapsed < 2.0, f"Endpoint {endpoint} took {elapsed:.2f}s (>2s)"

    def test_analytics_not_accessible_without_auth(self, client):
        """Analytics endpoints should require authentication."""
        endpoints = [
            "/api/fake-user/tasks/analytics/summary",
            "/api/fake-user/tasks/analytics/completion-trends",
            "/api/fake-user/tasks/analytics/weekly-activity",
        ]
        for endpoint in endpoints:
            response = client.get(endpoint)
            assert response.status_code in [401, 403], f"Endpoint {endpoint} should require auth"
