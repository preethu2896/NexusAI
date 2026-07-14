from backend.app.core.database import Base
from backend.app.models.user import User
from backend.app.models.conversation import Conversation, Message
from backend.app.models.document import Document, DocumentChunk, EmbeddingMetadata

# Gather all models in one list for ease of import by Alembic and metadata tools
__all__ = [
    "Base",
    "User",
    "Conversation",
    "Message",
    "Document",
    "DocumentChunk",
    "EmbeddingMetadata"
]
