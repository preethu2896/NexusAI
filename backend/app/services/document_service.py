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

from backend.app.core.config import settings
from backend.app.ports.storage import IFileStorage
from backend.app.ports.extractor import IDocumentExtractor
from backend.app.ports.chunker import ITextChunker
from backend.app.ports.embedding import IEmbeddingModel
from backend.app.ports.vector_store import IVectorStore
from backend.app.models.document import EmbeddingMetadata
from backend.app.repositories.document_repository import DocumentRepository
from backend.app.schemas.document import (
    DocumentResponse,
    DocumentListResponse,
    DocumentDeleteResponse,
    ChunkSearchResponse,
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
        embedding_model: IEmbeddingModel,
        vector_store: IVectorStore,
    ) -> None:
        self._repo = repo
        self._storage = storage
        self._extractor = extractor
        self._chunker = chunker
        self._embedding_model = embedding_model
        self._vector_store = vector_store

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
            inserted_chunks = await self._repo.create_chunks(document.id, chunks)

            # Step 7.5: Generate embeddings and insert into ChromaDB + save metadata
            logger.info(
                "Generating embeddings for %d chunks of document %s using %s",
                len(inserted_chunks), document.id, self._embedding_model.model_name
            )
            chunk_texts = [chunk.content for chunk in inserted_chunks]
            
            # Embed texts using the configured batch size
            batch_size = settings.EMBEDDING_BATCH_SIZE
            vectors = []
            for i in range(0, len(chunk_texts), batch_size):
                batch_texts = chunk_texts[i : i + batch_size]
                batch_vectors = await self._embedding_model.embed(batch_texts)
                vectors.extend(batch_vectors)

            # Prepare vectors upsert for ChromaDB
            chroma_ids = [str(chunk.id) for chunk in inserted_chunks]
            chroma_metadatas = [{"document_id": str(document.id)} for chunk in inserted_chunks]

            logger.info("Upserting embeddings to ChromaDB collection %s", settings.CHROMA_COLLECTION_NAME)
            await self._vector_store.upsert(
                collection=settings.CHROMA_COLLECTION_NAME,
                ids=chroma_ids,
                vectors=vectors,
                metadatas=chroma_metadatas,
            )

            # Build and insert embedding metadata into PostgreSQL
            embedding_metadata_list = [
                EmbeddingMetadata(
                    chunk_id=chunk.id,
                    chroma_document_id=str(chunk.id),
                    vector_dimension=self._embedding_model.dimension,
                    model_name=self._embedding_model.model_name,
                )
                for chunk in inserted_chunks
            ]
            await self._repo.create_embedding_metadata(embedding_metadata_list)

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

        # Extract chunk IDs for Chroma cleanup before deleting the document from PostgreSQL
        chunk_ids = [str(chunk.id) for chunk in document.chunks]

        # Delete DB record (chunks cascade automatically)
        await self._repo.delete_document(document)

        # Clean up Chroma vectors
        if chunk_ids:
            try:
                await self._vector_store.delete(
                    collection=settings.CHROMA_COLLECTION_NAME,
                    ids=chunk_ids
                )
                logger.info("Deleted %d vectors from ChromaDB for document %s", len(chunk_ids), document_id)
            except Exception as exc:
                logger.exception("Failed to delete vectors from ChromaDB for document %s: %s", document_id, exc)

        # Best-effort file deletion
        try:
            await self._storage.delete(storage_path)
        except FileNotFoundError:
            logger.warning(
                "File not found during deletion of document %s at path %s",
                document_id, storage_path
            )

        return DocumentDeleteResponse(document_id=document_id, deleted=True)

    # ------------------------------------------------------------------
    # Search
    # ------------------------------------------------------------------

    async def search_document(
        self,
        document_id: uuid.UUID,
        query_text: str,
        limit: int = 5,
    ) -> list[ChunkSearchResponse]:
        """
        Perform semantic search within a single document.

        Steps:
            1. Validate that the document exists and is indexed.
            2. Generate embedding for query_text.
            3. Query ChromaDB with document filter.
            4. Retrieve the matching chunks from PostgreSQL.
            5. Return search results sorted by similarity.
        """
        document = await self._repo.get_by_id(document_id)
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Document {document_id} not found.",
            )

        if document.processing_status != "indexed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Document {document_id} is not fully indexed yet (status: {document.processing_status}).",
            )

        # Generate query embedding
        query_vectors = await self._embedding_model.embed([query_text])
        if not query_vectors:
            return []
        query_vector = query_vectors[0]

        # Query vector store
        results = await self._vector_store.query(
            collection=settings.CHROMA_COLLECTION_NAME,
            vector=query_vector,
            top_k=limit,
            where={"document_id": str(document_id)},
        )

        if not results:
            return []

        # Retrieve chunks from PostgreSQL to get original content and page numbers
        chunk_id_map = {uuid.UUID(res["id"]): res for res in results}
        chunk_ids = list(chunk_id_map.keys())
        db_chunks = await self._repo.get_chunks_by_ids(chunk_ids)

        search_results = []
        for res in results:
            cid = uuid.UUID(res["id"])
            matching_chunk = next((c for c in db_chunks if c.id == cid), None)
            if matching_chunk:
                search_results.append(
                    ChunkSearchResponse(
                        chunk_id=matching_chunk.id,
                        content=matching_chunk.content,
                        page_number=matching_chunk.page_number,
                        score=res["distance"],
                    )
                )
        return search_results
