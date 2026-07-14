import asyncio
import os
import sys
import uuid
import shutil

# Ensure the project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from sqlalchemy.future import select
from backend.app.core.database import engine, AsyncSessionLocal, Base
from backend.app.core.config import settings
from backend.app.dependencies import get_document_service, get_embedding_model, get_vector_store
from backend.app.models.document import Document, DocumentChunk, EmbeddingMetadata
from backend.app.models.base import User


def create_sample_pdf(file_path: str, pages_text: list[str]) -> None:
    """Generates a valid, minimal text PDF that pypdf can read."""
    font_obj = b"<</Type /Font /Subtype /Type1 /BaseFont /Helvetica>>"
    num_pages = len(pages_text)
    
    final_objs = []
    # Obj 1: Catalog
    final_objs.append((1, b"<</Type /Catalog /Pages 2 0 R>>"))
    # Obj 2: Pages Parent
    kids_str = " ".join(f"{3+i} 0 R" for i in range(num_pages))
    pages_parent = f"<</Type /Pages /Kids [{kids_str}] /Count {num_pages}>>".encode()
    final_objs.append((2, pages_parent))
    
    # Obj 3..2+P: Page objects
    for i in range(num_pages):
        page_obj = (
            f"<</Type /Page /Parent 2 0 R\n"
            f"/MediaBox [0 0 612 792]\n"
            f"/Contents {3 + num_pages + i} 0 R\n"
            f"/Resources <</Font <</F1 {3 + 2 * num_pages} 0 R>>>>\n"
            f">>".encode()
        )
        final_objs.append((3 + i, page_obj))
        
    # Obj 3+P..2+2P: Content Streams
    for i, page_text in enumerate(pages_text):
        escaped_text = page_text.encode().replace(b"(", b"\\(").replace(b")", b"\\)")
        # Split into lines and format with PDF Tj operators
        stream_content = b"BT\n/F1 12 Tf\n50 750 Td\n14 TL\n"
        for line in escaped_text.split(b"\n"):
            stream_content += b"(" + line + b") Tj\nT*\n"
        stream_content += b"ET\n"
        
        content_obj = f"<</Length {len(stream_content)}>> stream\n".encode() + stream_content + b"endstream"
        final_objs.append((3 + num_pages + i, content_obj))
        
    # Obj 3+2P: Font
    final_objs.append((3 + 2 * num_pages, font_obj))
    
    # Write binary PDF file
    with open(file_path, "wb") as f:
        f.write(b"%PDF-1.4\n")
        offsets = {}
        for idx, obj in final_objs:
            offsets[idx] = f.tell()
            f.write(f"{idx} 0 obj\n".encode())
            f.write(obj)
            f.write(b"\nendobj\n")
            
        xref_pos = f.tell()
        f.write(b"xref\n")
        f.write(f"0 {len(final_objs) + 1}\n".encode())
        f.write(b"0000000000 65535 f \n")
        for idx in range(1, len(final_objs) + 1):
            f.write(f"{offsets[idx]:010d} 00000 n \n".encode())
            
        f.write(b"trailer\n")
        f.write(f"<</Size {len(final_objs) + 1} /Root 1 0 R>>\n".encode())
        f.write(b"startxref\n")
        f.write(f"{xref_pos}\n".encode())
        f.write(b"%%EOF\n")


