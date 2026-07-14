"""
DocumentService — Orchestrates the document ingestion pipeline.

This service is the heart of Sprint A. It coordinates all ingestion steps
by calling port implementations (IFileStorage, IDocumentExtractor, ITextChunker)
and the repository (DocumentRepository) in the correct sequence.

Routes call this service exclusively. The service has zero knowledge of
HTTP, FastAPI, or SQLAlchemy — it operates purely through the ports and repo.
"""
import uuid
import logging
from fastapi import HTTPException, status

from backend.app.ports.storage import IFileStorage
from backend.app.ports.extractor import IDocumentExtractor
from backend.app.ports.chunker import ITextChunker
from backend.app.repositories.document_repository import DocumentRepository
from backend.app.schemas.document import (
    DocumentResponse,
    DocumentListResponse,
    DocumentDeleteResponse,
)

logger = logging.getLogger(__name__)


class DocumentService:
    """
    Orchestrates the full document ingestion pipeline.

    Injected dependencies (all behind protocols — swappable without code changes):
        repo     : DocumentRepository  — DB persistence
        storage  : IFileStorage        — Binary file persistence
        extractor: IDocumentExtractor  — Text extraction
        chunker  : ITextChunker        — Text segmentation
    """

    def __init__(
        self,
        repo: DocumentRepository,
        storage: IFileStorage,
        extractor: IDocumentExtractor,
        chunker: ITextChunker,
    ) -> None:
        self._repo = repo
        self._storage = storage
        self._extractor = extractor
        self._chunker = chunker

    # ------------------------------------------------------------------
    # Ingest
    # ------------------------------------------------------------------

    async def ingest(
        self,
        filename: str,
        content_type: str,
        file_bytes: bytes,
        title: str | None,
    ) -> DocumentResponse:
        """
        Execute the full ingestion pipeline for an uploaded document.

        Pipeline steps:
            1. Validate file type against extractor support.
            2. Save file bytes to storage.
            3. Create Document DB record (status: pending).
            4. Update status to 'processing'.
            5. Extract text per page.
            6. Chunk the extracted text.
            7. Bulk insert chunks into PostgreSQL.
            8. Update status to 'indexed' with final page_count.

        On any pipeline failure after the DB record is created, the status
        is set to 'failed' and the error is logged before re-raising.

        Args:
            filename: Original filename from the upload.
            content_type: MIME type of the uploaded file.
            file_bytes: Raw binary content of the file.
            title: Optional user-provided title. Defaults to filename.

        Returns:
            DocumentResponse with the final indexed document metadata.

        Raises:
            HTTPException 400: If the file type is not supported.
            HTTPException 500: If the ingestion pipeline fails.
        """
        # Step 1: Validate file type
        if not self._extractor.supports(content_type):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Unsupported file type '{content_type}'. "
                    f"Only PDF files are accepted in this version."
                ),
            )

        document_id = uuid.uuid4()
        resolved_title = title or filename

        # Step 2: Save file to storage
        storage_path = await self._storage.save(
            file_id=str(document_id),
            content=file_bytes,
        )

        # Step 3: Create document DB record
        document = await self._repo.create_document(
            filename=filename,
            title=resolved_title,
            storage_path=storage_path,
            file_size_bytes=len(file_bytes),
        )

        # Steps 4–8: Run ingestion pipeline (extraction + chunking)
        try:
            # Step 4: Mark as processing
            await self._repo.update_status(document.id, "processing")

            # Step 5: Extract text
            logger.info(
                "Extracting text from document %s (%s)",
                document.id, filename
            )
            pages = await self._extractor.extract(storage_path)

            if not pages:
                raise ValueError("Extractor returned no pages.")

            # Step 6: Chunk the text
            logger.info(
                "Chunking document %s — %d pages extracted",
                document.id, len(pages)
            )
            chunks = self._chunker.chunk(pages)

            # Step 7: Bulk insert chunks
            logger.info(
                "Persisting %d chunks for document %s",
                len(chunks), document.id
            )
            await self._repo.create_chunks(document.id, chunks)

            # Step 8: Mark as indexed
            await self._repo.update_status(
                document.id,
                status="indexed",
                page_count=len(pages),
            )
            logger.info("Document %s successfully indexed.", document.id)

        except Exception as exc:
            # Fail gracefully: mark document as failed, log, re-raise as HTTP 500
            logger.exception(
                "Ingestion pipeline failed for document %s: %s",
                document.id, exc
            )
            await self._repo.update_status(document.id, "failed")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Document ingestion failed: {exc}",
            ) from exc

        # Re-fetch to get updated state with chunk_count
        refreshed = await self._repo.get_by_id(document.id)
        return self._repo.to_response(refreshed)

    # ------------------------------------------------------------------
    # Read operations
    # ------------------------------------------------------------------

    async def get_document(self, document_id: uuid.UUID) -> DocumentResponse:
        """
        Retrieve full metadata for a single document.

        Raises:
            HTTPException 404: If the document does not exist.
        """
        document = await self._repo.get_by_id(document_id)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document {document_id} not found.",
            )
        return self._repo.to_response(document)

    async def list_documents(
        self, limit: int = 20, offset: int = 0
    ) -> DocumentListResponse:
        """Return a paginated list of all documents."""
        total, documents = await self._repo.list_documents(
            limit=limit, offset=offset
        )
        return DocumentListResponse(
            total=total,
            items=[self._repo.to_response(doc) for doc in documents],
        )

    # ------------------------------------------------------------------
    # Delete
    # ------------------------------------------------------------------

    async def delete_document(
        self, document_id: uuid.UUID
    ) -> DocumentDeleteResponse:
        """
        Delete a document, its chunks, and its stored file.

        The DB cascades handle chunk deletion. The file is deleted from
        storage after the DB row is removed. If storage deletion fails,
        the error is logged but does not fail the API response (the DB
        record is already gone — orphaned files can be cleaned up
        separately in v0.4.0 with a reconciliation job).

        Raises:
            HTTPException 404: If the document does not exist.
        """
        document = await self._repo.get_by_id(document_id)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document {document_id} not found.",
            )

        storage_path = document.storage_path

        # Delete DB record (chunks cascade automatically)
        await self._repo.delete_document(document)

        # Best-effort file deletion
        try:
            await self._storage.delete(storage_path)
        except FileNotFoundError:
            logger.warning(
                "File not found during deletion of document %s at path %s",
                document_id, storage_path
            )

        return DocumentDeleteResponse(document_id=document_id, deleted=True)
