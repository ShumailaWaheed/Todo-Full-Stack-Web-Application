from src.main import app

# This file serves as the entry point for Hugging Face Spaces
# Hugging Face Spaces will look for a variable named "app" in this file

# For Hugging Face Spaces deployment
if __name__ == "__main__":
    import uvicorn
    import os

    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)