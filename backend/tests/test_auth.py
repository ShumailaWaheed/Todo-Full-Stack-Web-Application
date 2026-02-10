# backend/tests/test_auth.py
"""
Authentication tests covering:
- T036: User registration flow with valid email and password
- T037: User login flow and JWT token reception
- T038: Token expiration and refresh flow
"""
import pytest
import uuid


# --- T036: Registration Flow ---

class TestRegistration:
    """Tests for user registration (T036)."""

    def test_login_creates_new_user(self, client):
        """New email should create a user and return tokens."""
        email = f"newuser_{uuid.uuid4().hex[:8]}@example.com"
        response = client.post(
            "/auth/login",
            json={"email": email, "password": "securepassword123"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    def test_check_email_nonexistent(self, client):
        """Check-email should return exists=false for new email."""
        email = f"nonexist_{uuid.uuid4().hex[:8]}@example.com"
        response = client.post(
            "/auth/check-email",
            json={"email": email}
        )
        assert response.status_code == 200
        assert response.json()["exists"] is False

    def test_check_email_after_registration(self, client):
        """Check-email should return exists=true after user registration."""
        email = f"registered_{uuid.uuid4().hex[:8]}@example.com"
        # Register by logging in
        client.post("/auth/login", json={"email": email, "password": "pass123"})
        # Check email exists
        response = client.post("/auth/check-email", json={"email": email})
        assert response.status_code == 200
        assert response.json()["exists"] is True


# --- T037: Login Flow and JWT Token ---

class TestLogin:
    """Tests for user login and JWT token reception (T037)."""

    def test_login_returns_valid_tokens(self, client):
        """Login should return access_token, refresh_token, and token_type."""
        email = f"login_{uuid.uuid4().hex[:8]}@example.com"
        response = client.post(
            "/auth/login",
            json={"email": email, "password": "password123"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert len(data["access_token"]) > 0
        assert len(data["refresh_token"]) > 0

    def test_login_same_user_returns_tokens(self, client):
        """Login with same email should return valid tokens."""
        email = f"sameuser_{uuid.uuid4().hex[:8]}@example.com"
        # First login (creates user)
        resp1 = client.post("/auth/login", json={"email": email, "password": "pass123"})
        assert resp1.status_code == 200
        # Second login (existing user)
        resp2 = client.post("/auth/login", json={"email": email, "password": "pass123"})
        assert resp2.status_code == 200
        assert "access_token" in resp2.json()

    def test_access_token_authenticates_requests(self, client, user_with_headers):
        """Access token should authenticate API requests."""
        user_id, headers = user_with_headers
        response = client.get(f"/api/{user_id}/tasks/", headers=headers)
        assert response.status_code == 200

    def test_missing_token_returns_401(self, client):
        """Request without token should return 401 or 403."""
        response = client.get("/api/some-user/tasks/")
        assert response.status_code in [401, 403]

    def test_invalid_token_returns_401(self, client):
        """Request with invalid token should return 401 or 403."""
        headers = {"Authorization": "Bearer invalid_token_here"}
        response = client.get("/api/some-user/tasks/", headers=headers)
        assert response.status_code in [401, 403]


# --- T038: Token Refresh Flow ---

class TestTokenRefresh:
    """Tests for token expiration and refresh flow (T038)."""

    def test_refresh_token_returns_new_tokens(self, client):
        """Refresh token should return new access and refresh tokens."""
        email = f"refresh_{uuid.uuid4().hex[:8]}@example.com"
        login_resp = client.post(
            "/auth/login",
            json={"email": email, "password": "pass123"}
        )
        assert login_resp.status_code == 200
        refresh_token = login_resp.json()["refresh_token"]

        refresh_resp = client.post(
            "/auth/refresh",
            json={"refresh_token": refresh_token}
        )
        assert refresh_resp.status_code == 200
        data = refresh_resp.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    def test_refreshed_token_works_for_requests(self, client):
        """New access token from refresh should authenticate requests."""
        email = f"refreshwork_{uuid.uuid4().hex[:8]}@example.com"
        login_resp = client.post(
            "/auth/login", json={"email": email, "password": "pass123"}
        )
        refresh_token = login_resp.json()["refresh_token"]

        refresh_resp = client.post(
            "/auth/refresh", json={"refresh_token": refresh_token}
        )
        new_token = refresh_resp.json()["access_token"]

        from src.middleware.auth import verify_token
        payload = verify_token(new_token)
        user_id = payload.get("sub", "unknown")

        headers = {"Authorization": f"Bearer {new_token}"}
        response = client.get(f"/api/{user_id}/tasks/", headers=headers)
        assert response.status_code == 200

    def test_invalid_refresh_token_fails(self, client):
        """Invalid refresh token should return error."""
        response = client.post(
            "/auth/refresh",
            json={"refresh_token": "invalid_refresh_token"}
        )
        assert response.status_code in [400, 401, 403, 422]
