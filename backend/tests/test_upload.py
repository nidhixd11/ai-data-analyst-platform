"""
Tests for POST /upload endpoint.
Coverage:
- Valid CSV upload
- Valid Excel upload
"""

import tempfile
from pathlib import Path

import pandas as pd
from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)


def test_upload_valid_csv():
    """Upload a valid CSV file."""
    with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False) as f:
        f.write("name,age,city\nAlice,25,Mumbai\nBob,30,Delhi\n")
        csv_path = f.name

    try:
        with open(csv_path, "rb") as f:
            files = {"file": (Path(csv_path).name, f, "text/csv")}
            response = client.post("/upload", files=files)

        assert response.status_code == 200
        data = response.json()
        assert data["detected_format"] == "csv"
        assert data["schema"]["rows"] == 2
        assert data["schema"]["columns"] == 3
        assert "session_id" in data
        assert len(data["preview"]) == 2
    finally:
        Path(csv_path).unlink()


def test_upload_valid_excel():
    """Upload a valid Excel file."""
    with tempfile.NamedTemporaryFile(suffix=".xlsx", delete=False) as f:
        df = pd.DataFrame({"name": ["Alice", "Bob"], "age": [25, 30]})
        df.to_excel(f.name, index=False)
        excel_path = f.name

    try:
        with open(excel_path, "rb") as f:
            files = {
                "file": (
                    Path(excel_path).name,
                    f,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            }
            response = client.post("/upload", files=files)

        assert response.status_code == 200
        data = response.json()
        assert data["detected_format"] == "xlsx"
        assert data["schema"]["rows"] == 2
    finally:
        Path(excel_path).unlink()
