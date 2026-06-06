from functools import lru_cache

from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    APP_NAME: str = "Smart Pantry API"
    ENVIRONMENT: str = "local"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    # Full async URL for a hosted DB (Neon, Supabase, RDS). If empty, built from parts.
    DATABASE_URL_OVERRIDE: str = ""

    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "pantry"
    POSTGRES_PASSWORD: str = "pantry"
    POSTGRES_DB: str = "pantry"

    JWT_SECRET: str = "change-me-in-prod"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    LLM_PROVIDER: str = "claude"
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "claude-opus-4-8"

    # --- Background jobs (Step 10) ---
    ENABLE_SCHEDULER: bool = True
    EXPIRY_SCAN_WITHIN_DAYS: int = 3
    EXPIRY_SCAN_HOUR_UTC: int = 7

    @computed_field
    @property
    def DATABASE_URL(self) -> str:
        if self.DATABASE_URL_OVERRIDE:
            return self.DATABASE_URL_OVERRIDE
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()
