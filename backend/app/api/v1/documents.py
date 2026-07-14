"""
Document routes — Presentation layer for the Ingestion Pipeline module.

These route handlers have a single responsibility: parse the HTTP request,
call DocumentService, and return the HTTP response. Zero business logic lives here.

All ingestion logic is in DocumentService.
All DB logic is in DocumentRepository.
All interface contracts are in app/ports/.
"""
import uuid
import logging
from fastapi import APIRouter, Depends, File, Form, UploadFile, status, Query

from backend.app.dependencies import get_document_service
from backend.app.services.document_service import DocumentService
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()

# Maximum file size in bytes (derived from settings)
_MAX_FILE_BYTES = settings.MAX_FILE_SIZE_MB * 1024 * 1024


@router.post(
    "/documents/upload",
    status_code=status.HTTP_202_ACCEPTED,
    summary="Upload and ingest a PDF document",
    description=(
        "Upload a PDF file. The system extracts text, splits it into chunks, "
        "and stores them in the database. Returns immediately with status "
        "'processing'. Poll GET /documents/{id} to check indexing progress."
    ),
    tags=["documents"],
)
async def upload_document(
    file: UploadFile = File(..., description="PDF file to upload. Max 20 MB."),
    title: str | None = Form(
        None,
        description="Optional human-readable title. Defaults to the filename."
    ),
    service: DocumentService = Depends(get_document_service),
):
    """
    Upload a PDF and run the ingestion pipeline.

    Validates:
    - File is provided and is a PDF (content_type check)
    - File does not exceed MAX_FILE_SIZE_MB

    Delegates all business logic to DocumentService.ingest().
    """
    # Read file bytes
    file_bytes = await file.read()

    # File size validation
    if len(file_bytes) > _MAX_FILE_BYTES:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"File size {len(file_bytes) / (1024*1024):.1f} MB exceeds "
                f"the maximum allowed size of {settings.MAX_FILE_SIZE_MB} MB."
            ),
        )

    result = await service.ingest(
        filename=file.filename or "unnamed.pdf",
        content_type=file.content_type or "application/pdf",
        file_bytes=file_bytes,
        title=title,
    )

    return {"success": True, "data": result.model_dump(mode="json"), "error": None}


@router.get(
    "/documents",
    status_code=status.HTTP_200_OK,
    summary="List all uploaded documents",
    description="Returns a paginated list of documents with their current processing status.",
    tags=["documents"],
)
async def list_documents(
    limit: int = Query(20, ge=1, le=100, description="Maximum results per page."),
    offset: int = Query(0, ge=0, description="Pagination offset."),
    service: DocumentService = Depends(get_document_service),
):
    """Return a paginated document list."""
    result = await service.list_documents(limit=limit, offset=offset)
    return {"success": True, "data": result.model_dump(mode="json"), "error": None}


@router.get(
    "/documents/{document_id}",
    status_code=status.HTTP_200_OK,
    summary="Get document metadata",
    description="Retrieve full metadata for a single document, including chunk count and status.",
    tags=["documents"],
)
async def get_document(
    document_id: uuid.UUID,
    service: DocumentService = Depends(get_document_service),
):
    """Fetch a single document by UUID."""
    result = await service.get_document(document_id)
    return {"success": True, "data": result.model_dump(mode="json"), "error": None}


@router.delete(
    "/documents/{document_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a document",
    description=(
        "Delete a document and all its associated text chunks. "
        "The stored PDF file is also removed from disk."
    ),
    tags=["documents"],
)
async def delete_document(
    document_id: uuid.UUID,
    service: DocumentService = Depends(get_document_service),
):
    """Delete a document, its chunks, and its stored file."""
    result = await service.delete_document(document_id)
    return {"success": True, "data": result.model_dump(mode="json"), "error": None}
