"""
ChromaVectorStore — ChromaDB implementation of the IVectorStore port.
"""
import asyncio
import logging
import chromadb
from backend.app.ports.vector_store import IVectorStore

logger = logging.getLogger(__name__)


class ChromaVectorStore(IVectorStore):
    """
    Concrete implementation of IVectorStore using chromadb.
    Uses PersistentClient to save collections to disk.
    """

    def __init__(self, persist_dir: str) -> None:
        logger.info("Initializing ChromaDB PersistentClient at: %s", persist_dir)
        self._client = chromadb.PersistentClient(path=persist_dir)

    async def upsert(
        self,
        collection: str,
        ids: list[str],
        vectors: list[list[float]],
        metadatas: list[dict],
    ) -> None:
        """Upsert vectors into the named collection."""
        await asyncio.to_thread(self._upsert_sync, collection, ids, vectors, metadatas)

    def _upsert_sync(
        self,
        collection_name: str,
        ids: list[str],
        vectors: list[list[float]],
        metadatas: list[dict],
    ) -> None:
        collection = self._client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"}  # default to cosine similarity
        )
        collection.upsert(
            ids=ids,
            embeddings=vectors,
            metadatas=metadatas,
        )

    async def query(
        self,
        collection: str,
        vector: list[float],
        top_k: int,
        where: dict | None = None,
    ) -> list[dict]:
        """Perform similarity search on the named collection."""
        return await asyncio.to_thread(self._query_sync, collection, vector, top_k, where)

    def _query_sync(
        self,
        collection_name: str,
        vector: list[float],
        top_k: int,
        where: dict | None = None,
    ) -> list[dict]:
        try:
            collection = self._client.get_collection(name=collection_name)
        except Exception as exc:
            logger.warning("Collection %s not found during query: %s", collection_name, exc)
            return []

        results = collection.query(
            query_embeddings=[vector],
            n_results=top_k,
            where=where,
        )

        formatted_results = []
        if results and results["ids"] and len(results["ids"]) > 0:
            ids = results["ids"][0]
            distances = (
                results["distances"][0]
                if results.get("distances")
                else [0.0] * len(ids)
            )
            metadatas = (
                results["metadatas"][0]
                if results.get("metadatas")
                else [{}] * len(ids)
            )

            for i in range(len(ids)):
                formatted_results.append({
                    "id": ids[i],
                    "distance": float(distances[i]),
                    "metadata": metadatas[i] or {},
                })
        return formatted_results

    async def delete(self, collection: str, ids: list[str]) -> None:
        """Delete specific vectors by ID."""
        await asyncio.to_thread(self._delete_sync, collection, ids)

    def _delete_sync(self, collection_name: str, ids: list[str]) -> None:
        try:
            collection = self._client.get_collection(name=collection_name)
            collection.delete(ids=ids)
        except Exception as exc:
            logger.warning("Could not delete from Chroma collection %s: %s", collection_name, exc)

    async def delete_collection(self, collection: str) -> None:
        """Drop the entire collection."""
        await asyncio.to_thread(self._delete_collection_sync, collection)

    def _delete_collection_sync(self, collection_name: str) -> None:
        try:
            self._client.delete_collection(name=collection_name)
            logger.info("Chroma collection '%s' deleted.", collection_name)
        except Exception as exc:
            logger.warning("Could not delete Chroma collection %s: %s", collection_name, exc)
