"""
LocalEmbeddingModel — Local CPU-based embedding generation using SentenceTransformers.
"""
import asyncio
import logging
from sentence_transformers import SentenceTransformer
from backend.app.ports.embedding import IEmbeddingModel

logger = logging.getLogger(__name__)


class LocalEmbeddingModel(IEmbeddingModel):
    """
    Concrete implementation of IEmbeddingModel using sentence-transformers.
    Loads and runs the model locally on CPU.
    """

    def __init__(self, model_name: str) -> None:
        self._model_name = model_name
        logger.info("Initializing SentenceTransformer model: %s", model_name)
        self._model = SentenceTransformer(model_name)
        self._dimension = int(self._model.get_sentence_embedding_dimension())
        logger.info("Model %s ready. Dimensions: %d", model_name, self._dimension)

    async def embed(self, texts: list[str]) -> list[list[float]]:
        """
        Generate embeddings for a list of texts asynchronously using asyncio.to_thread.
        """
        if not texts:
            return []

        # Run encoding in a separate thread to prevent blocking the async event loop
        embeddings = await asyncio.to_thread(
            self._model.encode,
            texts,
            convert_to_numpy=True,
            show_progress_bar=False,
        )

        return [vector.tolist() for vector in embeddings]

    @property
    def dimension(self) -> int:
        """Returns the embedding dimensions."""
        return self._dimension

    @property
    def model_name(self) -> str:
        """Returns the model name."""
        return self._model_name
