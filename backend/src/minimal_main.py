from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Todo API",
    description="API for managing todos with user authentication",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],  # Allow frontend origins
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)