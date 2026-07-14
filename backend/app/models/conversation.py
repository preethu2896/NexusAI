import uuid
from sqlalchemy import String, Text, ForeignKey, JSON, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, TYPE_CHECKING
from backend.app.core.database import Base, TimestampMixin

if TYPE_CHECKING:
    from backend.app.models.user import User

class Conversation(Base, TimestampMixin):
    """
    Conversation thread database model. Groups messages for a user session.
    """
    __tablename__ = "conversations"
    
    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    title: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )
    
    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        back_populates="conversations"
    )
    messages: Mapped[List["Message"]] = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan"
    )

class Message(Base, TimestampMixin):
    """
    Message database model. Stores individual messages within a conversation.
    """
    __tablename__ = "messages"
    
    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    conversation_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("conversations.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    role: Mapped[str] = mapped_column(
        String(50),
        nullable=False # 'user', 'assistant', 'system'
    )
    content: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )
    citations: Mapped[list | None] = mapped_column(
        JSON,
        nullable=True
    )
    model_used: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )
    latency_ms: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )
    
    # Relationships
    conversation: Mapped["Conversation"] = relationship(
        "Conversation",
        back_populates="messages"
    )
