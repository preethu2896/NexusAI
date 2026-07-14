"""
IVectorStore — Abstract interface for vector storage and similarity search.

Sprint A: Stub only. Implemented in Sprint B.

Current implementation : (none — Sprint B)
Future implementations  : ChromaVectorStore (Sprint B MVP),
                          PgVectorStore (Sprint v0.4.0 comparison),
                          QdrantVectorStore (v0.3.0+ scale)
"""
from typing import Protocol, runtime_checkable


@runtime_checkable
class IVectorStore(Protocol):
    """
    Defines the contract for storing embedding vectors and performing
    approximate nearest-neighbour (ANN) similarity search.

    All operations are scoped to a named collection (analogous to a table)
    so a single vector store can host embeddings for multiple document sets.
    """

    async def upsert(
        self,
        collection: str,
        ids: list[str],
        vectors: list[list[float]],
        metadatas: list[dict],
    ) -> None:
        """
        Insert or update embedding vectors in a collection.

        Args:
            collection: Name of the vector collection (e.g. document UUID).
            ids: Unique string IDs for each vector (typically chunk UUIDs).
            vectors: Dense float vectors. len must equal len(ids).
            metadatas: Arbitrary metadata dicts stored alongside each vector.
        """
        ...

    async def query(
        self,
        collection: str,
        vector: list[float],
        top_k: int,
        where: dict | None = None,
    ) -> list[dict]:
        """
        Retrieve the top_k most similar vectors to the query vector.

        Args:
            collection: Name of the vector collection to search.
            vector: The query embedding vector.
            top_k: Number of nearest neighbours to return.
            where: Optional metadata filter dict (implementation-specific format).

        Returns:
            List of result dicts containing at minimum: id, distance, metadata.
        """
        ...

    async def delete(self, collection: str, ids: list[str]) -> None:
        """
        Remove specific vectors from a collection by their IDs.

        Args:
            collection: Name of the vector collection.
            ids: List of vector IDs to remove.
        """
        ...

    async def delete_collection(self, collection: str) -> None:
        """
        Drop an entire collection and all its vectors.

        Args:
            collection: Name of the collection to delete.
        """
        ...
