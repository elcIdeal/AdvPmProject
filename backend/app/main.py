from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from .config import Settings
from .routers import auth, transactions, analysis
from .dependencies import get_current_user

app = FastAPI(title="SpendWise API")
settings = Settings()

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    app.mongodb_client = AsyncIOMotorClient(settings.mongodb_uri)
    app.mongodb = app.mongodb_client["spendwise"]

@app.on_event("shutdown")
async def shutdown_db_client():
    app.mongodb_client.close()

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(
    transactions.router,
    prefix="/api/transactions",
    tags=["transactions"],
    dependencies=[Depends(get_current_user)]
)
app.include_router(
    analysis.router,
    prefix="/api/analysis",
    tags=["analysis"],
    dependencies=[Depends(get_current_user)]
)

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}