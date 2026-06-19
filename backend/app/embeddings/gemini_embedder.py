from __future__ import annotations

from typing import List

import google.generativeai as genai

from app.settings import settings


class GeminiEmbedder:
    """Generates embeddings using Gemini."""

    def __init__(self) -> None:
        if settings.gemini_api_key:
            genai.configure(
                api_key=settings.gemini_api_key.get_secret_value()
            )

    def embed(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for text chunks.
        """

        embeddings = []

        for text in texts:
            result = genai.embed_content(
                model="models/embedding-001",
                content=text,
                task_type="retrieval_document",
            )

            embeddings.append(result["embedding"])

        return embeddings