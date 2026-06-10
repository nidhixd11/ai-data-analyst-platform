"""
Structured logging configuration for the Data Insights Chatbot backend.

Replaces Python's built-in logging with loguru, which gives us:
- Structured format with timestamp, level, request_id, module, and message
- Automatic colourised output in terminals
- Full tracebacks with variable values on exceptions (diagnose=True)
- Per-request context binding via logger.contextualize()

Call setup_logging() once at module load time in main.py.
LOG_LEVEL is read from settings so verbosity can be changed via .env
without touching code:
    LOG_LEVEL=DEBUG    → every SQL query, request body, embedding call
    LOG_LEVEL=INFO     → normal production output (default)
    LOG_LEVEL=WARNING  → only warnings and errors
"""

from __future__ import annotations

import sys

from loguru import logger

from app.settings import settings


def setup_logging() -> None:
    """Configure loguru for the application.

    Removes the default loguru handler and adds a structured one that
    reads LOG_LEVEL from settings.  Every log line produced inside a
    request context (set by RequestIDMiddleware) will automatically
    include the request_id field; lines outside request context
    (startup, background tasks) fall back to req=-.

    Format:
        2024-01-15 10:23:45 | INFO     | req=abc-123 | app.main:startup:42 | Server started
    """
    logger.remove()  # remove loguru's default plain-text handler

    logger.add(
        sys.stdout,
        level=settings.log_level.upper(),
        format=(
            "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
            "<level>{level: <8}</level> | "
            "req=<cyan>{extra[request_id]}</cyan> | "
            "<cyan>{name}:{function}:{line}</cyan> | "
            "{message}"
        ),
        # Ensure request_id always exists in extra so the format string
        # never raises a KeyError outside of request context.
        filter=lambda record: record["extra"].setdefault(
            "request_id", "-") or True,
        colorize=True,
        backtrace=True,   # full chain of cause/context on exceptions
        diagnose=True,    # show local variable values in tracebacks (dev only)
    )
