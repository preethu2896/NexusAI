"""
IFileStorage — Abstract interface for binary file persistence.

Current implementation : LocalFileStorage (saves to disk under UPLOAD_DIR)
Future implementations  : S3FileStorage, AzureBlobStorage, GCSFileStorage

To swap storage backends, update app/dependencies.py only.
Routes and services are unaffected.
"""
from typing import Protocol, runtime_checkable


@runtime_checkable
class IFileStorage(Protocol):
    """
    Defines the contract for storing and deleting uploaded document files.

    Implementations must be safe to use in an async context. All I/O
    operations must be non-blocking.
    """

    async def save(self, file_id: str, content: bytes) -> str:
        """
        Persist raw file bytes under the given file_id key.

        Args:
            file_id: A unique identifier for the file (typically document UUID).
            content: Raw binary content of the file.

        Returns:
            The storage path or URI where the file was persisted.
            For local storage this is a relative path (e.g. "uploads/abc123.pdf").
            For S3 this would be an S3 URI.
        """
        ...

    async def delete(self, path: str) -> None:
        """
        Remove a previously stored file.

        Args:
            path: The storage path returned by save().

        Raises:
            FileNotFoundError: If the file does not exist at the given path.
        """
        ...
