from __future__ import annotations

import google.generativeai as genai

from app.log_config import logger
from app.settings import settings


class GeminiAdapter:
    """
    Adapter for the Gemini LLM provider.

    Wraps the Gemini SDK so the rest of the application
    interacts through a common complete() interface.
    """

    def __init__(self, model: str = "gemini-1.5-flash"):
        self.model = model

        if not settings.gemini_api_key:
            raise ValueError("GEMINI_API_KEY is not set in .env")

        genai.configure(
            api_key=settings.gemini_api_key.get_secret_value()
        )

        self.client = genai.GenerativeModel(self.model)

    def complete(self, prompt: str) -> str:
        """
        Sends the prompt to Gemini and returns the response.
        """
        try:
            logger.info(f"Sending prompt to Gemini | model={self.model}")

            response = self.client.generate_content(prompt)

            answer = response.text

            logger.info("Gemini response received successfully")

            return answer

        except Exception as e:
            logger.error(f"Gemini request failed: {e}")
            raise


# Shared instance
gemini_adapter = GeminiAdapter()