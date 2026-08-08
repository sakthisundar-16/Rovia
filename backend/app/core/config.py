from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Rovia Universal Rental API"
    ENVIRONMENT: str = "local"
    DEMO_MODE: bool = True
    
    # Database Settings (PostgreSQL Primary)
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "rovia"
    POSTGRES_PASSWORD: str = "rovia_secret"
    POSTGRES_DB: str = "rovia"
    POSTGRES_PORT: int = 5433
    USE_SQLITE_FALLBACK: bool = False
    
    @property
    def DATABASE_URI(self) -> str:
        if self.USE_SQLITE_FALLBACK:
            return "sqlite+aiosqlite:///./rovia.db"
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
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
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
