import asyncio
import os
import sys
import uuid
import shutil
import json

# Ensure the project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from sqlalchemy.future import select
from backend.app.core.database import engine, AsyncSessionLocal
from backend.app.core.config import settings
from backend.app.dependencies import get_file_storage, get_extractor, get_chunker, get_embedding_model, get_vector_store
from backend.app.models.base import Base, User, Conversation, Message, Document, DocumentChunk
from backend.app.repositories.document_repository import DocumentRepository
from backend.app.services.document_service import DocumentService
from backend.app.streaming.token_stream import format_sse


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
    print("Starting End-to-End RAG Streaming Verification Test...")
    
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
    pdf_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "sample_stream_docs.pdf"))
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
            filename="sample_stream_docs.pdf",
            content_type="application/pdf",
            file_bytes=file_bytes,
            title="NexusAI Architecture Overview"
        )
        
        print(f"Ingestion complete. Document ID: {doc_res.document_id}")
        
        # Step 4: Configure Streaming LLM Client (Mocked for deterministic testing)
        from backend.app.ports.streaming_llm import IStreamingLLMClient
        from typing import AsyncGenerator
        
        class MockStreamingLLMClient(IStreamingLLMClient):
            @property
            def model_name(self) -> str:
                return "gpt-4o-mini-mock-stream"
            
            async def stream_generate(self, system_prompt: str, user_prompt: str) -> AsyncGenerator[str, None]:
                question_part = user_prompt.split("USER QUESTION:")[-1].lower()
                if "connection pooling" in question_part:
                    response_text = "Connection pooling maintains persistent sockets to PostgreSQL [Page 2]."
                elif "vector database" in question_part or "chromadb" in question_part:
                    response_text = "ChromaDB acts as our vector database and stores dense embeddings [Page 3]."
                else:
                    response_text = "I don't know based on the provided documents."
                
                # Split by space and yield incrementally to simulate stream token splits
                tokens = response_text.split(" ")
                for i, token in enumerate(tokens):
                    yield token if i == len(tokens) - 1 else token + " "
                    await asyncio.sleep(0.01)

        llm_client = MockStreamingLLMClient()

        # Instantiate Services & Repositories
        from backend.app.repositories.conversation_repository import ConversationRepository
        from backend.app.repositories.message_repository import MessageRepository
        from backend.app.services.streaming_chat_service import StreamingChatService
        
        conversation_repo = ConversationRepository(session)
        message_repo = MessageRepository(session)
        
        stream_service = StreamingChatService(
            document_service=doc_service,
            llm_client=llm_client,
            conversation_repo=conversation_repo,
            message_repo=message_repo
        )
        
        # Scenario A: Successful Stream
        print("\nScenario A: Run successful streaming query...")
        conv1 = await conversation_repo.create_conversation(title="Stream Thread A")
        
        stream_events = []
        async for event_line in stream_service.query_document_stream(
            conversation_id=conv1.id,
            document_id=doc_res.document_id,
            question="How does connection pooling help performance?",
            top_k=3
        ):
            stream_events.append(event_line)
            
        print(f"Total SSE events received: {len(stream_events)}")
        assert len(stream_events) > 0, "No SSE events yielded."
        
        # Print received event payloads
        tokens = []
        citations = []
        metadata = None
        has_done = False
        
        for line in stream_events:
            if line.startswith("data: "):
                payload = json.loads(line.replace("data: ", "").strip())
                event_type = payload.get("type")
                if event_type == "token":
                    tokens.append(payload.get("content"))
                elif event_type == "citation":
                    citations.append(payload.get("page"))
                elif event_type == "metadata":
                    metadata = payload
                elif event_type == "done":
                    has_done = True
                    
        full_text = "".join(tokens)
        print(f"  Assembled stream text: '{full_text}'")
        print(f"  Cited pages in event stream: {citations}")
        print(f"  Metadata chunk: {metadata}")
        print(f"  Received done flag: {has_done}")
        
        assert "connection pooling" in full_text.lower()
        assert 2 in citations
        assert metadata is not None
        assert has_done is True
        print("Scenario A event format verified.")
        
        # Verify message saving in database
        print("Checking PostgreSQL persistence for Conversation A:")
        history1 = await message_repo.get_messages_by_conversation(conv1.id)
        print(f"  Total messages saved: {len(history1)}")
        assert len(history1) == 2
        assert history1[0].role == "user"
        assert history1[1].role == "assistant"
        assert history1[1].content == full_text
        assert len(history1[1].citations) > 0
        assert history1[1].citations[0]["page"] == 2
        print("  Database messages verified successfully.")
        
        # Scenario B: Disconnect / Cancellation test
        print("\nScenario B: Simulating client disconnection...")
        conv2 = await conversation_repo.create_conversation(title="Stream Thread B")
        
        # Loop through only the first few events, then break to simulate close
        print("Reading first 2 tokens and aborting connection...")
        try:
            generator = stream_service.query_document_stream(
                conversation_id=conv2.id,
                document_id=doc_res.document_id,
                question="What is database connection pooling?",
                top_k=3
            )
            # Fetch only 3 chunks and raise a generator close
            count = 0
            async for chunk in generator:
                count += 1
                if count == 3:
                    print("  Breaking stream loop (closing generator)...")
                    # In python generators, throwing GeneratorExit represents close
                    await generator.aclose()
                    break
        except Exception as exc:
            print(f"  Caught generator error: {type(exc).__name__}")
            
        # Verify no messages were saved in database (cancellation guard check)
        print("Checking PostgreSQL persistence for Conversation B (aborted):")
        history2 = await message_repo.get_messages_by_conversation(conv2.id)
        print(f"  Messages in database: {len(history2)}")
        assert len(history2) == 0, f"Expected 0 messages in database, found {len(history2)}"
        print("  Cancellation guard verified. No garbage text written to DB.")

        # Cleanup PDF file from local disk
        await doc_service.delete_document(doc_res.document_id)
        print("Document deleted.")

    if os.path.exists(pdf_path):
        os.remove(pdf_path)
        
    print("\nAll Real-Time Response Streaming Integration Tests Passed Successfully!")


if __name__ == "__main__":
    asyncio.run(main())
