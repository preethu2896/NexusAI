"""
ITextChunker — Abstract interface for document text chunking.

Current implementation : RecursiveChunker (paragraph-first sliding window)
Future implementations  : SemanticChunker (embedding-based boundary detection),
                          SentenceChunker (sentence-transformer boundary detection)

To swap chunking strategies, update app/dependencies.py only.
"""
from dataclasses import dataclass
from typing import Protocol, runtime_checkable

from backend.app.ports.extractor import PageContent


@dataclass
class ChunkData:
    """
    Represents a single text chunk produced by the chunker.

    These fields map directly to columns in the document_chunks table,
    providing full provenance for citation generation in Sprint C/D.

    Attributes:
        text: The chunk text content.
        page_number: Source page number in the original PDF.
        char_start: Character offset of the chunk start in the full document text.
        char_end: Character offset of the chunk end in the full document text.
        token_count: Approximate token count for LLM context window budgeting.
    """
    text: str
    page_number: int
    char_start: int
    char_end: int
    token_count: int


@runtime_checkable
class ITextChunker(Protocol):
    """
    Defines the contract for splitting extracted document text into chunks.

    The chunker receives the full ordered list of extracted pages and returns
    a flat, ordered list of chunks. Chunk ordering is preserved so chunk_index
    values assigned by the service layer reflect document reading order.
    """

    def chunk(self, pages: list[PageContent]) -> list[ChunkData]:
        """
        Split extracted page content into text chunks.

        Args:
            pages: Ordered list of PageContent from IDocumentExtractor.

        Returns:
            Ordered list of ChunkData. Chunks should be non-overlapping in their
            char positions but may have textual overlap for retrieval quality.
        """
        ...
