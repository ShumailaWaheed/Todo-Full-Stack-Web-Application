# backend/tests/conftest.py
"""
Test configuration and fixtures for the Todo API test suite.
Uses SQLite in-memory database for test isolation.
"""
import pytest
import uuid
import os
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine
from sqlalchemy.pool import StaticPool

# Set test environment before importing app
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["BETTER_AUTH_SECRET"] = "test-secret-key-for-testing-only"

from src.main import app
from src.database.session import get_session_dep
from src.models.user import User
from src.models.task import Task


# Create in-memory SQLite engine for tests
test_engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


def get_test_session():
    """Provide a test database session."""
    with Session(test_engine) as session:
        yield session


@pytest.fixture(autouse=True)
def setup_database():
    """Create tables before each test and drop after."""
    SQLModel.metadata.create_all(test_engine)
    yield
    SQLModel.metadata.drop_all(test_engine)


@pytest.fixture
def client():
    """Provide a test client with overridden database dependency."""
    app.dependency_overrides[get_session_dep] = get_test_session
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers(client):
    """Login and return auth headers with a test user."""
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    response = client.post(
        "/auth/login",
        json={"email": email, "password": "testpassword123"}
    )
    tokens = response.json()
    return {"Authorization": f"Bearer {tokens['access_token']}"}


@pytest.fixture
def user_with_headers(client):
    """Login and return both user_id and auth headers."""
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    response = client.post(
        "/auth/login",
        json={"email": email, "password": "testpassword123"}
    )
    tokens = response.json()
    # Decode user_id from the token
    from src.middleware.auth import verify_token
    payload = verify_token(tokens["access_token"])
    user_id = payload.get("sub", "unknown")
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}
    return user_id, headers


@pytest.fixture
def two_users_with_headers(client):
    """Create two separate users and return their IDs and headers."""
    from src.middleware.auth import verify_token

    # User 1
    email1 = f"user1_{uuid.uuid4().hex[:8]}@example.com"
    resp1 = client.post("/auth/login", json={"email": email1, "password": "pass1"})
    tokens1 = resp1.json()
    payload1 = verify_token(tokens1["access_token"])
    user1_id = payload1.get("sub", "unknown")
    headers1 = {"Authorization": f"Bearer {tokens1['access_token']}"}

    # User 2
    email2 = f"user2_{uuid.uuid4().hex[:8]}@example.com"
    resp2 = client.post("/auth/login", json={"email": email2, "password": "pass2"})
    tokens2 = resp2.json()
    payload2 = verify_token(tokens2["access_token"])
    user2_id = payload2.get("sub", "unknown")
    headers2 = {"Authorization": f"Bearer {tokens2['access_token']}"}

    return (user1_id, headers1), (user2_id, headers2)
