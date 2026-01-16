from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import tasks, auth, users, chat
from .database.session import engine
from .models.user import User
from .models.task import Task

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

# Include routers
app.include_router(tasks.router, prefix="/api/{user_id}", tags=["tasks"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/{user_id}", tags=["users"])

# Include projects router (already has {user_id} in paths, so no prefix needed)
from .routers import projects
app.include_router(projects.router, prefix="/api", tags=["projects"])

# Include chat router
app.include_router(chat.router, prefix="/api", tags=["chat"])

@app.on_event("startup")
async def startup_event():
    # Create database tables
    from sqlmodel import SQLModel
    SQLModel.metadata.create_all(bind=engine)

@app.get("/")
def read_root():
    return {"message": "Todo API is running!"}

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
