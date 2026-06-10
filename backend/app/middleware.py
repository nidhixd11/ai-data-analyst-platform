"""
HTTP middleware for the Data Insights Chatbot backend.

RequestIDMiddleware
------------------
Attaches a unique request ID to every incoming HTTP request so that all
log lines produced during that request share the same ID.  This makes it
possible to grep for a single ID and see the full trace for one request
even when many requests are interleaved in the logs.

Flow:
    1. Read X-Request-ID header if the client provided one.
       (Useful for end-to-end tracing when the frontend generates IDs.)
    2. Generate a fresh uuid4 if no header was present.
    3. Bind the ID to loguru context for the lifetime of the request.
       Every logger.* call inside route handlers, services, etc. will
       automatically include req=<id> with no extra code.
    4. Echo the ID back in the X-Request-ID response header so clients
       can log it for bug reports.
"""

from __future__ import annotations

import uuid

from loguru import logger
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Attach a unique request ID to every request and response."""

    # type: ignore[override]
    async def dispatch(self, request: Request, call_next) -> Response:
        # Use the client-supplied ID (for end-to-end tracing from the
        # frontend) or generate a fresh one.
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))

        # contextualize() binds request_id to all loguru calls within
        # this block — including those in route handlers and services
        # called downstream.  The binding is automatically removed when
        # the block exits; there is no risk of one request's ID leaking
        # into another.
        with logger.contextualize(request_id=request_id):
            logger.info(f"{request.method} {request.url.path}")

            response: Response = await call_next(request)

            logger.info(
                f"{request.method} {request.url.path} → {response.status_code}"
            )

            # Echo the ID so clients can reference it in bug reports.
            response.headers["X-Request-ID"] = request_id

        return response
