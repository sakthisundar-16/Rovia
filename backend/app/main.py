from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.router import api_router

# redirect_slashes=False prevents 307 redirects which break CORS preflights in browsers
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="ROVIA Intelligent Rental Operations Platform",
    version="1.0.0",
    redirect_slashes=False
)

# Parse ALLOWED_ORIGINS — include explicit local dev origins and production URLs
raw_origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]
origins = list(set([
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
] + raw_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if "*" not in origins else ["*"],
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
