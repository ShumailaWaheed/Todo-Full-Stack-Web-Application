from fastapi import FastAPI

app = FastAPI(title="Simple Test")

@app.get("/")
def read_root():
    return {"message": "Simple test works!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)