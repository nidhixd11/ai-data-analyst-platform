"""
Shared pytest fixtures for the backend test suite.

Anything defined here is automatically available in every test file
in this directory (no import needed). pytest discovers conftest.py
by convention.
"""

from __future__ import annotations

from collections.abc import Iterator

import pytest
from app.main import app
from fastapi.testclient import TestClient


@pytest.fixture(scope="session")
def client() -> Iterator[TestClient]:
    """A TestClient that talks to the FastAPI app in-memory.

    `scope="session"` means one client is created per pytest run
    (not per test), which is fast and fine because /health is stateless.
    For tests that mutate state (file uploads, sessions), we'll switch
    to function scope.

    Using a context manager triggers FastAPI's startup/shutdown hooks,
    so any future @app.on_event("startup") logic runs in tests too.
    """
    with TestClient(app) as c:
        yield c
