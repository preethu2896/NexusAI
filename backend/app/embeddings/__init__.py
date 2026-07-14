"""Embeddings package — embedding model and vector store implementations."""
from backend.app.embeddings.local_embedding import LocalEmbeddingModel
from backend.app.embeddings.chroma_store import ChromaVectorStore

__all__ = ["LocalEmbeddingModel", "ChromaVectorStore"]
