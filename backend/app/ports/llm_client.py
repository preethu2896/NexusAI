"""
ILLMClient — Abstract interface for text generation using Large Language Models.
"""
from typing import Protocol, runtime_checkable


@runtime_checkable
class ILLMClient(Protocol):
    """
    Defines the contract for interacting with LLM APIs (OpenAI, Claude, Gemini, etc.).
    This enables swappable models and providers without modifying service logic.
    """

    async def generate(self, system_prompt: str, user_prompt: str) -> str:
        """
        Send a system prompt and a user prompt to the LLM and return the generated text.

        Args:
            system_prompt: System role/instructions.
            user_prompt: User question/context.

        Returns:
            The generated response string from the LLM.
        """
        ...

    @property
    def model_name(self) -> str:
        """Return the canonical model identifier string."""
        ...
