"""
ConversationRepository — SQL operations for the Conversation model.
"""
import uuid
import logging
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.models.conversation import Conversation
from backend.app.models.user import User

logger = logging.getLogger(__name__)


class ConversationRepository:
    """
    Handles database operations for conversation threads.
    """

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_or_create_default_user_id(self) -> uuid.UUID:
        """
        Check for a default user to satisfy foreign key constraints.
        If it doesn't exist, seed it in-place.
        """
        query = select(User).where(User.email == "default@nexusai.dev")
        result = await self._db.execute(query)
        user = result.scalar_one_or_none()

        if user is None:
            logger.info(
                "Default user not found. Seeding default user default@nexusai.dev..."
            )
            user = User(
                email="default@nexusai.dev",
                hashed_password="mocked_password_since_no_auth",
                role="user",
            )
            self._db.add(user)
            await self._db.flush()  # Populates user.id
        return user.id

    async def create_conversation(
        self, title: str | None = None
    ) -> Conversation:
        """
        Create and persist a new Conversation thread.
        """
        user_id = await self.get_or_create_default_user_id()

        conversation = Conversation(
            user_id=user_id, title=title or "New Conversation"
        )
        self._db.add(conversation)
        await self._db.commit()
        await self._db.refresh(conversation)
        return conversation

    async def list_conversations(
        self, limit: int = 20, offset: int = 0
    ) -> list[Conversation]:
        """
        Return a paginated list of conversations ordered by updated_at descending.
        """
        query = (
            select(Conversation)
            .order_by(Conversation.updated_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await self._db.execute(query)
        return list(result.scalars().all())

    async def get_conversation(
        self, conversation_id: uuid.UUID
    ) -> Conversation | None:
        """
        Fetch a single Conversation by its UUID.
        """
        query = select(Conversation).where(
            Conversation.id == conversation_id
        )
        result = await self._db.execute(query)
        return result.scalar_one_or_none()

    async def delete_conversation(self, conversation_id: uuid.UUID) -> bool:
        """
        Delete a Conversation by its UUID (triggers message cascades).
        """
        conversation = await self.get_conversation(conversation_id)
        if conversation is None:
            return False

        await self._db.delete(conversation)
        await self._db.commit()
        return True
