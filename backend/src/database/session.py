from sqlmodel import create_engine
from typing import Generator
import os
from contextlib import contextmanager

# Get database URL from environment, with a default for development
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://todo_user:todo_password@localhost:5432/todo_db")

# Create the engine
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