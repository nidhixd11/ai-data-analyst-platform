"""Tests for RequestIDMiddleware."""

from __future__ import annotations

from fastapi.testclient import TestClient


def test_request_id_generated_when_absent(client: TestClient) -> None:
    """A request without X-Request-ID gets one generated and returned."""
    response = client.get("/health")

    assert "x-request-id" in response.headers


def test_request_id_is_uuid4_format(client: TestClient) -> None:
    """The generated ID follows the uuid4 format (8-4-4-4-12 hex chars)."""
    response = client.get("/health")
    request_id = response.headers["x-request-id"]

    parts = request_id.split("-")
    assert len(
        parts) == 5, f"expected 5 hyphen-separated groups, got {request_id!r}"
    assert len(parts[0]) == 8
    assert len(parts[1]) == 4
    assert len(parts[2]) == 4
    assert len(parts[3]) == 4
    assert len(parts[4]) == 12


def test_request_id_echoed_when_provided(client: TestClient) -> None:
    """A client-supplied X-Request-ID is echoed back unchanged."""
    custom_id = "my-trace-id-abc123"
    response = client.get("/health", headers={"X-Request-ID": custom_id})

    assert response.headers["x-request-id"] == custom_id


def test_different_requests_get_different_ids(client: TestClient) -> None:
    """Two requests without a supplied ID receive distinct IDs."""
    r1 = client.get("/health")
    r2 = client.get("/health")

    assert r1.headers["x-request-id"] != r2.headers["x-request-id"]


def test_middleware_does_not_break_health_endpoint(client: TestClient) -> None:
    """Presence of RequestIDMiddleware must not affect /health response body."""
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"
