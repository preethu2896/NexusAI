import asyncio
import os
import sys
import uuid
import shutil

# Ensure the project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from sqlalchemy.future import select
from backend.app.core.database import engine, AsyncSessionLocal
from backend.app.core.config import settings
from backend.app.dependencies import get_file_storage, get_extractor, get_chunker, get_embedding_model, get_vector_store
from backend.app.models.base import Base, User, Conversation, Message, Document, DocumentChunk
from backend.app.repositories.document_repository import DocumentRepository
from backend.app.services.document_service import DocumentService
from backend.app.generation.rag_generator import RAGGenerator
from backend.app.services.chat_service import ChatService


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
        stream_content = b"BT\n/F1 12 Tf\n50 750 Td\n14 TL\n"
        for line in escaped_text.split(b"\n"):
            stream_content += b"(" + line + b") Tj\nT*\n"
        stream_content += b"ET\n"
        
        content_obj = f"<</Length {len(stream_content)}>> stream\n".encode() + stream_content + b"endstream"
        final_objs.append((3 + num_pages + i, content_obj))
        
    # Obj 3+2P: Font
    final_objs.append((3 + 2 * num_pages, font_obj))
    
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
    print("Starting End-to-End RAG Persistence Verification Test...")
    
    settings.CHUNK_SIZE = 170
    settings.CHUNK_OVERLAP = 10

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
    pdf_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "sample_persist_docs.pdf"))
    pages_text = [
        "This is Page 1.\nNexusAI is a production-grade, modular, asynchronous platform for AI agents.",
        "This is Page 2.\nConnection pooling maintains persistent database sockets to PostgreSQL. This prevents TCP port exhaustion and handshake overhead.",
        "This is Page 3.\nChromaDB acts as our vector database. It stores 384-dimensional dense embeddings of text chunks.",
        "This is Page 4.\nFastAPI serves as the presentation layer. It validates incoming request payloads using Pydantic schemas."
    ]
    print(f"Generating sample PDF with {len(pages_text)} pages at: {pdf_path}")
    create_sample_pdf(pdf_path, pages_text)
    
    with open(pdf_path, "rb") as f:
        file_bytes = f.read()

    async with AsyncSessionLocal() as session:
        # Resolve all dependency objects
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
        
        print("\nIngesting document...")
        doc_res = await doc_service.ingest(
            filename="sample_persist_docs.pdf",
            content_type="application/pdf",
            file_bytes=file_bytes,
            title="NexusAI Architecture Overview"
        )
        
        print(f"Ingestion complete. Document ID: {doc_res.document_id}")
        
        # Step 4: Configure LLM Client (Mocked for deterministic testing)
        from backend.app.ports.llm_client import ILLMClient
        
        class MockLLMClient(ILLMClient):
            @property
            def model_name(self) -> str:
                return "gpt-4o-mini-mock"
            
            async def generate(self, system_prompt: str, user_prompt: str) -> str:
                question_part = user_prompt.split("USER QUESTION:")[-1].lower()
                if "connection pooling" in question_part:
                    return "Connection pooling maintains persistent sockets to PostgreSQL [Page 2]."
                elif "vector database" in question_part or "chromadb" in question_part or "store vectors" in question_part:
                    return "ChromaDB acts as our vector database and stores dense embeddings [Page 3]."
                return "I don't know based on the provided documents."

        llm_client = MockLLMClient()

        # Instantiate Services & Repositories
        from backend.app.repositories.conversation_repository import ConversationRepository
        from backend.app.repositories.message_repository import MessageRepository
        
        conversation_repo = ConversationRepository(session)
        message_repo = MessageRepository(session)
        rag_generator = RAGGenerator(llm_client=llm_client)
        
        chat_service = ChatService(
            document_service=doc_service,
            rag_generator=rag_generator,
            conversation_repo=conversation_repo,
            message_repo=message_repo
        )
        
        # Step 5: Create Conversation Thread
        print("\nCreating new Conversation thread...")
        conv = await chat_service.create_conversation(title="Verification Thread")
        print(f"Conversation created. ID: {conv.id}, Title: {conv.title}")
        
        # Step 6: Ask Question 1 (Grounded in page 2)
        q1 = "How does connection pooling help performance?"
        print(f"\nQuestion 1: '{q1}'")
        res1 = await chat_service.query_document(
            conversation_id=conv.id,
            document_id=doc_res.document_id,
            question=q1,
            top_k=3
        )
        print(f"Answer 1: {res1.answer}")
        print(f"Citations: {res1.citations}")

        # Step 7: Ask Question 2 (Grounded in page 3)
        q2 = "What database is used to store vectors?"
        print(f"\nQuestion 2: '{q2}'")
        res2 = await chat_service.query_document(
            conversation_id=conv.id,
            document_id=doc_res.document_id,
            question=q2,
            top_k=3
        )
        print(f"Answer 2: {res2.answer}")
        print(f"Citations: {res2.citations}")

        # Step 8: Fetch Chat History & Verify Persistence
        print("\nRetrieving message history...")
        history = await chat_service.get_conversation_messages(conversation_id=conv.id)
        
        print(f"Messages count: {len(history)}")
        assert len(history) == 4, f"Expected 4 messages, got {len(history)}"
        
        # Verify message content, roles, and chronological order
        print("\nVerifying chronological history and roles:")
        roles = [m.role for m in history]
        print(f"  Roles order: {roles}")
        assert roles == ["user", "assistant", "user", "assistant"]
        
        # Verify Question 1 and Answer 1
        assert history[0].content == q1
        assert history[1].content == res1.answer
        print("  Chronology and contents match user queries.")
        
        # Verify structured citations
        print("\nVerifying structured citations:")
        citations1 = history[1].citations
        print(f"  Message 1 structured citations: {citations1}")
        assert len(citations1) > 0
        assert citations1[0]["page"] == 2
        assert citations1[0]["document_id"] == str(doc_res.document_id)
        assert citations1[0]["chunk_id"] is not None
        assert citations1[0]["score"] is not None
        
        citations2 = history[3].citations
        print(f"  Message 2 structured citations: {citations2}")
        assert len(citations2) > 0
        assert citations2[0]["page"] == 3
        assert citations2[0]["document_id"] == str(doc_res.document_id)
        assert citations2[0]["chunk_id"] is not None
        assert citations2[0]["score"] is not None
        
        print("  Structured citations verification passed.")
        
        # Step 9: Delete Conversation and Verify Cascades
        print("\nDeleting conversation thread...")
        deleted = await chat_service.delete_conversation(conv.id)
        assert deleted is True
        
        # Verify messages are cascaded deleted
        print("Verifying cascade deletions of messages:")
        msg_check = await session.execute(
            select(Message).where(Message.conversation_id == conv.id)
        )
        remaining_messages = msg_check.scalars().all()
        print(f"  Remaining messages for conversation: {len(remaining_messages)}")
        assert len(remaining_messages) == 0
        print("  Cascade verification passed (messages table is clean).")
        
        # Verify documents and chunks still exist (independent existence check)
        print("Verifying document chunks were not deleted by cascade:")
        chunks_check = await session.execute(
            select(DocumentChunk).where(DocumentChunk.document_id == doc_res.document_id)
        )
        remaining_chunks = chunks_check.scalars().all()
        print(f"  Remaining document chunks: {len(remaining_chunks)}")
        assert len(remaining_chunks) > 0
        print("  Cascade validation check passed (documents/chunks remain intact).")
        
        # Complete cleanup
        await doc_service.delete_document(doc_res.document_id)
        print("Document deleted.")

    if os.path.exists(pdf_path):
        os.remove(pdf_path)
        
    print("\nAll Persistence and Cascade Verification Tests Passed Successfully!")


if __name__ == "__main__":
    asyncio.run(main())
