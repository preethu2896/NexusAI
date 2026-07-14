"""
Chat routes — Presentation layer for the Conversation Management Engine.
"""
import uuid
import logging
from fastapi import APIRouter, Depends, status, Query, HTTPException
from fastapi.responses import StreamingResponse

from backend.app.dependencies import get_chat_service, get_streaming_chat_service
from backend.app.services.chat_service import ChatService
from backend.app.services.streaming_chat_service import StreamingChatService
from backend.app.schemas.chat import (
    ChatQueryRequest,
    ConversationCreateRequest,
    ConversationResponse,
    MessageResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/chats",
    status_code=status.HTTP_201_CREATED,
    summary="Create a new conversation thread",
    tags=["chats"],
)
async def create_conversation(
    payload: ConversationCreateRequest = None,
    service: ChatService = Depends(get_chat_service),
):
    """
    Create a new chat conversation thread.
    """
    title = payload.title if payload else None
    result = await service.create_conversation(title=title)
    return {
        "success": True,
        "data": ConversationResponse.model_validate(result).model_dump(
            mode="json"
        ),
        "error": None,
    }


@router.get(
    "/chats",
    status_code=status.HTTP_200_OK,
    summary="List all conversations",
    tags=["chats"],
)
async def list_conversations(
    limit: int = Query(20, ge=1, le=100, description="Max results per page."),
    offset: int = Query(0, ge=0, description="Offset."),
    service: ChatService = Depends(get_chat_service),
):
    """
    List conversations, paginated.
    """
    conversations = await service.list_conversations(
        limit=limit, offset=offset
    )
    return {
        "success": True,
        "data": [
            ConversationResponse.model_validate(c).model_dump(mode="json")
            for c in conversations
        ],
        "error": None,
    }


@router.get(
    "/chats/{conversation_id}",
    status_code=status.HTTP_200_OK,
    summary="Get conversation metadata",
    tags=["chats"],
)
async def get_conversation(
    conversation_id: uuid.UUID,
    service: ChatService = Depends(get_chat_service),
):
    """
    Fetch metadata of a single conversation thread.
    """
    result = await service.get_conversation(conversation_id)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation {conversation_id} not found.",
        )
    return {
        "success": True,
        "data": ConversationResponse.model_validate(result).model_dump(
            mode="json"
        ),
        "error": None,
    }


@router.get(
    "/chats/{conversation_id}/messages",
    status_code=status.HTTP_200_OK,
    summary="Get conversation message history",
    tags=["chats"],
)
async def get_conversation_messages(
    conversation_id: uuid.UUID,
    limit: int = Query(50, ge=1, le=100, description="Max messages to fetch."),
    offset: int = Query(0, ge=0, description="Offset."),
    service: ChatService = Depends(get_chat_service),
):
    """
    Retrieve chronological messages for a conversation.
    """
    conv = await service.get_conversation(conversation_id)
    if conv is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation {conversation_id} not found.",
        )
    messages = await service.get_conversation_messages(
        conversation_id=conversation_id, limit=limit, offset=offset
    )
    return {
        "success": True,
        "data": [
            MessageResponse.model_validate(m).model_dump(mode="json")
            for m in messages
        ],
        "error": None,
    }


@router.delete(
    "/chats/{conversation_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a conversation thread",
    tags=["chats"],
)
async def delete_conversation(
    conversation_id: uuid.UUID,
    service: ChatService = Depends(get_chat_service),
):
    """
    Hard delete a conversation thread and cascade delete its messages.
    """
    success = await service.delete_conversation(conversation_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation {conversation_id} not found.",
        )
    return {"success": True, "data": {"deleted": True}, "error": None}


@router.post(
    "/chats/{conversation_id}/query",
    status_code=status.HTTP_200_OK,
    summary="Query a document and generate a grounded answer within a thread",
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
    Run RAG generation query against a specific document, storing user/assistant history.
    """
    conv = await service.get_conversation(conversation_id)
    if conv is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation {conversation_id} not found.",
        )
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


@router.post(
    "/chats/{conversation_id}/stream",
    status_code=status.HTTP_200_OK,
    summary="Stream RAG query response using Server-Sent Events (SSE)",
    tags=["chats"],
)
async def query_document_stream(
    conversation_id: uuid.UUID,
    payload: ChatQueryRequest,
    document_id: uuid.UUID = Query(
        ..., description="The ID of the document to search."
    ),
    service: ChatService = Depends(get_chat_service),
    stream_service: StreamingChatService = Depends(get_streaming_chat_service),
):
    """
    Query a document and stream real-time tokens back to the user via SSE.
    """
    conv = await service.get_conversation(conversation_id)
    if conv is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation {conversation_id} not found.",
        )

    return StreamingResponse(
        stream_service.query_document_stream(
            conversation_id=conversation_id,
            document_id=document_id,
            question=payload.question,
            top_k=payload.top_k,
        ),
        media_type="text/event-stream",
    )
