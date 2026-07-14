"""
IDocumentExtractor — Abstract interface for document text extraction.

Current implementation : PdfExtractor (uses pypdf)
Future implementations  : DocxExtractor, MarkdownExtractor, HtmlExtractor

To add a new document type, write a new extractor class that satisfies this
protocol and register it in app/dependencies.py. No other files change.
"""
from dataclasses import dataclass
from typing import Protocol, runtime_checkable


@dataclass
class PageContent:
    """
    Represents the extracted text content of a single document page.

    Attributes:
        page_number: 1-indexed page number in the source document.
        text: The raw extracted text from this page.
    """
    page_number: int
    text: str


@runtime_checkable
class IDocumentExtractor(Protocol):
    """
    Defines the contract for extracting structured text from document files.

    Each extractor handles one or more MIME types. The supports() method
    allows the service layer to select the correct extractor at runtime
    based on the uploaded file's content type.
    """

    async def extract(self, file_path: str) -> list[PageContent]:
        """
        Extract text content from a document file, page by page.

        Args:
            file_path: Absolute or relative path to the document on disk.

        Returns:
            Ordered list of PageContent objects. One entry per page.
            Pages with no extractable text are included with an empty string.

        Raises:
            ValueError: If the file cannot be parsed or is corrupt.
        """
        ...

    def supports(self, content_type: str) -> bool:
        """
        Returns True if this extractor can handle the given MIME type.

        Args:
            content_type: MIME type string (e.g. "application/pdf").

        Returns:
            True if this extractor handles the MIME type, False otherwise.
        """
        ...
