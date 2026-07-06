"""
FastAPI application entrypoint for the Data Insights Chatbot.
Handles CSV/Excel upload, in-memory RAG, and routes questions to LLMs.
"""

from __future__ import annotations
from app.analytics.chart_generator import ChartGenerator
from app.schema.chart import ChartConfig

import tempfile
import uuid
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Any


from app.chunking.chunker import DatasetChunker
from app.gateway.router import ModelRouter
from app.ingestion.parser import DatasetProfiler
from app.insights.generator import AutoInsightGenerator
from app.log_config import setup_logging
from app.middleware import RequestIDMiddleware
from app.schema.summary import SchemaSummaryBuilder
from app.settings import settings

# Logging
# ----------------------------------------------------------------------------
# Must be called before the app is created so that even startup errors
# are captured in the structured format.

setup_logging()

# Logging
# Must be called before the app is created so that even startup errors
# are captured in the structured format.
setup_logging()

# ============================================================================
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
    dtype: str
    null_pct: float


class SchemaInfo(BaseModel):
    rows: int
    columns: int
    columns_detail: list[ColumnDetail]


class ColumnStatistics(BaseModel):
    dtype: str

    count: int
    null_count: int

    mean: float | None = None
    median: float | None = None
    minimum: float | None = None
    maximum: float | None = None
    std: float | None = None


class UploadResponse(BaseModel):
    session_id: str
    detected_format: str
    schema: SchemaInfo
    preview: list[dict]
    insights: list[str]

    # Dataset statistics
    memory_mb: float
    null_percentage: float
    duplicate_rows: int
    numeric_columns: int

    column_statistics: dict[str, ColumnStatistics]
    charts: list[ChartConfig] = Field(default_factory=list)


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
        df = pd.read_csv(tmp_path) if tmp_path.endswith(
            ".csv") else pd.read_excel(tmp_path)

        for column in df.columns:
            if "date" in column.lower() or "time" in column.lower():
                try:
                    df[column] = pd.to_datetime(df[column])
                except Exception:
                    pass

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
       # Build schema detail for response
        dtype_map = {
            "int": ["int8", "int16", "int32", "int64", "uint8", "uint16", "uint32", "uint64"],
            "float": ["float16", "float32", "float64"],
            "bool": ["bool"],
            "datetime": ["datetime64", "datetime64[ns]"],
        }

        def normalise_dtype(raw: str) -> str:
            raw = raw.lower()
            for target, variants in dtype_map.items():
                if any(raw.startswith(v) for v in variants):
                    return target
            return "string"

        schema_detail = [
            ColumnDetail(
                name=col["name"],
                dtype=normalise_dtype(col["dtype"]),
                null_pct=col["null_percent"],
            )
            for col in summary.get("schema", [])
        ]

        # Create preview (first 5 rows)
        preview = df.head(5).to_dict(orient="records")

        # Dataset statistics
        memory_mb = float(df.memory_usage(deep=True).sum() / (1024 * 1024))

        total_cells = df.shape[0] * df.shape[1]
        null_percentage = (
            float(df.isnull().sum().sum() / total_cells * 100)
            if total_cells > 0
            else 0.0
        )

        duplicate_rows = int(df.duplicated().sum())

        numeric_columns = int(
            df.select_dtypes(include=["number"]).shape[1]
        )

        # Statistics for every numeric column
        column_statistics: dict[str, ColumnStatistics] = {}

        numeric_df = df.select_dtypes(include=["number"])

        for column in numeric_df.columns:
            series = numeric_df[column]

        column_statistics[column] = ColumnStatistics(
            dtype=str(series.dtype),

            count=int(series.count()),
            null_count=int(series.isnull().sum()),

            mean=float(series.mean()),
            median=float(series.median()),
            minimum=float(series.min()),
            maximum=float(series.max()),
            std=float(series.std()) if series.count() > 1 else 0.0,
        )

        # Create session
        session_id = str(uuid.uuid4())
        sessions[session_id] = {
            "dataframe": df,
            "profile": profile,
            "summary": summary,
            "chunks": chunks,
            "detected_format": detected_format,
        }

        chart_generator = ChartGenerator()
        charts = chart_generator.generate(df)

        return UploadResponse(
            session_id=session_id,
            detected_format=detected_format,
            schema=SchemaInfo(
                rows=len(df),
                columns=len(df.columns),
                columns_detail=schema_detail,
            ),
            preview=preview,
            charts=charts,
            insights=insights,

            memory_mb=memory_mb,
            null_percentage=null_percentage,
            duplicate_rows=duplicate_rows,
            numeric_columns=numeric_columns,
            column_statistics=column_statistics
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


class Citation(BaseModel):
    chunk_id: int
    chunk_text: str
    source_rows: list[int]
    relevance_score: float


class ChatResponse(BaseModel):
    answer: str
    context_used: list[str]
    citations: list[Citation]
    suggested_chart: str | None


# Initialize router (at module level, once)
router = ModelRouter()


@app.post(
    "/chat",
    response_model=ChatResponse,
    tags=["chat"],
    summary="Ask a question about the file",
)
async def chat(req: ChatRequest) -> ChatResponse:
    """
    Ask a natural-language question. Routes to LLM provider.
    Returns answer + citations of chunks used.
    """
    # Get the session
    session = sessions.get(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Get chunks for citations
    chunks = session.get("chunks", [])
    citations = [
        Citation(
            chunk_id=i,
            chunk_text=chunk.get("text", "")[:100],
            source_rows=chunk.get("row_indices", []),
            relevance_score=0.85,
        )
        for i, chunk in enumerate(chunks[:3])
    ]

    # Build prompt with schema + context
    schema_summary = session.get("summary", {})
    context_text = "\n".join([c.chunk_text for c in citations])

    prompt = f"""You are a careful data analyst. Answer only using the uploaded data.

Schema:
{str(schema_summary)[:500]}

Context:
{context_text}

Question: {req.question}

Answer concisely. Say 'insufficient data' if you can't answer."""

    # Route to LLM
    try:
        answer = router.route(req.model_id, prompt)  # type: ignore
    except Exception as e:
        answer = f"Error calling LLM: {str(e)}"

    return ChatResponse(
        answer=answer,
        context_used=[c.chunk_text for c in citations],
        citations=citations,
        suggested_chart="bar",
    )
