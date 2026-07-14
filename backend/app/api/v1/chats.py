"""
Chat routes — Presentation layer for the RAG Generation Engine.
"""
import uuid
import logging
from fastapi import APIRouter, Depends, status, Query

from backend.app.dependencies import get_chat_service
from backend.app.services.chat_service import ChatService
from backend.app.schemas.chat import ChatQueryRequest

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/chats/{conversation_id}/query",
    status_code=status.HTTP_200_OK,
    summary="Query a document and generate a grounded answer",
    description=(
        "Run the full RAG pipeline: search for relevant chunks in the specified "
        "document, construct a grounded prompt, call the LLM, and return the answer "
        "along with citations and source chunks."
    ),
    tags=["chats"],
)
async def query_document(
    conversation_id: uuid.UUID,
    payload: ChatQueryRequest,
    document_id: uuid.UUID = Query(
        ..., description="The ID of the document to search."
    ),
    service: ChatService = Depends(get_chat_service),
):
    """
    Run RAG generation query against a specific document.
    """
    result = await service.query_document(
        conversation_id=conversation_id,
        document_id=document_id,
        question=payload.question,
        top_k=payload.top_k,
    )
    return {
        "success": True,
        "data": result.model_dump(mode="json"),
        "error": None,
    }
