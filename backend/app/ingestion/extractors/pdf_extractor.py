"""
PdfExtractor — Concrete implementation of IDocumentExtractor for PDF files.

Uses pypdf (pure Python, zero binary dependencies) to extract text
content from each page of a PDF document.

In v0.3.0+, pdfplumber may be introduced as an alternative for PDFs
containing tables or complex layouts. That swap requires only updating
app/dependencies.py.
"""
import asyncio

from pypdf import PdfReader

from backend.app.ports.extractor import IDocumentExtractor, PageContent


class PdfExtractor:
    """
    Extracts text from PDF files page by page using pypdf.

    pypdf runs synchronously. To avoid blocking the async event loop,
    extraction is offloaded to a thread pool via asyncio.to_thread(),
    keeping the ASGI server fully responsive during heavy PDF processing.
    """

    SUPPORTED_CONTENT_TYPE = "application/pdf"

    def supports(self, content_type: str) -> bool:
        """Returns True for PDF MIME types only."""
        return content_type.lower() in (
            "application/pdf",
            "application/x-pdf",
        )

    async def extract(self, file_path: str) -> list[PageContent]:
        """
        Extract text from a PDF file, one PageContent per page.

        The synchronous pypdf read is offloaded to a thread pool so the
        async event loop is never blocked during file I/O or CPU-bound
        PDF parsing.

        Args:
            file_path: Path to the PDF file on disk.

        Returns:
            Ordered list of PageContent. Pages with no extractable text
            (e.g. scanned image pages) return an empty string.

        Raises:
            ValueError: If the file cannot be opened or is not a valid PDF.
        """
        return await asyncio.to_thread(self._extract_sync, file_path)

    def _extract_sync(self, file_path: str) -> list[PageContent]:
        """
        Synchronous extraction worker — runs inside a thread pool.

        Separated from extract() to keep async/sync boundaries explicit
        and to allow unit testing without an async runner.
        """
        try:
            reader = PdfReader(file_path)
        except Exception as exc:
            raise ValueError(
                f"Failed to open PDF at '{file_path}': {exc}"
            ) from exc

        pages: list[PageContent] = []
        for i, page in enumerate(reader.pages, start=1):
            raw_text = page.extract_text() or ""
            # Normalise whitespace: collapse multiple blank lines into one
            cleaned = "\n".join(
                line for line in raw_text.splitlines()
                if line.strip()
            )
            pages.append(PageContent(page_number=i, text=cleaned))

        return pages


# Protocol conformance assertion — fails at import if interface drifts
assert isinstance(PdfExtractor(), IDocumentExtractor), (
    "PdfExtractor does not satisfy the IDocumentExtractor protocol."
)
