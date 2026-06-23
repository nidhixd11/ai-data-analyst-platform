"""
LLM Router: Routes requests to appropriate provider with fallback logic.
Providers tried in order: groq → ollama → gemini (if available)
"""

import logging

from app.gateway.groq_adapter import GroqAdapter
from app.gateway.ollama_adapter import OllamaAdapter

logger = logging.getLogger(__name__)


class ModelRouter:
    """Routes prompts to LLM providers with fallback strategy."""

    def __init__(self):
        self.providers = {
            "groq": GroqAdapter(),
            "ollama": OllamaAdapter(),
            # "gemini": GeminiAdapter(),  # T-125 — add when ready
        }
        # Fallback order
        self.fallback_order = ["groq", "ollama"]


def route(self, model_id: str, prompt: str) -> str:
    """
    Route prompt to specified model, with fallback.

    Args:
        model_id: "groq", "ollama", or "gemini"
        prompt: The prompt text

    Returns:
        LLM response text

    Raises:
        ValueError: If all providers fail
    """
    # Use specified model if available
    if model_id in self.providers:
        try:
            logger.info(f"Routing to {model_id}")
            response: str = self.providers[model_id].complete(prompt)  # type: ignore
            logger.info(f"✓ {model_id} succeeded")
            return response
        except Exception as e:
            logger.warning(f"✗ {model_id} failed: {str(e)}")

    # Try fallback providers
    for fallback_id in self.fallback_order:
        if fallback_id == model_id:
            continue
        try:
            logger.info(f"Falling back to {fallback_id}")
            response: str = self.providers[fallback_id].complete(prompt)  # type: ignore
            logger.info(f"✓ {fallback_id} succeeded (fallback)")
            return response
        except Exception as e:
            logger.warning(f"✗ {fallback_id} also failed: {str(e)}")

    # All failed
    raise ValueError(f"All LLM providers failed. Tried: {model_id}, then {self.fallback_order}")
