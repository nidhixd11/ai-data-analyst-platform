"""Tests for the /health liveness endpoint."""

from __future__ import annotations

from fastapi.testclient import TestClient


def test_health_returns_200(client: TestClient) -> None:
    """/health responds with HTTP 200 OK."""
    response = client.get("/health")
    assert response.status_code == 200


def test_health_returns_expected_shape(client: TestClient) -> None:
    """Response has the four documented fields."""
    response = client.get("/health")
    body = response.json()

    assert set(body.keys()) == {"status", "service", "version", "environment"}


def test_health_status_is_ok(client: TestClient) -> None:
    """status field is literally 'ok' (used by uptime monitors)."""
    response = client.get("/health")
    assert response.json()["status"] == "ok"


def test_health_service_name(client: TestClient) -> None:
    """service field identifies this app."""
    response = client.get("/health")
    assert response.json()["service"] == "ai-data-analyst-platform"


def test_health_version_is_semver(client: TestClient) -> None:
    """version is a non-empty string in semver-ish form (X.Y.Z)."""
    response = client.get("/health")
    version = response.json()["version"]

    assert isinstance(version, str)
    assert version  # non-empty
    parts = version.split(".")
    assert len(parts) == 3, f"expected MAJOR.MINOR.PATCH, got {version!r}"
    for part in parts:
        assert part.isdigit(), f"non-numeric version segment: {part!r}"


def test_health_environment_is_allowed_value(client: TestClient) -> None:
    """environment is one of the Literal values defined in Settings."""
    response = client.get("/health")
    assert response.json()["environment"] in {"dev", "staging", "prod"}
