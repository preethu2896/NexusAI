"""
ChatService — Orchestrates RAG Retrieval and Generation phases.
"""
import logging
import uuid
import time
import re
from backend.app.services.document_service import DocumentService
from backend.app.generation.rag_generator import RAGGenerator
from backend.app.schemas.chat import ChatQueryResponse

logger = logging.getLogger(__name__)


class ChatService:
    """
    Service layer coordinator for the Answer Generation Engine.
    Consumes DocumentService (Retrieval) and RAGGenerator (Generation).
    """

    def __init__(
        self,
        document_service: DocumentService,
        rag_generator: RAGGenerator,
    ) -> None:
        self._document_service = document_service
        self._rag_generator = rag_generator

    async def query_document(
        self,
        conversation_id: uuid.UUID,
        document_id: uuid.UUID,
        question: str,
        top_k: int = 5,
    ) -> ChatQueryResponse:
        """
        Coordinates RAG workflow:
            1. Call DocumentService to retrieve chunks.
            2. Call RAGGenerator to generate grounded answer.
            3. Parse response to extract source page citations.
            4. Record latency and return response metadata.
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

        # Step 3: Extract citations (page numbers matching [Page X] format)
        cited_pages = [
            int(p)
            for p in re.findall(r"\[Page (\d+)\]", answer, re.IGNORECASE)
        ]
        citations = sorted(list(set(cited_pages)))

        # Step 4: Record latency
        latency_ms = (time.perf_counter() - start_time) * 1000.0

        return ChatQueryResponse(
            answer=answer,
            retrieved_chunks=chunks,
            citations=citations,
            model_used=self._rag_generator._llm_client.model_name,
            latency_ms=round(latency_ms, 2),
        )
