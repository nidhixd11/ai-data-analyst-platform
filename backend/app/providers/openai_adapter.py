from __future__ import annotations

from openai import OpenAI

from app.settings import settings


class OpenAIAdapter:
    """OpenAI LLM adapter."""

    def __init__(self) -> None:
        self.client = OpenAI(
            api_key=settings.openai_api_key.get_secret_value()
            if settings.openai_api_key
            else None
        )

    def complete(self, prompt: str) -> str:
        response = self.client.responses.create(
            model="gpt-4.1-mini",
            input=prompt,
        )

        return response.output_text