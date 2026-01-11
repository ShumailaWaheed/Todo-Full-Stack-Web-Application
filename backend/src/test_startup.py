from sqlmodel import SQLModel
from database.session import engine
from models.user import User
from models.task import Task
from models.project import Project

print("Creating database tables...")
try:
    SQLModel.metadata.create_all(bind=engine)
    print("Database tables created successfully!")
except Exception as e:
    print(f"Error creating tables: {e}")

# Test importing main to check for syntax errors
try:
    from main import app
    print("Main application imported successfully!")
except Exception as e:
    print(f"Error importing main: {e}")
    import traceback
    traceback.print_exc()