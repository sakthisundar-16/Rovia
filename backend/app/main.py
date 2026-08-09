from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.router import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="ROVIA Intelligent Rental Operations Platform",
    version="1.0.0"
)

# Parse ALLOWED_ORIGINS — supports "*" or comma-separated list of URLs
_origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.rentals.handover_verification import router as handover_router

app.include_router(api_router, prefix="/api/v1")
app.include_router(handover_router)

@app.get("/")
async def root():
    return {"message": "Welcome to ROVIA", "environment": settings.ENVIRONMENT}
