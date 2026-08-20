from fastapi import FastAPI

app = FastAPI(
    title="PRAVAH API",
    description="AI-Powered Blood Supply & Cold-Chain Intelligence",
    version="1.0.0"
)


@app.get("/")
def root():
    return {
        "project": "PRAVAH",
        "status": "running"
    }