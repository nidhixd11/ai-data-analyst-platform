"""
FastAPI application entrypoint for the Data Insights Chatbot.

This module defines the FastAPI app, registers middleware (CORS),
and exposes the /health endpoint used by uptime monitors and CI
smoke tests.

Run locally with:
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

The --reload flag restarts the server on every file save (dev only).
"""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.settings import settings

# ----------------------------------------------------------------------------
# App
# ----------------------------------------------------------------------------

app = FastAPI(
    title="Data Insights Chatbot API",
    description=(
        "Phase 1 backend for the Data Insights Chatbot. "
        "Handles CSV and Excel upload, in-memory RAG, and routes questions "
        "to a chosen LLM provider (Groq, Ollama, Gemini, ChatGPT)."
    ),
    version=settings.app_version,
)


# ----------------------------------------------------------------------------
# CORS middleware
# ----------------------------------------------------------------------------
# Origins come from settings.cors_origins (parsed from CORS_ORIGINS env var).
# This lets us add prod origins later without touching code.

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----------------------------------------------------------------------------
# /health endpoint
# ----------------------------------------------------------------------------


class HealthResponse(BaseModel):
    """Schema for the /health endpoint response.

    Using a Pydantic model (instead of returning a raw dict) gives us:
    - Automatic JSON schema in /docs
    - Response validation: FastAPI guarantees the response shape
    - Type-safe consumers (e.g., generated TypeScript clients)
    """

    status: str
    service: str
    version: str
    environment: str


@app.get(
    "/health",
    response_model=HealthResponse,
    tags=["meta"],
    summary="Liveness check",
    description=(
        "Returns 200 OK with the service name, version, and environment. "
        "Used by uptime monitors and CI smoke tests. Does not check "
        "downstream dependencies (Ollama, Groq, etc) — that's a "
        "future /readiness endpoint."
    ),
)
def health() -> HealthResponse:
    """Liveness check: the process is up and serving requests."""
    return HealthResponse(
        status="ok",
        service=settings.app_name,
        version=settings.app_version,
        environment=settings.environment,
    )
