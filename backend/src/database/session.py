from sqlmodel import create_engine
from typing import Generator
import os
from contextlib import contextmanager
from sqlalchemy import event
from sqlalchemy.pool import StaticPool

# Get database URL from environment, with the Neon PostgreSQL URL from .env as default
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./todo.db")

# Create the engine dynamically based on the database type
if DATABASE_URL.startswith("sqlite"):
    # For SQLite, use different parameters
    engine = create_engine(
        DATABASE_URL,
        echo=True,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
else:
    # For PostgreSQL, use different parameters
    engine = create_engine(DATABASE_URL, echo=True)

@contextmanager
def get_session() -> Generator:
    """
    Context manager for database sessions.
    Ensures the session is properly closed after use.
    """
    from sqlmodel import Session
    session = Session(engine)
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

def get_session_dep():
    """
    Dependency function for FastAPI to get database session.
    """
    with get_session() as session:
        yield session