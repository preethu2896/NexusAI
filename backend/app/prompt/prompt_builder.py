"""
PromptBuilder — Prepares the context block and user queries for the LLM.
"""
import logging
from backend.app.schemas.document import ChunkSearchResponse
from backend.app.prompt.templates import RAG_SYSTEM_PROMPT

logger = logging.getLogger(__name__)


class PromptBuilder:
    """
    Assembles system and user prompts, formatting document context
    and ensuring the input fits within the token budget.
    """

    def __init__(
        self,
        max_context_tokens: int = 3000,
        model_name: str = "gpt-4o-mini",
    ) -> None:
        self._max_context_tokens = max_context_tokens
        self._model_name = model_name
        self._tokenizer = None

        # Try to initialize tiktoken for precise token counting
        try:
            import tiktoken
            self._tokenizer = tiktoken.encoding_for_model(model_name)
        except Exception as exc:
            logger.warning(
                "Could not initialize tiktoken. Falling back to char-length estimation: %s",
                exc,
            )

    def count_tokens(self, text: str) -> int:
        """Count the number of tokens in a string."""
        if self._tokenizer is not None:
            return len(self._tokenizer.encode(text))
        # Fallback heuristic: 1 token ≈ 4 characters
        return len(text) // 4

    def build_prompts(
        self,
        question: str,
        chunks: list[ChunkSearchResponse],
    ) -> tuple[str, str]:
        """
        Assembles the system and user prompts.
        Truncates the context list if it exceeds the max_context_tokens budget.
        """
        system_prompt = RAG_SYSTEM_PROMPT

        # Format context chunks one by one, checking the token budget
        context_parts = []
        current_tokens = 0

        # Note: Chunks should already be sorted by similarity/distance in the service.
        # We add them until we run out of budget.
        for chunk in chunks:
            chunk_block = f"[Source Page: {chunk.page_number or 'Unknown'}]\n{chunk.content}\n\n"
            chunk_tokens = self.count_tokens(chunk_block)

            if current_tokens + chunk_tokens > self._max_context_tokens:
                logger.warning(
                    "Token budget exceeded (%d/%d). Truncating remaining chunks.",
                    current_tokens + chunk_tokens,
                    self._max_context_tokens,
                )
                break

            context_parts.append(chunk_block)
            current_tokens += chunk_tokens

        # Join all approved chunks into a single context string
        context_str = (
            "".join(context_parts) if context_parts else "No context available."
        )

        # Format the user prompt
        user_prompt = (
            f"RELEVANT DOCUMENT CONTEXT:\n"
            f"--- CONTEXT START ---\n"
            f"{context_str}"
            f"--- CONTEXT END ---\n\n"
            f"USER QUESTION: {question}\n\n"
            f"ANSWER:"
        )

        return system_prompt, user_prompt
