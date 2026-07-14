"""
OpenAILLMClient — Concrete adapter for OpenAI Chat Completions API.
"""
import logging
from openai import AsyncOpenAI
from backend.app.ports.llm_client import ILLMClient

logger = logging.getLogger(__name__)


class OpenAILLMClient(ILLMClient):
    """
    Adapter implementing ILLMClient for OpenAI's Chat Completions API.
    """

    def __init__(
        self,
        api_key: str,
        model_name: str,
        temperature: float = 0.0,
        max_tokens: int = 1024,
    ) -> None:
        if not api_key:
            logger.warning("OpenAI API key is missing. Model queries will fail.")
        self._client = AsyncOpenAI(api_key=api_key)
        self._model_name = model_name
        self._temperature = temperature
        self._max_tokens = max_tokens

    async def generate(self, system_prompt: str, user_prompt: str) -> str:
        """
        Calls OpenAI completions endpoint asynchronously.
        """
        logger.info("Calling OpenAI API using model: %s", self._model_name)
        try:
            response = await self._client.chat.completions.create(
                model=self._model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=self._temperature,
                max_tokens=self._max_tokens,
            )
            # Extract content from response choice
            content = response.choices[0].message.content
            return content or ""
        except Exception as exc:
            logger.exception("Failed to generate response from OpenAI API: %s", exc)
            raise exc

    @property
    def model_name(self) -> str:
        return self._model_name