async def main():
    # Force smaller chunk size for testing to prevent merging distinct pages into a single chunk
    settings.CHUNK_SIZE = 170
    settings.CHUNK_OVERLAP = 10

    print("Starting End-to-End RAG Verification Test...")
    
    # Step 1: Re-create DB tables to ensure a clean test environment
    async with engine.begin() as conn:
        print("Dropping existing PostgreSQL tables...")
        await conn.run_sync(Base.metadata.drop_all)
        print("Creating new PostgreSQL tables...")
        await conn.run_sync(Base.metadata.create_all)

    # Clean up local ChromaDB persistent dir if it exists
    if os.path.exists(settings.CHROMA_PERSIST_DIR):
        print(f"Deleting existing ChromaDB directory: {settings.CHROMA_PERSIST_DIR}")
        shutil.rmtree(settings.CHROMA_PERSIST_DIR, ignore_errors=True)

    # Step 2: Generate sample PDF
    pdf_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "sample_rag_docs.pdf"))
    pages_text = [
        "This is Page 1.\nNexusAI is a production-grade, modular, asynchronous platform for AI agents.",
        "This is Page 2.\nConnection pooling maintains persistent database sockets to PostgreSQL. This prevents TCP port exhaustion and handshake overhead under high concurrency workloads.",
        "This is Page 3.\nChromaDB acts as our vector database. It stores 384-dimensional dense embeddings of text chunks. It uses the HNSW index to achieve millisecond ANN retrieval times.",
        "This is Page 4.\nFastAPI serves as the presentation layer. It validates incoming request payloads using Pydantic schemas and serializes outgoing JSON responses."
    ]
    print(f"Generating sample PDF with {len(pages_text)} pages at: {pdf_path}")
    create_sample_pdf(pdf_path, pages_text)
    
    # Read raw bytes for upload simulation
    with open(pdf_path, "rb") as f:
        file_bytes = f.read()

    # Step 3: Run Ingestion using DocumentService
    async with AsyncSessionLocal() as session:
        # Initialize dependencies
        from backend.app.dependencies import get_file_storage, get_extractor, get_chunker, get_embedding_model, get_vector_store
        from backend.app.repositories.document_repository import DocumentRepository
        from backend.app.services.document_service import DocumentService
        
        repo = DocumentRepository(session)
        storage = get_file_storage()
        extractor = get_extractor()
        chunker = get_chunker()
        embedding_model = get_embedding_model()
        vector_store = get_vector_store()
        
        doc_service = DocumentService(
            repo=repo,
            storage=storage,
            extractor=extractor,
            chunker=chunker,
            embedding_model=embedding_model,
            vector_store=vector_store
        )
        
        print("\nStep 3.1: Running Document Service Ingestion Pipeline...")
        doc_res = await doc_service.ingest(
            filename="sample_rag_docs.pdf",
            content_type="application/pdf",
            file_bytes=file_bytes,
            title="NexusAI Architecture Overview"
        )
        
        print(f"Ingestion complete. Document ID: {doc_res.document_id}")
        print(f"Status: {doc_res.status}")
        print(f"Page Count: {doc_res.page_count}")
        print(f"Chunk Count: {doc_res.chunk_count}")
        
        # Verify database entities
        # Query Document, Chunks, and EmbeddingMetadata
        doc_db = await repo.get_by_id(doc_res.document_id)
        assert doc_db is not None
        assert len(doc_db.chunks) == 4
        print("\nStep 3.2: Verifying PostgreSQL metadata and relations:")
        for idx, chunk in enumerate(doc_db.chunks):
            emb_meta = chunk.embedding_metadata
            assert emb_meta is not None
            print(f"  - Chunk {idx} (Page {chunk.page_number}): '{chunk.content[:40]}...'")
            print(f"    Embedding: Model={emb_meta.model_name}, Dim={emb_meta.vector_dimension}, ChromaID={emb_meta.chroma_document_id}")

        # Step 4: Test Semantic Search Queries
        print("\nStep 4: Testing Semantic Search...")
        
        queries = [
            "How does connection pooling help performance?",
            "What vector database is used and how does it index?",
            "Is FastAPI used?"
        ]
        
        for q in queries:
            print(f"\nQuery: '{q}'")
            results = await doc_service.search_document(
                document_id=doc_res.document_id,
                query_text=q,
                limit=2
            )
            print(f"  Returned {len(results)} matches:")
            for rank, r in enumerate(results, start=1):
                print(f"    [{rank}] Page {r.page_number} (Score/Distance: {r.score:.4f}):")
                print(f"        \"{r.content.strip()}\"")

        # Step 5: Test Delete and cleanup
        print("\nStep 5: Testing Document Deletion...")
        del_res = await doc_service.delete_document(doc_res.document_id)
        print(f"  Delete result: Success={del_res.deleted}")
        
        # Verify from DB that cascade works
        stmt_docs = select(Document).where(Document.id == doc_res.document_id)
        stmt_chunks = select(DocumentChunk).where(DocumentChunk.document_id == doc_res.document_id)
        
        docs_left = (await session.execute(stmt_docs)).scalars().all()
        chunks_left = (await session.execute(stmt_chunks)).scalars().all()
        
        assert len(docs_left) == 0, "Document not deleted!"
        assert len(chunks_left) == 0, "Document chunks not cascade deleted!"
        print("Cascade deletion verified in PostgreSQL.")
        
        # Verify from ChromaDB that query returns empty
        chroma_res = await vector_store.query(
            collection=settings.CHROMA_COLLECTION_NAME,
            vector=[0.0] * embedding_model.dimension,
            top_k=5,
            where={"document_id": str(doc_res.document_id)}
        )
        assert len(chroma_res) == 0, "ChromaDB vectors were not cleaned up!"
        print("Vectors deleted from ChromaDB successfully.")

    # Clean up generated test PDF
    if os.path.exists(pdf_path):
        os.remove(pdf_path)
        
    print("\nAll End-to-End RAG Verification Tests Passed Successfully!")


if __name__ == "__main__":
    asyncio.run(main())
