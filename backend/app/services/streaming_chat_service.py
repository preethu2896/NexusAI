"""
StreamingChatService — Orchestrates streaming response flows and SSE generation.
"""
import asyncio
import logging
import uuid
import time
import re
from typing import AsyncGenerator

from backend.app.services.document_service import DocumentService
from backend.app.ports.streaming_llm import IStreamingLLMClient
from backend.app.prompt.prompt_builder import PromptBuilder
from backend.app.repositories.conversation_repository import ConversationRepository
from backend.app.repositories.message_repository import MessageRepository
from backend.app.streaming.token_stream import format_sse

logger = logging.getLogger(__name__)


class StreamingChatService:
    """
    Coordinates real-time retrieval-augmented response streams.
    Saves message and citation data only upon successful completion.
    """

    def __init__(
        self,
        document_service: DocumentService,
        llm_client: IStreamingLLMClient,
        conversation_repo: ConversationRepository,
        message_repo: MessageRepository,
        max_context_tokens: int = 3000,
    ) -> None:
        self._document_service = document_service
        self._llm_client = llm_client
        self._conversation_repo = conversation_repo
        self._message_repo = message_repo
        self._prompt_builder = PromptBuilder(
            max_context_tokens=max_context_tokens,
            model_name=llm_client.model_name,
        )

    async def query_document_stream(
        self,
        conversation_id: uuid.UUID,
        document_id: uuid.UUID,
        question: str,
        top_k: int = 5,
    ) -> AsyncGenerator[str, None]:
        """
        Stream RAG query response tokens.
        If client cancels, the generator task terminates, preventing DB writes.
        """
        start_time = time.perf_counter()
        full_answer_list = []

        try:
            # Step 1: Retrieve context chunks
            logger.info(
                "Streaming: retrieving top-%d chunks (Conv: %s)",
                top_k,
                conversation_id,
            )
            chunks = await self._document_service.search_document(
                document_id=document_id,
                query_text=question,
                limit=top_k,
            )

            # Step 2: Build prompts
            system_prompt, user_prompt = self._prompt_builder.build_prompts(
                question=question,
                chunks=chunks,
            )

            # Step 3: Stream tokens from LLM Client
            logger.info("Streaming: invoking streaming LLM client...")
            async for token in self._llm_client.stream_generate(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
            ):
                full_answer_list.append(token)
                yield format_sse("token", {"content": token})

            # Stream finished successfully. Compile the answer
            answer = "".join(full_answer_list)

            # Step 4: Persist User Message
            await self._message_repo.create_message(
                conversation_id=conversation_id,
                role="user",
                content=question,
            )

            # Step 5: Map page citations and yield citation events
            cited_pages = [
                int(p)
                for p in re.findall(r"\[Page (\d+)\]", answer, re.IGNORECASE)
            ]
            cited_pages = sorted(list(set(cited_pages)))

            for page in cited_pages:
                yield format_sse("citation", {"page": page})

            # Build structured citations for message record
            structured_citations = []
            for page in cited_pages:
                matching_chunks = [c for c in chunks if c.page_number == page]
                for chunk in matching_chunks:
                    structured_citations.append(
                        {
                            "document_id": str(document_id),
                            "chunk_id": str(chunk.chunk_id),
                            "page": chunk.page_number,
                            "score": round(chunk.score, 4)
                            if chunk.score is not None
                            else None,
                        }
                    )
                if not matching_chunks:
                    structured_citations.append(
                        {
                            "document_id": None,
                            "chunk_id": None,
                            "page": page,
                            "score": None,
                        }
                    )

            # Step 6: Record latency
            latency_ms = (time.perf_counter() - start_time) * 1000.0

            # Step 7: Persist Assistant Message
            await self._message_repo.create_message(
                conversation_id=conversation_id,
                role="assistant",
                content=answer,
                citations=structured_citations,
                model_used=self._llm_client.model_name,
                latency_ms=round(latency_ms, 2),
            )

            # Step 8: Yield metadata and done events
            yield format_sse(
                "metadata",
                {
                    "model_used": self._llm_client.model_name,
                    "latency_ms": round(latency_ms, 2),
                }
            )
            yield format_sse("done")

        except asyncio.CancelledError:
            logger.warning(
                "Stream request was cancelled by client (Conv: %s)",
                conversation_id,
            )
            raise
        except Exception as exc:
            logger.exception(
                "Error occurred in StreamingChatService: %s", exc
            )
            yield format_sse("error", {"message": str(exc)})
            raise exc
