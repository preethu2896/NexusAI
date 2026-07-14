"""
LocalFileStorage — Concrete implementation of IFileStorage.

Persists uploaded files to a local directory on the application server.

In v0.4.0 (Platform Hardening), this will be replaced by S3FileStorage,
which stores files in an S3-compatible bucket. The swap requires only
updating app/dependencies.py — no changes to services or routes.
"""
import os
import aiofiles

from backend.app.ports.storage import IFileStorage


class LocalFileStorage:
    """
    Stores files in a local directory using async file I/O.

    Using aiofiles ensures file writes do not block the async event loop,
    which is critical in a high-concurrency ASGI server environment.
    """

    def __init__(self, upload_dir: str) -> None:
        """
        Args:
            upload_dir: Root directory for all uploaded files.
                        Created automatically if it does not exist.
        """
        self._upload_dir = upload_dir
        os.makedirs(upload_dir, exist_ok=True)

    async def save(self, file_id: str, content: bytes) -> str:
        """
        Write file bytes to disk under upload_dir/{file_id}.pdf.

        Args:
            file_id: Unique identifier (document UUID). Used as the filename.
            content: Raw binary content of the PDF file.

        Returns:
            Relative path to the saved file (e.g. "uploads/abc-123.pdf").
        """
        file_path = os.path.join(self._upload_dir, f"{file_id}.pdf")
        async with aiofiles.open(file_path, "wb") as f:
            await f.write(content)
        return file_path

    async def delete(self, path: str) -> None:
        """
        Remove a file from disk.

        Args:
            path: Relative path returned by save().

        Raises:
            FileNotFoundError: If the file does not exist at the given path.
        """
        if not os.path.exists(path):
            raise FileNotFoundError(f"File not found at path: {path}")
        os.remove(path)


# Type check: verify LocalFileStorage satisfies the IFileStorage protocol
assert isinstance(LocalFileStorage(upload_dir="."), IFileStorage), (
    "LocalFileStorage does not satisfy the IFileStorage protocol."
)
