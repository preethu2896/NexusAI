"""
DocumentRepository — All database reads and writes for Document and DocumentChunk.

This is the ONLY place in the application that touches SQLAlchemy directly
for document-related operations. Services call this repository; routes never
call it directly. This enforces the Repository Pattern and makes the DB layer
independently testable by swapping the session with a mock.
"""
import uuid
from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from backend.app.models.document import Document, DocumentChunk
from backend.app.ports.chunker import ChunkData
from backend.app.schemas.document import DocumentResponse


class DocumentRepository:
    """
    Encapsulates all database operations for the Ingestion Pipeline module.

    Args:
        db: An active AsyncSession injected per-request via FastAPI Depends().
    """

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    # ------------------------------------------------------------------
    # Document operations
    # ------------------------------------------------------------------

    async def create_document(
        self,
        filename: str,
        title: str,
        storage_path: str,
        file_size_bytes: int,
    ) -> Document:
        """
        Insert a new Document row with status 'pending'.

        Args:
            filename: Original name of the uploaded file.
            title: Human-readable title (defaults to filename if not provided).
            storage_path: Path where the file was saved on disk.
            file_size_bytes: Raw size of the uploaded file.

        Returns:
            The newly created, persisted Document ORM object.
        """
        document = Document(
            filename=filename,
            title=title,
            storage_path=storage_path,
            file_size_bytes=file_size_bytes,
            processing_status="pending",
        )
        self._db.add(document)
        await self._db.commit()
        await self._db.refresh(document)
        return document

    async def get_by_id(self, document_id: uuid.UUID) -> Document | None:
        """
        Fetch a single document by UUID, eagerly loading its chunks count.

        Returns:
            Document ORM object, or None if not found.
        """
        result = await self._db.execute(
            select(Document)
            .options(selectinload(Document.chunks))
            .where(Document.id == document_id)
        )
        return result.scalar_one_or_none()

    async def list_documents(
        self, limit: int = 20, offset: int = 0
    ) -> tuple[int, list[Document]]:
        """
        Return a paginated list of documents with total count.

        Returns:
            (total_count, page_of_documents)
        """
        # Total count query
        count_result = await self._db.execute(
            select(func.count()).select_from(Document)
        )
        total = count_result.scalar_one()

        # Paginated query with chunks pre-loaded for chunk_count
        result = await self._db.execute(
            select(Document)
            .options(selectinload(Document.chunks))
            .order_by(Document.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        documents = list(result.scalars().all())
        return total, documents

    async def update_status(
        self,
        document_id: uuid.UUID,
        status: str,
        page_count: int | None = None,
    ) -> None:
        """
        Update the processing_status (and optionally page_count) of a document.

        Uses a targeted UPDATE statement rather than fetching the full object
        to minimise round-trips during the ingestion pipeline.
        """
        values: dict = {"processing_status": status}
        if page_count is not None:
            values["page_count"] = page_count

        await self._db.execute(
            update(Document)
            .where(Document.id == document_id)
            .values(**values)
        )
        await self._db.commit()

    async def delete_document(self, document: Document) -> None:
        """
        Delete a document and all its chunks (cascade handles chunks).

        Args:
            document: The Document ORM object to delete.
        """
        await self._db.delete(document)
        await self._db.commit()

    # ------------------------------------------------------------------
    # Chunk operations
    # ------------------------------------------------------------------

    async def create_chunks(
        self,
        document_id: uuid.UUID,
        chunks: list[ChunkData],
    ) -> None:
        """
        Bulk insert all document chunks in a single transaction.

        Using bulk add_all() is significantly faster than individual INSERT
        statements for documents with hundreds of chunks.

        Args:
            document_id: The parent document's UUID.
            chunks: Ordered list of ChunkData from the chunker.
        """
        orm_chunks = [
            DocumentChunk(
                document_id=document_id,
                chunk_index=i,
                content=chunk.text,
                page_number=chunk.page_number,
                char_start=chunk.char_start,
                char_end=chunk.char_end,
                token_count=chunk.token_count,
            )
            for i, chunk in enumerate(chunks)
        ]
        self._db.add_all(orm_chunks)
        await self._db.commit()

    # ------------------------------------------------------------------
    # Schema conversion helpers
    # ------------------------------------------------------------------

    @staticmethod
    def to_response(document: Document) -> DocumentResponse:
        """
        Convert a Document ORM object to a DocumentResponse Pydantic schema.

        This is the only place ORM→schema conversion happens for documents,
        keeping serialisation logic out of routes and services.
        """
        return DocumentResponse(
            document_id=document.id,
            filename=document.filename,
            title=document.title or document.filename,
            status=document.processing_status,
            file_size_bytes=document.file_size_bytes,
            page_count=document.page_count,
            chunk_count=len(document.chunks) if document.chunks else 0,
            created_at=document.created_at,
            updated_at=document.updated_at,
        )
