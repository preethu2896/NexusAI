import asyncio
import sys
import os

# Append the backend parent directory to path so python can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from backend.app.core.database import engine, AsyncSessionLocal
from backend.app.models.base import Base, User, Conversation, Message, Document, DocumentChunk, EmbeddingMetadata

async def test_database_models():
    print("🚀 Starting Database Model Verification Test...")
    
    # 1. Recreate tables asynchronously
    async with engine.begin() as conn:
        print("🗑️ Dropping existing tables...")
        await conn.run_sync(Base.metadata.drop_all)
        print("🔨 Creating new tables based on SQLAlchemy models...")
        await conn.run_sync(Base.metadata.create_all)
    
    # 2. Open an async session
    async with AsyncSessionLocal() as session:
        print("\n✏️ Step 1: Creating and inserting mock entities...")
        
        # Create a mock User
        user = User(
            email="test_engineer@nexusai.com",
            hashed_password="hashed_secure_password_123",
            role="editor"
        )
        session.add(user)
        await session.flush() # Flush to populate user.id from default uuid.uuid4
        print(f"✅ User created with ID: {user.id}")
        
        # Create a mock Conversation
        conversation = Conversation(
            user_id=user.id,
            title="Design Principles of RAG Platforms"
        )
        session.add(conversation)
        await session.flush()
        print(f"✅ Conversation created with ID: {conversation.id}")
        
        # Create mock Messages
        msg_1 = Message(
            conversation_id=conversation.id,
            role="user",
            content="Can you explain how connection pooling protects database ports?"
        )
        msg_2 = Message(
            conversation_id=conversation.id,
            role="assistant",
            content="Connection pooling maintains persistent sockets, preventing TCP handshake exhaustion under high traffic load."
        )
        session.add_all([msg_1, msg_2])
        print("✅ Message history added.")
        
        # Create a mock Document
        document = Document(
            user_id=user.id,
            filename="system_architecture.pdf",
            storage_path="/var/storage/system_architecture.pdf",
            file_size=1048576, # 1MB
            processing_status="completed"
        )
        session.add(document)
        await session.flush()
        print(f"✅ Document created with ID: {document.id}")
        
        # Create a mock Document Chunk
        chunk = DocumentChunk(
            document_id=document.id,
            chunk_index=0,
            content="SQLAlchemy ORM bridges Python classes to SQL relational rows."
        )
        session.add(chunk)
        await session.flush()
        
        # Create mock Embedding Metadata (One-to-One with chunk)
        embedding = EmbeddingMetadata(
            chunk_id=chunk.id,
            vector_dimension=1536,
            model_name="text-embedding-3-small"
        )
        session.add(embedding)
        
        # Commit the transaction
        await session.commit()
        print("💾 Database transaction committed successfully!")

    # 3. Read data and test query strategies
    async with AsyncSessionLocal() as session:
        print("\n📖 Step 2: Testing database read operations & Eager Loading...")
        
        # Fetch the user and eagerly load relationships to prevent lazy loading failures
        stmt = (
            select(User)
            .where(User.email == "test_engineer@nexusai.com")
            .options(
                selectinload(User.conversations).selectinload(Conversation.messages),
                selectinload(User.documents).selectinload(Document.chunks).selectinload(DocumentChunk.embedding_metadata)
            )
        )
        result = await session.execute(stmt)
        db_user = result.scalar_one_or_none()
        
        assert db_user is not None, "Error: User was not inserted!"
        print(f"👤 User read: {db_user.email} (Role: {db_user.role})")
        print(f"  📅 Account created at: {db_user.created_at}")
        
        # Check conversations relationship
        print(f"  💬 Conversations found: {len(db_user.conversations)}")
        for conv in db_user.conversations:
            print(f"    - Thread title: '{conv.title}'")
            print(f"    - Messages (History count: {len(conv.messages)}):")
            for msg in conv.messages:
                print(f"      [{msg.role.upper()}]: {msg.content[:50]}...")
                
        # Check documents relationship
        print(f"  📄 Documents uploaded: {len(db_user.documents)}")
        for doc in db_user.documents:
            print(f"    - Filename: {doc.filename} (Size: {doc.file_size} bytes)")
            for chk in doc.chunks:
                print(f"      - Chunk text: '{chk.content}'")
                emb = chk.embedding_metadata
                assert emb is not None, "Error: Embedding relation missing!"
                print(f"      - Embedding details: Model: {emb.model_name}, Dimension: {emb.vector_dimension}")

    # 4. Test cascading deletions
    async with AsyncSessionLocal() as session:
        print("\n🔥 Step 3: Testing cascading deletions (Cascading constraints check)...")
        
        # Fetch and delete the user
        stmt = select(User).where(User.email == "test_engineer@nexusai.com")
        result = await session.execute(stmt)
        user_to_delete = result.scalar_one()
        await session.delete(user_to_delete)
        await session.commit()
        print("🗑️ User row deleted.")
        
    async with AsyncSessionLocal() as session:
        # Verify conversations, messages, and documents are cascaded
        conv_stmt = select(Conversation)
        msg_stmt = select(Message)
        doc_stmt = select(Document)
        chunk_stmt = select(DocumentChunk)
        emb_stmt = select(EmbeddingMetadata)
        
        convs = (await session.execute(conv_stmt)).scalars().all()
        msgs = (await session.execute(msg_stmt)).scalars().all()
        docs = (await session.execute(doc_stmt)).scalars().all()
        chunks = (await session.execute(chunk_stmt)).scalars().all()
        embs = (await session.execute(emb_stmt)).scalars().all()
        
        assert len(convs) == 0, "Failed: Conversations not deleted!"
        assert len(msgs) == 0, "Failed: Messages not deleted!"
        assert len(docs) == 0, "Failed: Documents not deleted!"
        assert len(chunks) == 0, "Failed: Chunks not deleted!"
        assert len(embs) == 0, "Failed: Embedding metadata not deleted!"
        print("🎉 Cascade check passed! Deleting the user cleaned up all associated records.")

    print("\n✨ Database model verification complete. All model tests passed!")

if __name__ == "__main__":
    asyncio.run(test_database_models())
