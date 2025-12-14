# backend/tests/test_auth.py
import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)


def test_login_success():
    """Test successful login creates a user and returns tokens."""
    response = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "password123"}
    )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


def test_refresh_token():
    """Test token refresh functionality."""
    # First, get tokens through login
    login_response = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "password123"}
    )

    assert login_response.status_code == 200
    refresh_token = login_response.json()["refresh_token"]

    # Now test refresh
    response = client.post(
        "/api/auth/refresh",
        json={"refresh_token": refresh_token}
    )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"