"""
Structured logging setup using loguru.
Configures JSON-formatted logs with request-id correlation for tracing.
"""

import sys

from loguru import logger


def setup_logging():
    """
    Initialize loguru with JSON formatting and remove default handler.
    Called once at app startup in main.py.
    """
    logger.remove()  # Remove default handler
    logger.add(
        sys.stdout,
        format="<level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        colorize=True,
    )
