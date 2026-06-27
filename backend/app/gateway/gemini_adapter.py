"""
GeminiAdapter: Routes prompts to Google Gemini API.
Uses google-generativeai SDK.
Free tier: Gemini Flash (15 req/min, 1M tokens/day).
"""

import logging

from app.gateway.base import LLMProvider
from app.settings import settings

logger = logging.getLogger(__name__)


class GeminiAdapter(LLMProvider):
    """Adapter for Google Gemini API."""

    def __init__(self):
        """Initialize Gemini client with API key from settings."""
        if not settings.gemini_api_key:
            raise ValueError("GEMINI_API_KEY is not set in .env")

        try:
            import google.generativeai as genai

            self.genai = genai
            self.genai.configure(api_key=settings.gemini_api_key)
            self.model_name = "gemini-1.5-flash"  # Free tier
            self.client = self.genai.GenerativeModel(self.model_name)
            logger.info(f"✓ Gemini initialized: {self.model_name}")
        except ImportError:
            raise ImportError(  # noqa: B904
                "google-generativeai not installed. Run: pip install google-generativeai"
            )
        except Exception as e:  # noqa: B904
            logger.error(f"✗ Gemini init failed: {str(e)}")
            raise ValueError(f"GEMINI_API_KEY may be invalid: {str(e)}")  # noqa: B904

    def complete(self, prompt: str) -> str:
        """
        Send prompt to Gemini and return response text.

        Args:
            prompt: The prompt text

        Returns:
            Generated text from Gemini

        Raises:
            RuntimeError: If Gemini request fails
        """
        try:
            logger.info(f"Gemini request: {len(prompt)} chars")

            response = self.client.generate_content(
                prompt,
                generation_config=self.genai.types.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=512,
                ),
            )

            # Extract text from response
            answer = response.text  # type: ignore
            logger.info("✓ Gemini response received successfully")
            return answer  # type: ignore

        except self.genai.types.BlockedPromptException as e:
            logger.warning(f"✗ Gemini blocked prompt: {str(e)}")
            raise RuntimeError(  # noqa: B904
                f"Gemini blocked this request (content policy): {str(e)}"
            )

        except Exception as e:  # noqa: B904
            logger.error(f"✗ Gemini request failed: {str(e)}")
            raise RuntimeError(f"Gemini request failed: {str(e)}")  # noqa: B904


# Shared instance
gemini_adapter = GeminiAdapter()
