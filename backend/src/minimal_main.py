from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import users, chat

app = FastAPI(
    title="Todo API",
    description="API for managing todos with user authentication",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:8083",
        "http://127.0.0.1:8083",
        "https://*.hf.space",  # Allow Hugging Face Spaces
        "https://*.huggingface.app"  # Alternative Hugging Face domain
    ],  # Allow frontend origins including Hugging Face
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Todo API is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Minimal auth endpoints to satisfy the frontend login
@app.post("/auth/login")
def login():
    # Return mock token for testing
    return {
        "access_token": "mock_access_token",
        "refresh_token": "mock_refresh_token",
        "token_type": "bearer"
    }

@app.post("/auth/refresh")
def refresh():
    # Return mock token for testing
    return {
        "access_token": "mock_access_token",
        "refresh_token": "mock_refresh_token",
        "token_type": "bearer"
    }

@app.post("/auth/check-email")
def check_email():
    # Return mock response for testing
    return {"exists": False}

# Include users router for profile endpoints
app.include_router(users.router, prefix="/api/{user_id}", tags=["users"])

# Include chat router
app.include_router(chat.router, prefix="/api", tags=["chat"])

# Mock profile endpoints for testing
@app.get("/api/{user_id}/profile")
def get_profile(user_id: str):
    # Return mock user profile for testing
    return {
        "id": user_id,
        "email": f"user{user_id}@example.com",
        "name": f"User {user_id[:8]}",
        "bio": "Sample bio for testing",
        "location": "Sample location",
        "theme_preference": "dark",
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00"
    }

@app.put("/api/{user_id}/profile")
def update_profile(user_id: str, user_data: dict):
    # Return mock updated user profile for testing
    return {
        "id": user_id,
        "email": user_data.get("email", f"user{user_id}@example.com"),
        "name": user_data.get("name", f"User {user_id[:8]}"),
        "bio": user_data.get("bio", "Sample bio for testing"),
        "location": user_data.get("location", "Sample location"),
        "theme_preference": user_data.get("theme_preference", "dark"),
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00"
    }

# Mock task endpoints for testing
@app.get("/api/{user_id}/")
def get_tasks(user_id: str):
    # Return mock tasks for testing
    return {
        "tasks": [
            {
                "id": "1",
                "title": "Sample Task",
                "description": "This is a sample task for testing",
                "completed": False,
                "due_date": "2024-12-31T23:59:59",
                "priority": "medium",
                "created_at": "2024-01-01T00:00:00",
                "updated_at": "2024-01-01T00:00:00"
            }
        ],
        "total": 1,
        "offset": 0,
        "limit": 50
    }

@app.get("/api/{user_id}/{task_id}")
def get_task(user_id: str, task_id: str):
    # Return mock task for testing
    return {
        "id": task_id,
        "title": f"Task {task_id}",
        "description": f"Description for task {task_id}",
        "completed": False,
        "due_date": "2024-12-31T23:59:59",
        "priority": "medium",
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00"
    }

@app.post("/api/{user_id}/")
def create_task(user_id: str, task_data: dict):
    # Return mock created task
    task_data["id"] = "new_task_id"
    task_data["created_at"] = "2024-01-01T00:00:00"
    task_data["updated_at"] = "2024-01-01T00:00:00"
    return task_data

@app.put("/api/{user_id}/{task_id}")
def update_task(user_id: str, task_id: str, task_data: dict):
    # Return mock updated task
    task_data["id"] = task_id
    task_data["updated_at"] = "2024-01-01T00:00:00"
    return task_data

@app.patch("/api/{user_id}/{task_id}/complete")
def toggle_task_completion(user_id: str, task_id: str, completion_data: dict):
    # Return mock updated task
    return {
        "id": task_id,
        "title": f"Task {task_id}",
        "description": f"Description for task {task_id}",
        "completed": completion_data.get("completed", True),
        "due_date": "2024-12-31T23:59:59",
        "priority": "medium",
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00"
    }

@app.delete("/api/{user_id}/{task_id}")
def delete_task(user_id: str, task_id: str):
    # Return success message
    return {"message": "Task deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)