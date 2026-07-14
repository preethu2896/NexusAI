"""
app/dependencies.py — Dependency Injection wiring for NexusAI.

This is the SINGLE FILE that controls which concrete implementation
backs each abstract protocol. To swap implementations (e.g. Local → S3,
PDF → DOCX, Recursive → Semantic), update only this file.

Routes and services are never touched when swapping implementations.
"""
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.config import settings
from backend.app.core.database import get_db

# Ports (abstract interfaces)
from backend.app.ports.storage import IFileStorage
from backend.app.ports.extractor import IDocumentExtractor
from backend.app.ports.chunker import ITextChunker
from backend.app.ports.embedding import IEmbeddingModel
from backend.app.ports.vector_store import IVectorStore

# Concrete implementations (Sprint A & B)
from backend.app.ingestion.storage.local_storage import LocalFileStorage
from backend.app.ingestion.extractors.pdf_extractor import PdfExtractor
from backend.app.ingestion.chunkers.recursive_chunker import RecursiveChunker
from backend.app.embeddings import LocalEmbeddingModel, ChromaVectorStore

# Layers
from backend.app.repositories.document_repository import DocumentRepository
from backend.app.services.document_service import DocumentService


# ---------------------------------------------------------------------------
# Infrastructure providers
# ---------------------------------------------------------------------------

def get_file_storage() -> IFileStorage:
    """
    Provide the active file storage implementation.
    Sprint A: LocalFileStorage (saves to UPLOAD_DIR on disk).
    Sprint v0.4.0: Replace with S3FileStorage — change only this function.
    """
    return LocalFileStorage(upload_dir=settings.UPLOAD_DIR)


def get_extractor() -> IDocumentExtractor:
    """
    Provide the active document extractor.
    Sprint A: PdfExtractor (pypdf).
    Future: DocxExtractor, MarkdownExtractor — registered here.
    """
    return PdfExtractor()


def get_chunker() -> ITextChunker:
    """
    Provide the active text chunker.
    Sprint A: RecursiveChunker (paragraph-first sliding window).
    Future: SemanticChunker — change only this function.
    """
    return RecursiveChunker(
        chunk_size=settings.CHUNK_SIZE,
        overlap=settings.CHUNK_OVERLAP,
    )


# Cache singleton instances to avoid reloading heavy models on every request
_embedding_model: IEmbeddingModel | None = None
_vector_store: IVectorStore | None = None


def get_embedding_model() -> IEmbeddingModel:
    """
    Provide the active embedding model.
    Loads the sentence-transformer model on first call and caches it.
    """
    global _embedding_model
    if _embedding_model is None:
        _embedding_model = LocalEmbeddingModel(model_name=settings.EMBEDDING_MODEL_NAME)
    return _embedding_model


def get_vector_store() -> IVectorStore:
    """
    Provide the active vector store client.
    Initializes ChromaDB PersistentClient on first call and caches it.
    """
    global _vector_store
    if _vector_store is None:
        _vector_store = ChromaVectorStore(persist_dir=settings.CHROMA_PERSIST_DIR)
    return _vector_store


# ---------------------------------------------------------------------------
# Service providers
# ---------------------------------------------------------------------------

def get_document_service(
    db: AsyncSession = Depends(get_db),
    storage: IFileStorage = Depends(get_file_storage),
    extractor: IDocumentExtractor = Depends(get_extractor),
    chunker: ITextChunker = Depends(get_chunker),
    embedding_model: IEmbeddingModel = Depends(get_embedding_model),
    vector_store: IVectorStore = Depends(get_vector_store),
) -> DocumentService:
    """
    Assemble and provide a fully wired DocumentService.

    FastAPI resolves all nested Depends() automatically, so routes receive
    a ready-to-use DocumentService with all dependencies injected.
    """
    repo = DocumentRepository(db)
    return DocumentService(
        repo=repo,
        storage=storage,
        extractor=extractor,
        chunker=chunker,
        embedding_model=embedding_model,
        vector_store=vector_store,
    )

