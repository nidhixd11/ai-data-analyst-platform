from typing import Protocol, runtime_checkable


@runtime_checkable
class LLMProvider(Protocol):
    """
    The contract every LLM adapter must follow.

    Think of this as the socket standard — Groq, Ollama, and Gemini
    are all different plugs, but they must all fit this same socket.

    Any class that implements complete() automatically qualifies
    as an LLMProvider — no inheritance needed.

    The @runtime_checkable decorator means you can do:
        isinstance(some_adapter, LLMProvider)
    at runtime to verify an adapter actually follows the contract.
    """

    def complete(self, prompt: str) -> str:
        """
        Send a prompt to the LLM and return its response.

        Arguments:
            prompt → the fully built prompt string from T-120 PromptBuilder

        Returns:
            The LLM's response as a plain string.

        Every adapter (Groq, Ollama, Gemini) must implement this
        exact signature. The router calls this method without
        knowing or caring which provider is underneath.
        """
        ...
