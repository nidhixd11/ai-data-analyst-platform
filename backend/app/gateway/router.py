"""
LLM Router: Routes requests to appropriate provider with fallback logic.
Providers tried in order: groq → gemini → ollama
"""


from app.gateway.base import LLMProvider
from app.gateway.groq_adapter import groq_adapter
from app.gateway.ollama_adapter import ollama_adapter
from app.log_config import logger
from app.settings import settings

# Safe import for Gemini — may not be merged yet (teammate's T-125)
try:
    from app.gateway.gemini_adapter import gemini_adapter
except ImportError:
    gemini_adapter = None
    logger.warning(
        "GeminiAdapter not found — T-125 may not be merged yet. "
        "Gemini will be skipped in the fallback chain."
    )


class ModelRouter:
    """Routes prompts to LLM providers with fallback strategy."""

    def __init__(self):
        # Registry — maps model_id strings to adapter instances
        self.providers: dict[str, LLMProvider | None] = {
            "groq": groq_adapter,
            "ollama": ollama_adapter,
            "gemini": gemini_adapter,
        }

        # Fallback chain — order matters
        # Groq first (fastest), Gemini second (free cloud), Ollama last (local only)
        self.fallback_chain: list[tuple[str, LLMProvider | None]] = [
            ("groq", groq_adapter),
            ("gemini", gemini_adapter),
            ("ollama", ollama_adapter),
        ]

    def route(self, prompt: str, model_id: str | None = None) -> str:
        """
        Route prompt to specified model with fallback.

        Arguments:
            prompt   → the fully built prompt string from T-120 PromptBuilder
            model_id → optional provider name ("groq", "ollama", "gemini")
                       defaults to settings.default_llm_provider if not given

        Returns:
            LLM response as a plain string.

        Raises:
            RuntimeError → if all providers in the fallback chain fail
        """
        requested = model_id or settings.default_llm_provider
        logger.info(
            f"ModelRouter received request | requested provider={requested}")

        # Step 1 — try the specifically requested provider first
        provider = self.providers.get(requested)

        if provider is not None:
            try:
                logger.info(f"Trying requested provider: {requested}")
                answer = provider.complete(prompt)
                logger.info(f"Provider '{requested}' responded successfully")
                return answer
            except Exception as e:
                logger.error(
                    f"Provider '{requested}' failed: {e} — "
                    f"falling back to fallback chain"
                )
        else:
            logger.warning(
                f"Requested provider '{requested}' is not available "
                f"— going straight to fallback chain"
            )

        # Step 2 — work through the fallback chain in order
        for name, fallback_provider in self.fallback_chain:

            # Skip the one we already tried
            if name == requested:
                continue

            # Skip providers that aren't available
            if fallback_provider is None:
                logger.warning(f"Skipping '{name}' — adapter not available")
                continue

            try:
                logger.info(f"Trying fallback provider: {name}")
                answer = fallback_provider.complete(prompt)
                logger.info(
                    f"Fallback provider '{name}' responded successfully")
                return answer
            except Exception as e:
                logger.error(f"Fallback provider '{name}' failed: {e}")
                continue

        # Step 3 — everything failed
        logger.error("All LLM providers failed — no response available")
        raise RuntimeError(
            "All LLM providers failed. Please try again later or "
            "check that at least one provider is configured correctly."
        )


# Shared instance
model_router = ModelRouter()
