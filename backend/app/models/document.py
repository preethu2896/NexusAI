import uuid
from sqlalchemy import String, Integer, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, TYPE_CHECKING
from backend.app.core.database import Base, TimestampMixin

if TYPE_CHECKING:
    from backend.app.models.user import User


class Document(Base, TimestampMixin):
    """
    Document database model.

    Tracks every PDF uploaded by a user. The processing_status column
    reflects where the document is in the ingestion pipeline:
        pending → processing → indexed → failed
    """
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=True  # Nullable for MVP (no auth). Made required in v0.4.0.
    )
    filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )
    title: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True  # Defaults to filename if not provided by the user
    )
    storage_path: Mapped[str] = mapped_column(
        String(512),
        nullable=False  # Relative path under UPLOAD_DIR (e.g. "uploads/{id}.pdf")
    )
    file_size_bytes: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )
    page_count: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True  # Populated after successful text extraction
    )
    processing_status: Mapped[str] = mapped_column(
        String(50),
        default="pending",
        nullable=False
        # Values: "pending" | "processing" | "indexed" | "failed"
    )

    # Relationships
    user: Mapped["User | None"] = relationship(
        "User",
        back_populates="documents"
    )
    chunks: Mapped[List["DocumentChunk"]] = relationship(
        "DocumentChunk",
        back_populates="document",
        cascade="all, delete-orphan"
    )


class DocumentChunk(Base, TimestampMixin):
    """
    DocumentChunk database model.

    Stores an individual text segment produced by the ingestion chunker.
    Each chunk maps to a source page and character range in the original document,
    enabling precise citations in query responses.

    Note: The actual embedding vector is stored in ChromaDB (Sprint B),
    not here. This table holds only the text and positional metadata.
    """
    __tablename__ = "document_chunks"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    document_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("documents.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    chunk_index: Mapped[int] = mapped_column(
        Integer,
        nullable=False  # Sequential position of this chunk within the document
    )
    content: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )
    page_number: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True  # Source page in the original PDF
    )
    char_start: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True  # Character offset start in the full concatenated document text
    )
    char_end: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True  # Character offset end in the full concatenated document text
    )
    token_count: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True  # Approximate token count — used for LLM context window budgeting
    )

    # Relationships
    document: Mapped["Document"] = relationship(
        "Document",
        back_populates="chunks"
    )
    embedding_metadata: Mapped["EmbeddingMetadata | None"] = relationship(
        "EmbeddingMetadata",
        back_populates="chunk",
        cascade="all, delete-orphan",
        uselist=False  # One-to-one: one embedding record per chunk
    )


class EmbeddingMetadata(Base, TimestampMixin):
    """
    EmbeddingMetadata database model.

    Stores the metadata about the embedding generated for a chunk.
    The actual vector is stored in ChromaDB (Sprint B); this table holds
    a reference to the ChromaDB document ID and the model used, enabling
    re-embedding with a different model if needed without re-chunking.
    """
    __tablename__ = "embedding_metadata"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    chunk_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("document_chunks.id", ondelete="CASCADE"),
        unique=True,  # Enforces the one-to-one relationship at the DB level
        index=True,
        nullable=False
    )
    chroma_document_id: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True  # The ID used to reference this chunk inside ChromaDB
    )
    vector_dimension: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )
    model_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True  # e.g. "text-embedding-3-small", "BAAI/bge-base-en-v1.5"
    )

    # Relationships
    chunk: Mapped["DocumentChunk"] = relationship(
        "DocumentChunk",
        back_populates="embedding_metadata"
    )
