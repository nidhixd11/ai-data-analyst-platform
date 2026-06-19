"""
FastAPI application entrypoint for the Data Insights Chatbot.
Handles CSV/Excel upload, in-memory RAG, and routes questions to LLMs.
"""

from __future__ import annotations

import tempfile
import uuid
from pathlib import Path

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.chunking.chunker import DatasetChunker
from app.ingestion.parser import DatasetProfiler
from app.insights.generator import AutoInsightGenerator
from app.logging import setup_logging
from app.middleware import RequestIDMiddleware
from app.schema.summary import SchemaSummaryBuilder
from app.settings import settings

# ============================================================================
# App
# ============================================================================
app = FastAPI(
    title="Data Insights Chatbot API",
    description=(
        "Phase 1 backend for the Data Insights Chatbot. "
        "Handles CSV and Excel upload, in-memory RAG, and routes questions "
        "to a chosen LLM provider (Groq, Ollama, Gemini, ChatGPT)."
    ),
    version=settings.app_version,
)
setup_logging()
app.add_middleware(RequestIDMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# In-memory session store
# ============================================================================
sessions: dict[str, dict] = {}


# ============================================================================
# /health endpoint
# ============================================================================
class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    environment: str


@app.get(
    "/health",
    response_model=HealthResponse,
    tags=["meta"],
    summary="Liveness check",
)
def health() -> HealthResponse:
    """Liveness check: the process is up and serving requests."""
    return HealthResponse(
        status="ok",
        service=settings.app_name,
        version=settings.app_version,
        environment=settings.environment,
    )


# ============================================================================
# /upload endpoint (real implementation)
# ============================================================================
class ColumnDetail(BaseModel):
    name: str
    type: str
    null_pct: float


class SchemaInfo(BaseModel):
    rows: int
    columns: int
    columns_detail: list[ColumnDetail]


class UploadResponse(BaseModel):
    session_id: str
    detected_format: str
    schema: SchemaInfo  # type: ignore
    preview: list[dict]
    insights: list[str]


@app.post(
    "/upload",
    response_model=UploadResponse,
    tags=["ingestion"],
    summary="Upload and parse CSV/Excel file",
)
async def upload(file: UploadFile = File(...)) -> UploadResponse:
    """
    Upload CSV or Excel file. Parse, profile, chunk, and generate insights.
    Store in session and return metadata.
    """
    import pandas as pd

    # Validate file type
    if not file.filename:
        raise ValueError("File must have a name")

    ext = file.filename.lower().split(".")[-1]
    if ext not in ["csv", "xlsx", "xls"]:
        raise ValueError(f"Unsupported file type: {ext}")

    detected_format = "xlsx" if ext == "xlsx" else "xls" if ext == "xls" else "csv"

    # Save file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{ext}") as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        # Parse the file
        profiler = DatasetProfiler()
        profile = profiler.profile(tmp_path)

        # Read dataframe
        df = pd.read_csv(tmp_path) if tmp_path.endswith(".csv") else pd.read_excel(tmp_path)

        # Build schema summary
        summary_builder = SchemaSummaryBuilder()
        summary = summary_builder.build(df)

        # Generate chunks
        chunker = DatasetChunker()
        chunks = chunker.chunk(df, window_size=10)

        # Generate insights
        insight_gen = AutoInsightGenerator()
        insights = insight_gen.generate(summary)

        # Build schema detail for response
        schema_detail = [
            ColumnDetail(
                name=col["name"],
                type=col["dtype"],
                null_pct=col["null_percent"],
            )
            for col in summary.get("schema", [])
        ]

        # Create preview (first 5 rows)
        preview = df.head(5).to_dict(orient="records")

        # Create session
        session_id = str(uuid.uuid4())
        sessions[session_id] = {
            "dataframe": df,
            "profile": profile,
            "summary": summary,
            "chunks": chunks,
            "detected_format": detected_format,
        }

        return UploadResponse(
            session_id=session_id,
            detected_format=detected_format,
            schema=SchemaInfo(
                rows=len(df),
                columns=len(df.columns),
                columns_detail=schema_detail,
            ),
            preview=preview,
            insights=insights,
        )
    finally:
        # Clean up temp file
        Path(tmp_path).unlink()


# ============================================================================
# /chat endpoint (stub for now)
# ============================================================================
class ChatRequest(BaseModel):
    session_id: str
    model_id: str
    question: str


class ChatResponse(BaseModel):
    answer: str
    context_used: list[str]
    suggested_chart: str | None


@app.post(
    "/chat",
    response_model=ChatResponse,
    tags=["chat"],
    summary="Ask a question about the uploaded file",
)
async def chat(req: ChatRequest) -> ChatResponse:
    """
    Ask a natural-language question. Returns answer + context used.
    Stub version — real implementation will use RAG + LLM router.
    """
    return ChatResponse(
        answer=f"Based on the data, the answer to '{req.question}' is that Product A leads with 42% market share.",
        context_used=[
            "columns: product, sales, region",
            "rows: 0-250",
            "aggregates: sum(sales) by region",
        ],
        suggested_chart="bar",
    )
