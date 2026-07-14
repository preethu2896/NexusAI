"""
ChatService — Orchestrates RAG Retrieval, Generation, and Persistence phases.
"""
import logging
import uuid
import time
import re

from backend.app.services.document_service import DocumentService
from backend.app.generation.rag_generator import RAGGenerator
from backend.app.repositories.conversation_repository import ConversationRepository
from backend.app.repositories.message_repository import MessageRepository
from backend.app.schemas.chat import ChatQueryResponse
from backend.app.models.conversation import Conversation, Message

logger = logging.getLogger(__name__)


class ChatService:
    """
    Service layer coordinator for the Conversation Management Engine.
    Consumes DocumentService (Retrieval), RAGGenerator (Generation),
    and repositories for thread and message persistence.
    """

    def __init__(
        self,
        document_service: DocumentService,
        rag_generator: RAGGenerator,
        conversation_repo: ConversationRepository,
        message_repo: MessageRepository,
    ) -> None:
        self._document_service = document_service
        self._rag_generator = rag_generator
        self._conversation_repo = conversation_repo
        self._message_repo = message_repo

    async def create_conversation(
        self, title: str | None = None
    ) -> Conversation:
        """
        Create a new chat conversation thread.
        """
        return await self._conversation_repo.create_conversation(title=title)

    async def list_conversations(
        self, limit: int = 20, offset: int = 0
    ) -> list[Conversation]:
        """
        List all conversations, paginated.
        """
        return await self._conversation_repo.list_conversations(
            limit=limit, offset=offset
        )

    async def get_conversation(
        self, conversation_id: uuid.UUID
    ) -> Conversation | None:
        """
        Retrieve metadata for a single conversation.
        """
        return await self._conversation_repo.get_conversation(conversation_id)

    async def get_conversation_messages(
        self, conversation_id: uuid.UUID, limit: int = 50, offset: int = 0
    ) -> list[Message]:
        """
        Retrieve chronological message history for a conversation.
        """
        return await self._message_repo.get_messages_by_conversation(
            conversation_id=conversation_id, limit=limit, offset=offset
        )

    async def delete_conversation(self, conversation_id: uuid.UUID) -> bool:
        """
        Delete a conversation thread and all its messages.
        """
        return await self._conversation_repo.delete_conversation(
            conversation_id
        )

    async def query_document(
        self,
        conversation_id: uuid.UUID,
        document_id: uuid.UUID,
        question: str,
        top_k: int = 5,
    ) -> ChatQueryResponse:
        """
        Runs full RAG pipeline:
            1. Retrieves top-K context chunks.
            2. Generates grounded answer using LLM.
            3. Saves the User message to the thread history.
            4. Maps page citations to structured DB format.
            5. Saves the Assistant message to the thread history.
            6. Returns the query results.
        """
        start_time = time.perf_counter()

        # Step 1: Retrieve context chunks
        logger.info(
            "Retrieving top-%d chunks for document %s (Conv: %s)",
            top_k,
            document_id,
            conversation_id,
        )
        chunks = await self._document_service.search_document(
            document_id=document_id,
            query_text=question,
            limit=top_k,
        )

        # Step 2: Generate answer
        logger.info("Generating response for query: '%s'", question)
        answer = await self._rag_generator.generate_answer(
            question=question,
            chunks=chunks,
        )

        # Step 3: Persist User Message
        await self._message_repo.create_message(
            conversation_id=conversation_id,
            role="user",
            content=question,
        )

        # Step 4: Map citations to structured format
        cited_pages = [
            int(p)
            for p in re.findall(r"\[Page (\d+)\]", answer, re.IGNORECASE)
        ]
        cited_pages = sorted(list(set(cited_pages)))

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
            # If model cited a page number not in retrieved chunks
            if not matching_chunks:
                structured_citations.append(
                    {
                        "document_id": None,
                        "chunk_id": None,
                        "page": page,
                        "score": None,
                    }
                )

        # Step 5: Record latency
        latency_ms = (time.perf_counter() - start_time) * 1000.0

        # Step 6: Persist Assistant Message
        await self._message_repo.create_message(
            conversation_id=conversation_id,
            role="assistant",
            content=answer,
            citations=structured_citations,
            model_used=self._rag_generator._llm_client.model_name,
            latency_ms=round(latency_ms, 2),
        )

        return ChatQueryResponse(
            answer=answer,
            retrieved_chunks=chunks,
            citations=cited_pages,
            model_used=self._rag_generator._llm_client.model_name,
            latency_ms=round(latency_ms, 2),
        )
