"""
RecursiveChunker — Concrete implementation of ITextChunker.

Strategy: Paragraph-first recursive splitting with a sliding window fallback.

Step 1 — Split on paragraph boundaries (double newline \\n\\n).
          Paragraphs are the natural semantic unit in most documents.

Step 2 — For any paragraph that exceeds chunk_size characters,
          apply a sliding window to split it into smaller pieces
          with overlap to avoid cutting sentences mid-thought.

Step 3 — Merge short adjacent paragraphs into a single chunk
          until the chunk_size limit is reached.

This strategy produces chunks that are semantically coherent,
citation-accurate (we track page number and char offsets), and
sized consistently for embedding model context windows.

In v0.3.0, SemanticChunker will use sentence embeddings to find
natural boundaries. The swap requires only changing app/dependencies.py.
"""
from backend.app.ports.chunker import ITextChunker, ChunkData
from backend.app.ports.extractor import PageContent


class RecursiveChunker:
    """
    Paragraph-first sliding window chunker.

    Attributes:
        chunk_size:   Maximum number of characters per chunk.
                      512 tokens ≈ 2000 characters for most embedding models.
        overlap:      Number of characters of overlap between adjacent chunks.
                      Prevents critical context from being cut at boundaries.
    """

    def __init__(self, chunk_size: int = 2000, overlap: int = 200) -> None:
        self._chunk_size = chunk_size
        self._overlap = overlap

    def chunk(self, pages: list[PageContent]) -> list[ChunkData]:
        """
        Split extracted pages into overlapping text chunks.

        The full document text is assembled with page markers so char offsets
        are calculated relative to the complete document, not individual pages.
        A page map is maintained to resolve which page each character belongs to.

        Args:
            pages: Ordered list of PageContent from the extractor.

        Returns:
            Ordered list of ChunkData with char positions and page numbers.
        """
        if not pages:
            return []

        # Build full document text and page boundary map
        full_text, page_map = self._build_document(pages)

        if not full_text.strip():
            return []

        # Split into raw segments using paragraph-first strategy
        segments = self._split_into_segments(full_text)

        # Build final chunks with metadata
        return self._build_chunks(segments, full_text, page_map)

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _build_document(
        self, pages: list[PageContent]
    ) -> tuple[str, list[tuple[int, int]]]:
        """
        Concatenate all page texts into one string and record page boundaries.

        Returns:
            full_text: Complete document string.
            page_map:  List of (char_start, page_number) tuples, ordered by
                       char_start. Used to resolve page_number for any char offset.
        """
        parts: list[str] = []
        page_map: list[tuple[int, int]] = []
        cursor = 0

        for page in pages:
            if page.text:
                page_map.append((cursor, page.page_number))
                parts.append(page.text)
                cursor += len(page.text) + 1  # +1 for the joining newline

        return "\n".join(parts), page_map

    def _split_into_segments(self, text: str) -> list[str]:
        """
        First split on paragraph boundaries, then apply sliding window
        to oversized paragraphs.

        Returns a flat list of text segments, all ≤ chunk_size characters.
        """
        # Primary split: paragraph boundaries
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]

        segments: list[str] = []
        for paragraph in paragraphs:
            if len(paragraph) <= self._chunk_size:
                segments.append(paragraph)
            else:
                # Paragraph is too large — apply sliding window
                segments.extend(self._sliding_window(paragraph))

        return segments

    def _sliding_window(self, text: str) -> list[str]:
        """
        Apply a character-level sliding window to an oversized text block.

        Slides forward by (chunk_size - overlap) characters each step,
        producing overlapping chunks for retrieval quality.
        """
        chunks: list[str] = []
        step = self._chunk_size - self._overlap
        start = 0

        while start < len(text):
            end = min(start + self._chunk_size, len(text))
            chunks.append(text[start:end])
            if end == len(text):
                break
            start += step

        return chunks

    def _build_chunks(
        self,
        segments: list[str],
        full_text: str,
        page_map: list[tuple[int, int]],
    ) -> list[ChunkData]:
        """
        Merge short adjacent segments and create final ChunkData objects.

        Merges consecutive short segments greedily until chunk_size is reached,
        reducing fragmentation from single-sentence paragraphs.
        """
        merged: list[str] = []
        buffer = ""

        for segment in segments:
            if not buffer:
                buffer = segment
            elif len(buffer) + len(segment) + 2 <= self._chunk_size:
                buffer += "\n\n" + segment
            else:
                merged.append(buffer)
                buffer = segment

        if buffer:
            merged.append(buffer)

        # Build ChunkData with char offsets and page numbers
        chunks: list[ChunkData] = []
        search_start = 0

        for chunk_text in merged:
            char_start = full_text.find(chunk_text, search_start)
            if char_start == -1:
                # Fallback: chunk wasn't found verbatim (edge case with whitespace
                # normalization). Append at end of last known position.
                char_start = search_start

            char_end = char_start + len(chunk_text)
            page_number = self._resolve_page(char_start, page_map)
            token_count = self._estimate_tokens(chunk_text)

            chunks.append(ChunkData(
                text=chunk_text,
                page_number=page_number,
                char_start=char_start,
                char_end=char_end,
                token_count=token_count,
            ))
            search_start = char_end

        return chunks

    def _resolve_page(
        self, char_start: int, page_map: list[tuple[int, int]]
    ) -> int:
        """
        Determine which page a character offset falls on.

        Uses the page boundary map to find the last page boundary
        that starts at or before char_start.
        """
        page_number = 1
        for boundary_start, pnum in page_map:
            if char_start >= boundary_start:
                page_number = pnum
            else:
                break
        return page_number

    def _estimate_tokens(self, text: str) -> int:
        """
        Estimate token count using a conservative 4-chars-per-token heuristic.

        This avoids a tokenizer dependency in Sprint A. In Sprint B, we can
        replace this with tiktoken for precise OpenAI token counting.
        """
        return max(1, len(text) // 4)


# Protocol conformance assertion — fails at import if interface drifts
assert isinstance(RecursiveChunker(), ITextChunker), (
    "RecursiveChunker does not satisfy the ITextChunker protocol."
)
