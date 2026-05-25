"""
Application settings loaded from environment variables and/or a .env file.

Uses pydantic-settings so values are typed and validated at startup.
If a required field is missing, the app fails fast with a clear error
instead of crashing later mid-request.

Usage:
    from app.settings import settings
    print(settings.max_upload_mb)
    print(settings.groq_api_key.get_secret_value())  # SecretStr unwrap
"""

from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """All runtime configuration for the backend.

    Source order (highest priority wins):
    1. OS environment variables (set in shell or docker-compose)
    2. Values from backend/.env (loaded automatically)
    3. Defaults defined here in code
    """

    model_config = SettingsConfigDict(
        # Path relative to the cwd uvicorn is run from (i.e., backend/).
        env_file=".env",
        env_file_encoding="utf-8",
        # Ignore unknown vars in .env instead of crashing on typos.
        extra="ignore",
        # Env var names are case-insensitive: GROQ_API_KEY == groq_api_key.
        case_sensitive=False,
    )

    # ------------------------------------------------------------------
    # App metadata
    # ------------------------------------------------------------------
    app_name: str = "ai-data-analyst-platform"
    app_version: str = "0.1.0"
    environment: Literal["dev", "staging", "prod"] = "dev"

    # ------------------------------------------------------------------
    # Server / networking
    # ------------------------------------------------------------------
    host: str = "0.0.0.0"
    port: int = 8000
    # Comma-separated list of allowed origins for CORS, e.g.
    # CORS_ORIGINS="http://localhost:5173,http://localhost:3000"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse the comma-separated CORS_ORIGINS env var into a list."""
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    # ------------------------------------------------------------------
    # File upload limits
    # ------------------------------------------------------------------
    max_upload_mb: int = Field(default=50, ge=1, le=500)
    upload_allowed_mime_types: str = "text/csv,application/vnd.ms-excel"

    # ------------------------------------------------------------------
    # Session store
    # ------------------------------------------------------------------
    session_ttl_seconds: int = Field(default=3600, ge=60)

    # ------------------------------------------------------------------
    # LLM provider API keys (all optional — set what you have)
    # ------------------------------------------------------------------
    groq_api_key: SecretStr | None = None
    gemini_api_key: SecretStr | None = None
    openai_api_key: SecretStr | None = None

    # Ollama runs locally; no key, just a host URL.
    ollama_host: str = "http://localhost:11434"

    # ------------------------------------------------------------------
    # Default LLM provider when the user doesn't pick one in the request.
    # ------------------------------------------------------------------
    default_llm_provider: Literal["groq", "ollama", "gemini", "openai"] = "groq"


@lru_cache
def get_settings() -> Settings:
    """Return the cached Settings instance.

    Wrapped in lru_cache so the .env file is only parsed once per process.
    Use FastAPI's Depends(get_settings) in endpoints (cleaner for tests).
    """
    return Settings()


# Convenience module-level singleton for non-endpoint code.
settings = get_settings()
