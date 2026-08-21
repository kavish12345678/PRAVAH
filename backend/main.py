from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.dashboard import router as dashboard_router
from api.forecast import router as forecast_router
from api.intelligence import router as intelligence_router
from api.inventory import router as inventory_router
from api.risk import router as risk_router
from api.transfer import router as transfer_router

app = FastAPI(
    title="PRAVAH API",
    description="AI-Powered Blood Supply & Cold-Chain Intelligence",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard_router)
app.include_router(inventory_router)
app.include_router(forecast_router)
app.include_router(risk_router)
app.include_router(transfer_router)
app.include_router(intelligence_router)


@app.get("/")
def root():
    return {
        "project": "PRAVAH",
        "status": "running",
    }
