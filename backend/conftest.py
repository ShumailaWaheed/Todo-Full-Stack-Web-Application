# backend/conftest.py
import pytest
from fastapi.testclient import TestClient
from src.main import app
from src.database.session import engine, get_session_dep
from sqlmodel import SQLModel
from src.models.user import User
from src.models.task import Task
from unittest.mock import AsyncMock


@pytest.fixture(scope="function")
def client():
    """Create a test client for the API."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(scope="function")
def setup_database():
    """Set up the test database."""
    # Create all tables
    SQLModel.metadata.create_all(bind=engine)

    yield

    # Clean up - drop all tables
    SQLModel.metadata.drop_all(bind=engine)