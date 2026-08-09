from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Rovia Universal Rental API"
    ENVIRONMENT: str = "local"
    DEMO_MODE: bool = True

    # ── Render / Production: single DATABASE_URL (e.g. postgresql://user:pw@host/db)
    # ── Local dev: individual POSTGRES_* vars
    DATABASE_URL: Optional[str] = None

    # Database Settings (PostgreSQL Primary — used when DATABASE_URL is not set)
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "rovia"
    POSTGRES_PASSWORD: str = "rovia_secret"
    POSTGRES_DB: str = "rovia"
    POSTGRES_PORT: int = 5432
    USE_SQLITE_FALLBACK: bool = False

    @property
    def DATABASE_URI(self) -> str:
        # Priority 1: Single DATABASE_URL (Render injects this automatically)
        if self.DATABASE_URL:
            url = self.DATABASE_URL
            # Render gives postgres:// — SQLAlchemy async needs postgresql+asyncpg://
            if url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql+asyncpg://", 1)
            elif url.startswith("postgresql://"):
                url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
            return url

        # Priority 2: SQLite fallback for local dev without PostgreSQL
        if self.USE_SQLITE_FALLBACK:
            return "sqlite+aiosqlite:///./rovia.db"

        # Priority 3: Construct from individual POSTGRES_* vars
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    # Redis Settings
    REDIS_URL: str = "redis://localhost:6379/0"

    # Security Settings
    SECRET_KEY: str = "rovia_local_secret_key_12345"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Storage Settings
    STORAGE_ENDPOINT: str = "http://localhost:9000"
    STORAGE_ACCESS_KEY: Optional[str] = "minioadmin"
    STORAGE_SECRET_KEY: Optional[str] = "minioadmin"
    STORAGE_BUCKET: str = "rovia-assets"

    # CORS — comma-separated list of allowed origins
    ALLOWED_ORIGINS: str = "*"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
