"""
RAGGenerator — Orchestrates prompt building and LLM generation.
"""
import logging
from backend.app.ports.llm_client import ILLMClient
from backend.app.prompt.prompt_builder import PromptBuilder
from backend.app.schemas.document import ChunkSearchResponse

logger = logging.getLogger(__name__)


class RAGGenerator:
    """
    Coordinates prompt construction and model queries for grounded generations.
    """

    def __init__(
        self,
        llm_client: ILLMClient,
        max_context_tokens: int = 3000,
    ) -> None:
        self._llm_client = llm_client
        self._prompt_builder = PromptBuilder(
            max_context_tokens=max_context_tokens,
            model_name=llm_client.model_name,
        )

    async def generate_answer(
        self,
        question: str,
        chunks: list[ChunkSearchResponse],
    ) -> str:
        """
        Assemble prompts, invoke the LLM client, and return the generated answer text.
        """
        system_prompt, user_prompt = self._prompt_builder.build_prompts(
            question=question,
            chunks=chunks,
        )
        return await self._llm_client.generate(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
        )
