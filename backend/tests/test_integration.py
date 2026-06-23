"""
Integration test: upload CSV → chat → verify answer + citations.
Tests the full upload-to-answer pipeline.
"""

import tempfile
from pathlib import Path

from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)


def test_full_upload_and_chat_flow():
    """
    Full integration: upload CSV, then ask a question, verify citations.
    """
    # 1. Create temp CSV
    with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False) as f:
        f.write("product,sales,region,date\n")
        f.write("ProductA,1000,North,2024-01-01\n")
        f.write("ProductB,1500,South,2024-01-02\n")
        f.write("ProductA,2000,East,2024-01-03\n")
        csv_path = f.name

    try:
        # 2. Upload the file
        with open(csv_path, "rb") as f:
            files = {"file": (Path(csv_path).name, f, "text/csv")}
            upload_response = client.post("/upload", files=files)

        assert upload_response.status_code == 200, f"Upload failed: {upload_response.json()}"
        upload_data = upload_response.json()

        # Verify upload response
        assert "session_id" in upload_data
        assert upload_data["detected_format"] == "csv"
        assert upload_data["schema"]["rows"] == 3
        assert len(upload_data["preview"]) > 0

        session_id = upload_data["session_id"]

        # 3. Ask a question
        chat_request = {
            "session_id": session_id,
            "model_id": "groq",
            "question": "What is the total sales for ProductA?",
        }

        chat_response = client.post("/chat", json=chat_request)

        assert chat_response.status_code == 200, f"Chat failed: {chat_response.json()}"
        chat_data = chat_response.json()

        # Verify chat response structure
        assert "answer" in chat_data
        assert "context_used" in chat_data
        assert "citations" in chat_data
        assert isinstance(chat_data["citations"], list)

        # Verify citations have required fields
        if chat_data["citations"]:
            citation = chat_data["citations"][0]
            assert "chunk_id" in citation
            assert "chunk_text" in citation
            assert "source_rows" in citation
            assert "relevance_score" in citation

        print("✓ Integration test passed!")
        print(f"  Session: {session_id}")
        print(f"  Answer: {chat_data['answer'][:100]}...")
        print(f"  Citations: {len(chat_data['citations'])}")

    finally:
        Path(csv_path).unlink()


def test_chat_without_upload_fails():
    """
    Verify that /chat fails gracefully if session doesn't exist.
    """
    chat_request = {
        "session_id": "nonexistent-session-id",
        "model_id": "groq",
        "question": "What is the data?",
    }

    response = client.post("/chat", json=chat_request)

    # Should get 404 (not found)
    assert response.status_code == 404
    assert "Session not found" in response.json()["detail"]
