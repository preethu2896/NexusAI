"""
IEmbeddingModel — Abstract interface for text embedding generation.

Sprint A: Stub only. Implemented in Sprint B.

Current implementation : (none — Sprint B)
Future implementations  : OpenAIEmbedding (text-embedding-3-small),
                          BGEEmbedding (BAAI/bge-base-en-v1.5),
                          E5Embedding (intfloat/e5-large-v2)
"""
from typing import Protocol, runtime_checkable


@runtime_checkable
class IEmbeddingModel(Protocol):
    """
    Defines the contract for generating dense vector embeddings from text.

    Implementations must support batch embedding (list of texts → list of vectors)
    to allow efficient bulk processing during document ingestion.
    """

    async def embed(self, texts: list[str]) -> list[list[float]]:
        """
        Generate embedding vectors for a batch of text strings.

        Args:
            texts: List of text strings to embed.

        Returns:
            List of float vectors. len(result) == len(texts).
            Each vector has length equal to self.dimension.
        """
        ...

    @property
    def dimension(self) -> int:
        """Return the number of dimensions in each output vector."""
        ...

    @property
    def model_name(self) -> str:
        """Return the canonical model identifier string."""
        ...
