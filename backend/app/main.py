"""
FastAPI application entrypoint for the Data Insights Chatbot.
Handles CSV/Excel upload, in-memory RAG, and routes questions to LLMs.
"""

from __future__ import annotations
import re

import contextlib
import tempfile
import uuid
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.analytics.chart_generator import ChartGenerator
from app.chunking.chunker import DatasetChunker
from app.gateway.router import ModelRouter
from app.ingestion.parser import DatasetProfiler
from app.log_config import setup_logging
from app.middleware import RequestIDMiddleware
from app.schema.chart import ChartConfig
from app.schema.summary import SchemaSummaryBuilder
from app.settings import settings
from app.session_store import SessionStore

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
session_store = SessionStore()

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
            with contextlib.suppress(Exception):
                df[column] = pd.to_datetime(df[column])

        # Build schema summary
        summary_builder = SchemaSummaryBuilder()
        summary = summary_builder.build(df)

        # Generate chunks
        chunker = DatasetChunker()
        chunks = chunker.chunk(df, window_size=10)

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

                mean=float(series.mean()) if series.count() else None,
                median=float(series.median()),
                minimum=float(series.min()),
                maximum=float(series.max()),
                std=float(series.std()) if series.count() > 1 else 0.0,
            )

        # Create session
        session_id = str(uuid.uuid4())
        session_store.set(session_id, {
            "dataframe": df,
            "profile": profile,
            "summary": summary,
            "chunks": chunks,
            "detected_format": detected_format,
            "column_statistics": column_statistics,
        })

        chart_generator = ChartGenerator()
        charts = chart_generator.generate(df)

        insights = []

        insights.append(
            f"Dataset contains {len(df)} rows and {len(df.columns)} columns."
        )

        if duplicate_rows == 0:
            insights.append("No duplicate rows detected.")
        else:
            insights.append(f"{duplicate_rows} duplicate rows detected.")

        if null_percentage == 0:
            insights.append("No missing values detected.")
        else:
            insights.append(f"{null_percentage:.1f}% missing values detected.")

        insights.append(
            f"{numeric_columns} numeric columns identified."
        )

        for column, stats in column_statistics.items():
            insights.append(
                f"{column} ranges from {stats.minimum:.2f} to {stats.maximum:.2f} "
                f"with an average of {stats.mean:.2f}."
            )

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


def _normalise(name: str) -> str:
    """Lowercase and strip separators so column names match loosely."""
    return re.sub(r"[^a-z0-9]", "", name.lower())


def _find_column(question: str, df) -> str | None:
    """Find the dataframe column the question is most likely referring to."""
    q_norm = _normalise(question)
    candidates = []
    for col in df.columns:
        col_norm = _normalise(col)
        if col_norm and col_norm in q_norm:
            candidates.append(col)
    if not candidates:
        return None
    # Prefer the longest match (avoids "age" matching inside "average")
    return max(candidates, key=lambda c: len(_normalise(c)))


def compute_direct_stat(question: str, df) -> str | None:
    """
    Try to directly compute a statistic from the dataframe based on
    keywords in the question. Returns a precomputed fact string to feed
    the LLM, or None if no confident match is found.
    """
    q = question.lower()
    column = _find_column(question, df)
    if column is None:
        return None

    series = df[column]
    is_numeric = column in df.select_dtypes(include=["number"]).columns

    if is_numeric:
        if any(k in q for k in ["average", "mean", "avg"]):
            return f"The average {column} is {series.mean():.2f}."
        if any(k in q for k in ["maximum", "max", "highest", "largest"]):
            return f"The maximum {column} is {series.max():.2f}."
        if any(k in q for k in ["minimum", "min", "lowest", "smallest"]):
            return f"The minimum {column} is {series.min():.2f}."
        if any(k in q for k in ["median"]):
            return f"The median {column} is {series.median():.2f}."
        if any(k in q for k in ["std", "standard deviation", "variance"]):
            return f"The standard deviation of {column} is {series.std():.2f}."
        if any(k in q for k in ["sum", "total"]):
            return f"The total {column} is {series.sum():.2f}."
        if any(k in q for k in ["count", "how many"]):
            return f"There are {int(series.count())} non-null values in {column}."
    else:
        if any(k in q for k in ["unique", "distinct", "how many"]):
            return f"There are {series.nunique()} unique values in {column}."
        if any(k in q for k in ["most common", "most frequent", "top"]):
            top = series.value_counts().head(3)
            top_text = ", ".join(f"{idx} ({cnt})" for idx, cnt in top.items())
            return f"The most common values in {column} are: {top_text}."

    return None


def build_data_context(df, summary: dict, column_statistics: dict) -> str:
    """Build a rich, un-truncated description of the dataset for the LLM."""
    rows, columns = df.shape

    schema_lines = []
    for col in summary.get("schema", []):
        schema_lines.append(
            f"- {col['name']} ({col['dtype']}, {col['null_percent']:.1f}% null)")
    schema_text = "\n".join(
        schema_lines) if schema_lines else "No schema available."

    stats_lines = []
    for col_name, stats in column_statistics.items():
        stats_lines.append(
            f"- {col_name}: count={stats.count}, mean={stats.mean:.2f}, "
            f"median={stats.median:.2f}, min={stats.minimum:.2f}, "
            f"max={stats.maximum:.2f}, std={stats.std:.2f}, nulls={stats.null_count}"
        )
    stats_text = "\n".join(
        stats_lines) if stats_lines else "No numeric columns."

    categorical_cols = df.select_dtypes(include=["object", "category"]).columns
    cat_lines = []
    for col in categorical_cols[:5]:
        top = df[col].value_counts().head(3)
        top_text = ", ".join(f"{idx} ({cnt})" for idx, cnt in top.items())
        cat_lines.append(f"- {col}: top values → {top_text}")
    cat_text = "\n".join(cat_lines) if cat_lines else "No categorical columns."

    sample_rows = df.head(5).to_dict(orient="records")

    return f"""Dataset shape: {rows} rows × {columns} columns

Schema:
{schema_text}

Numeric column statistics:
{stats_text}

Categorical column breakdown:
{cat_text}

Sample rows (first 5):
{sample_rows}"""


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
    session = session_store.get(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    df = session.get("dataframe")
    summary = session.get("summary", {})
    column_statistics = session.get("column_statistics", {})
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

    # Try to compute an exact answer directly from the dataframe first.
    direct_stat = None
    if df is not None:
        try:
            direct_stat = compute_direct_stat(req.question, df)
        except Exception:
            direct_stat = None

    data_context = build_data_context(
        df, summary, column_statistics) if df is not None else "No data available."

    precomputed_block = (
        f"\nPrecomputed fact (use this exact value, don't recalculate):\n{direct_stat}\n"
        if direct_stat
        else ""
    )

    prompt = f"""You are a helpful, conversational data analyst assistant embedded in a dashboard.

    If the user's message is a greeting, small talk, or not related to the dataset (e.g. "hello", "thanks", "what can you do"), respond naturally and briefly as an assistant would — don't mention "insufficient data" for these.

    If the user's message IS a question about the data, answer using the dataset context below. Use actual numbers where you have them. If the question needs information the dataset doesn't contain (e.g. asking about revenue when there's no revenue column), don't just refuse — briefly say what's missing, then still offer whatever partial insight the available data DOES support (e.g. reasoning from cost/salary data even if profit impact can't be fully determined). Only say there's insufficient data if there is truly nothing relevant to say.

    {data_context}
    {precomputed_block}
    Question: {req.question}

    Keep your answer concise (2-4 sentences unless more detail is clearly needed)."""

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
