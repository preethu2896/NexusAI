"""
OpenAIStreamingClient — Concrete adapter for streaming text tokens from OpenAI Chat API.
"""
import logging
from typing import AsyncGenerator
from openai import AsyncOpenAI
from backend.app.ports.streaming_llm import IStreamingLLMClient

logger = logging.getLogger(__name__)


class OpenAIStreamingClient(IStreamingLLMClient):
    """
    Adapter implementing IStreamingLLMClient for OpenAI's Chat Completions API with streaming.
    """

    def __init__(
        self,
        api_key: str,
        model_name: str,
        temperature: float = 0.0,
        max_tokens: int = 1024,
    ) -> None:
        if not api_key:
            logger.warning(
                "OpenAI API key is missing. Streaming query calls will fail."
            )
        self._client = AsyncOpenAI(api_key=api_key)
        self._model_name = model_name
        self._temperature = temperature
        self._max_tokens = max_tokens

    async def stream_generate(
        self, system_prompt: str, user_prompt: str
    ) -> AsyncGenerator[str, None]:
        """
        Calls OpenAI completions endpoint asynchronously with stream=True.
        """
        logger.info(
            "Starting OpenAI API stream using model: %s", self._model_name
        )
        try:
            response = await self._client.chat.completions.create(
                model=self._model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=self._temperature,
                max_tokens=self._max_tokens,
                stream=True,
            )
            async for chunk in response:
                if chunk.choices and chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except Exception as exc:
            logger.exception(
                "Failed to stream generate from OpenAI API: %s", exc
            )
            raise exc

    @property
    def model_name(self) -> str:
        return self._model_name
