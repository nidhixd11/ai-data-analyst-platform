"""
FastAPI application entrypoint for the CSV Insights Chatbot.

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

# ----------------------------------------------------------------------------
# App metadata
# ----------------------------------------------------------------------------

APP_NAME = "ai-data-analyst-platform"
APP_VERSION = "0.1.0"

app = FastAPI(
    title="CSV Insights Chatbot API",
    description=(
        "Phase 1 backend for the CSV Insights Chatbot. "
        "Handles CSV upload, in-memory RAG, and routes questions "
        "to a chosen LLM provider (Groq, Ollama, Gemini, ChatGPT)."
    ),
    version=APP_VERSION,
)


# ----------------------------------------------------------------------------
# CORS middleware
# ----------------------------------------------------------------------------
# In dev, the React frontend runs on http://localhost:5173 (Vite default).
# Without CORS, the browser blocks fetch() calls from the frontend to this API.
# For Phase 1 we allow only known dev origins. Production origins will be added
# in Phase 2 via environment variables (T-108).

ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:5173",  # same, different host form
    "http://localhost:3000",  # Common alt frontend port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
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


@app.get(
    "/health",
    response_model=HealthResponse,
    tags=["meta"],
    summary="Liveness check",
    description=(
        "Returns 200 OK with the service name and version. "
        "Used by uptime monitors and CI smoke tests. Does not check "
        "downstream dependencies (Ollama, Groq, etc) — that's a "
        "future /readiness endpoint."
    ),
)
def health() -> HealthResponse:
    """Liveness check: the process is up and serving requests."""
    return HealthResponse(
        status="ok",
        service=APP_NAME,
        version=APP_VERSION,
    )
