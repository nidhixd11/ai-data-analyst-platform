from groq import Groq

from app.log_config import logger
from app.settings import settings


class GroqAdapter:
    """
    Adapter for the Groq LLM provider.

    Wraps the Groq SDK so the rest of the app never has to know
    about Groq's specific API format. All it sees is complete().

    Think of this as the travel adapter —
    your app's plug goes in one side,
    Groq's foreign socket is on the other.
    """

    def __init__(self, model: str = "llama-3.1-70b-versatile"):
        """
        Sets up the Groq client with the API key from settings.
        model → which Groq-hosted model to use.
        Defaults to llama-3.1-70b-versatile — large, high quality.
        """
        self.model = model

        # Guard — give a clean error if the key isn't set in .env
        if not settings.groq_api_key:
            raise ValueError("GROQ_API_KEY is not set in .env")

        # .get_secret_value() unwraps Pydantic's SecretStr to get the real string
        # SecretStr hides the key in logs — .get_secret_value() is the only way to read it
        self.client = Groq(api_key=settings.groq_api_key.get_secret_value())

    def complete(self, prompt: str) -> str:
        """
        Sends the prompt to Groq and returns the response as a string.

        This is the method that satisfies the LLMProvider protocol.
        The router calls this without knowing anything about Groq.

        Arguments:
            prompt → the fully built prompt string from T-120 PromptBuilder

        Returns:
            The LLM's response as a plain string.
        """
        try:
            logger.info(f"Sending prompt to Groq | model={self.model}")

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    # system message sets the AI's behaviour
                    {
                        "role": "system",
                        "content": "You are a careful data analyst. Answer only using the provided data context.",
                    },
                    # user message is the actual prompt from PromptBuilder
                    {"role": "user", "content": prompt},
                ],
                temperature=0.2,  # low = focused, factual answers. high = creative, unpredictable
                max_tokens=1024,  # cap the response length
            )

            # Extract the text from Groq's response object
            answer = response.choices[0].message.content
            logger.info("Groq response received successfully")
            return answer  # type: ignore

        except Exception as e:
            # Log the error and raise it so the router (T-127) can
            # catch it and fall back to the next provider
            logger.error(f"Groq request failed: {e}")
            raise


# Shared instance — same pattern as everything else in the codebase
groq_adapter = GroqAdapter()
