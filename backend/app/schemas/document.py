"""
Document Pydantic schemas — request validation and response serialization.

These schemas are the sole definition of what the API accepts and returns.
SQLAlchemy models never leave the repository layer; they are converted to
these schemas before being passed back to route handlers.
"""
import uuid
from datetime import datetime
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Response schemas
# ---------------------------------------------------------------------------

class DocumentResponse(BaseModel):
    """
    Full document metadata returned by GET /documents/{id} and POST /upload.
    """
    document_id: uuid.UUID = Field(
        ..., description="Unique document identifier."
    )
    filename: str = Field(
        ..., description="Original filename of the uploaded file."
    )
    title: str = Field(
        ..., description="Human-readable document title."
    )
    status: str = Field(
        ..., description="Processing status: pending | processing | indexed | failed."
    )
    file_size_bytes: int | None = Field(
        None, description="File size in bytes."
    )
    page_count: int | None = Field(
        None, description="Total pages extracted from the PDF."
    )
    chunk_count: int = Field(
        0, description="Number of text chunks stored for this document."
    )
    created_at: datetime = Field(
        ..., description="UTC timestamp when the document record was created."
    )
    updated_at: datetime = Field(
        ..., description="UTC timestamp of the last status update."
    )

    model_config = {"from_attributes": True}


class DocumentListResponse(BaseModel):
    """Paginated list of documents returned by GET /documents."""
    total: int = Field(..., description="Total number of documents in the database.")
    items: list[DocumentResponse]


class DocumentDeleteResponse(BaseModel):
    """Confirmation returned by DELETE /documents/{id}."""
    document_id: uuid.UUID
    deleted: bool


# ---------------------------------------------------------------------------
# API envelope wrappers
# ---------------------------------------------------------------------------

class APIResponse(BaseModel):
    """
    Standard API response envelope.

    All endpoints wrap their payload in this structure for consistent
    client-side parsing:
        { "success": true, "data": {...}, "error": null }
    """
    success: bool
    data: dict | list | None = None
    error: dict | None = None
