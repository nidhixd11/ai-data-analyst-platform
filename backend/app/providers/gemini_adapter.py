from __future__ import annotations

import google.generativeai as genai

from app.settings import settings


class GeminiAdapter:
    """Gemini LLM adapter."""

    def __init__(self) -> None:
        if settings.gemini_api_key:
            genai.configure(
                api_key=settings.gemini_api_key.get_secret_value()
            )

    def complete(self, prompt: str) -> str:
        model = genai.GenerativeModel("gemini-1.5-flash")

        response = model.generate_content(prompt)

        return response.text