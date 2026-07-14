"""
ILLMClient — Abstract interface for Large Language Model text generation.

Sprint A: Stub only. Implemented in Sprint C.

Current implementation : (none — Sprint C)
Future implementations  : OpenAIClient (gpt-4o-mini),
                          ClaudeClient (claude-3-haiku),
                          OllamaClient (local llama3 / mistral)
"""
from typing import Protocol, runtime_checkable, AsyncIterator


@runtime_checkable
class ILLMClient(Protocol):
    """
    Defines the contract for generating text completions from an LLM.

    All implementations must support both blocking (complete) and
    streaming (stream) modes to satisfy Sprint C and Sprint E respectively.
    """

    async def complete(self, messages: list[dict]) -> str:
        """
        Generate a single blocking text completion.

        Args:
            messages: OpenAI-format message list, e.g.:
                [{"role": "system", "content": "..."},
                 {"role": "user", "content": "..."}]

        Returns:
            The assistant's response as a plain string.

        Raises:
            RuntimeError: If the LLM API call fails or times out.
        """
        ...

    async def stream(self, messages: list[dict]) -> AsyncIterator[str]:
        """
        Stream a text completion token by token.

        Args:
            messages: OpenAI-format message list.

        Yields:
            Individual text tokens as they are received from the model.
        """
        ...

    @property
    def model_name(self) -> str:
        """Return the model identifier (e.g. 'gpt-4o-mini')."""
        ...
