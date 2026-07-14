"""
MessageRepository — SQL operations for the Message model.
"""
import uuid
import logging
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models.conversation import Message

logger = logging.getLogger(__name__)


class MessageRepository:
    """
    Handles database operations for individual chat messages.
    """

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def create_message(
        self,
        conversation_id: uuid.UUID,
        role: str,
        content: str,
        citations: list[dict] | None = None,
        model_used: str | None = None,
        latency_ms: float | None = None,
    ) -> Message:
        """
        Create and persist a new Message in a conversation.
        """
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            citations=citations,
            model_used=model_used,
            latency_ms=latency_ms,
        )
        self._db.add(message)
        await self._db.commit()
        await self._db.refresh(message)
        return message

    async def get_messages_by_conversation(
        self,
        conversation_id: uuid.UUID,
        limit: int = 50,
        offset: int = 0,
    ) -> list[Message]:
        """
        Return the chronological chat history for a conversation.
        """
        query = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
            .limit(limit)
            .offset(offset)
        )
        result = await self._db.execute(query)
        return list(result.scalars().all())
