import httpx
from app.settings import settings
from app.log_config import logger


class OllamaAdapter:
    """
    Adapter for Ollama — a local LLM runner.

    Unlike Groq and Gemini which are cloud services,
    Ollama runs entirely on your machine inside Docker.
    No API key needed — just an HTTP request to localhost.

    Local dev only — not deployed to Render (insufficient RAM on free tier).
    In production, Groq (primary) and Gemini (fallback) replace this.

    First-time setup:
        docker exec chatbot_ollama ollama pull llama3.2
    """

    def __init__(self, model: str = "llama3.2"):
        """
        Sets up the adapter with the Ollama host URL from settings
        and the model name to use.

        model → which locally downloaded model to use.
        Defaults to llama3.2 — small, fast, works well on laptops.

        The host URL comes from settings.ollama_base_url which maps to
        OLLAMA_BASE_URL in docker-compose → http://ollama:11434 inside Docker
        and defaults to http://localhost:11434 for bare-metal local dev.
        """
        self.model = model
        self.base_url = settings.ollama_base_url
        self.generate_url = f"{self.base_url}/api/generate"

        # Generous timeout — Ollama runs on your CPU, not cloud servers.
        # A complex prompt can take 30-60 seconds on a typical laptop.
        self.timeout = 120.0

    def complete(self, prompt: str) -> str:
        """
        Sends the prompt to the local Ollama server and returns the response.

        This is the method that satisfies the LLMProvider protocol.
        The router calls this without knowing anything about Ollama.

        Arguments:
            prompt → the fully built prompt string from T-120 PromptBuilder

        Returns:
            The LLM's response as a plain string.

        Raises:
            ConnectionError  → if Ollama isn't running (Docker not started)
            RuntimeError     → if the request fails for any other reason
        """
        try:
            logger.info(
                f"Sending prompt to Ollama | model={self.model} | url={self.generate_url}"
            )

            # Send a plain HTTP POST request — no SDK needed
            # This is exactly like submitting a form on a website
            response = httpx.post(
                self.generate_url,
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,   # give us the full response at once
                },
                timeout=self.timeout,
            )

            # If Ollama returned an HTTP error (4xx, 5xx), raise it immediately
            response.raise_for_status()

            # Parse the JSON response and extract the answer text
            data = response.json()
            answer = data.get("response", "")

            if not answer:
                raise RuntimeError("Ollama returned an empty response")

            logger.info("Ollama response received successfully")
            return answer

        except httpx.ConnectError:
            # This happens when Ollama isn't running at all
            # Most likely Docker isn't started or ollama container is down
            logger.error(
                f"Could not connect to Ollama at {self.base_url}. "
                "Is Docker running? Try: docker compose up ollama"
            )
            raise ConnectionError(
                f"Ollama is not reachable at {self.base_url}. "
                "Start Docker and ensure the ollama container is running."
            )

        except httpx.TimeoutException:
            # The model took too long to respond
            logger.error(
                f"Ollama request timed out after {self.timeout}s | model={self.model}"
            )
            raise RuntimeError(
                f"Ollama timed out after {self.timeout} seconds. "
                "Try a smaller model or simplify the prompt."
            )

        except Exception as e:
            # Catch everything else and re-raise for the router to handle
            logger.error(f"Ollama request failed: {e}")
            raise


# Shared instance — same pattern as groq_adapter, session_store etc.
ollama_adapter = OllamaAdapter()
