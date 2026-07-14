# NexusAI AI Engineering Handbook

Welcome to the NexusAI AI Engineering Handbook. This document is a comprehensive, conceptually-organized learning guide and textbook for our engineering stack, detailing how our API servers, databases, containers, and asynchronous runtimes interact under the hood.

---

# Chapter 1: Web Architectures, API Design, and FastAPI

## Theory

### Web Server & FastAPI
An API server acts as the communication interface layer for AI Engineering engines (such as LLM routing, vector searches, and agent decision trees). FastAPI is a modern, high-performance web framework for Python based on standard type hints. It is asynchronously native, allowing it to handle concurrent tasks without blocking execution thread cycles.

**ELI5 Analogy:**
Imagine a restaurant. You are the customer sitting at the table (the Client). The kitchen is where the chef cooks the food (the AI models). You cannot walk into the kitchen yourself. Instead, a friendly waiter (FastAPI) comes to your table, takes your order (API Request), runs to the kitchen, gets the food, and brings it back to you (API Response). 
*Async/Await* means the waiter does not stand in the kitchen waiting for the chef to cook your steak. While your steak is cooking, the waiter takes orders from other tables.

### HTTP Requests & Responses
HTTP is the standard protocol of the internet. Clients send requests to servers, and servers return responses containing data or status codes.
* **GET Request**: Sending a postcard that says, *"Please send me a copy of the menu."*
* **POST Request**: Sending a package containing raw ingredients and saying, *"Please bake me a cake."*
* **HTTP Response**: The postal service delivering the menu or the baked cake back to your mailbox.

### Package & Environment Isolation
AI applications use complex, heavy libraries that evolve quickly. Isolating dependencies prevents version conflicts.
* **uv**: Modern Python package management. Traditional pip is like buying a new box of LEGOs from the store every time you start a new set, waiting for it to ship. `uv` is like having a giant LEGO sorting drawer in your room; if a piece is there, `uv` copies it to your workspace instantly.
* **Virtual Environments (.venv)**: Think of painting in your living room. If you paint directly on the floor, you make a huge mess. A virtual environment is like laying a plastic sheet over the floor; you can paint, make a mess, and then roll up the sheet and throw it away, leaving the living room clean.

---

## Internal Working

FastAPI compiles route definitions and handles incoming HTTP requests by leveraging two core components:
1. **Starlette**: A lightweight ASGI (Asynchronous Server Gateway Interface) framework that manages web routing, middleware, and request/response lifecycles.
2. **Pydantic**: A data validation library using Python type annotations. It parses incoming JSON, validates structure/types at runtime, and serializes Python objects back to JSON.

### Execution Flow:
```
               [Incoming HTTP Packet]
                         │
                         ▼
        ┌────────────────────────────────┐
        │  Uvicorn (ASGI Web Server)     │ ← Parses HTTP raw bytes to Python dicts
        └────────────────┬───────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │  FastAPI Router                │ ← Matches URL Path & Method (e.g. GET /health)
        └────────────────┬───────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │  Pydantic Validation Layer     │ ← Inspects types and parses JSON payload
        └────────────────┬───────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │  Async Event Loop (asyncio)    │ ← Runs endpoint logic (non-blocking)
        └────────────────┬───────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │  Response Serializer           │ ← Converts python models to JSON string
        └────────────────────────────────┘
```

---

## Architecture

NexusAI follows a stateless **Clean API Architecture** separating concerns:
* **Presentation Layer (`api/`)**: Declares routes, handles HTTP logic, and manages serialization.
* **Core Layer (`core/`)**: Handles configurations, security controls, and database connections.
* **Data Layer (`models/` & database)**: Manages database schemas and database execution.

### Data Flow:
```
User (Browser) ──► HTTP GET /api/v1/health ──► Uvicorn ──► FastAPI Router
                                                             │
                                                  ┌──────────┴──────────┐
                                                  ▼                     ▼
                                            SQLAlchemy Engine       get_db()
                                                  │             (Yields Session)
                                                  ▼                     │
                                           PostgreSQL DB ◄──────────────┘
                                          (Executes SELECT 1)
                                                  │
                                                  ▼
User (Browser) ◄─── JSON Status 200 ◄─────── Return dict
```

---

## Code Explanation

### 1. Application Entry Point (`backend/app/main.py`)
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.router import api_router
from backend.app.core.config import settings

app = FastAPI(
    title="NexusAI API",
    description="Enterprise Agentic RAG Platform Backend Services",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware limits cross-origin attacks
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")
```
* `FastAPI()`: Initializes the core web app instance.
* `add_middleware()`: Configures CORS, preventing unauthorized external websites from fetching API endpoints.
* `include_router()`: Structures routes cleanly under the `/api/v1` prefix.

### 2. Dependency Injection & Configuration (`backend/app/core/config.py`)
FastAPI uses Pydantic Settings to read and validate environmental variables. If a required configuration (like `DATABASE_URL`) is missing, the application fails to start immediately, preventing runtime bugs.

### 3. Project Configuration (`backend/pyproject.toml`)
```toml
[project]
name = "nexusai-backend"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "fastapi>=0.111.0",
    "uvicorn[standard]>=0.30.1",
    "sqlalchemy[asyncio]>=2.0.31",
    "asyncpg>=0.29.0",
    "pydantic-settings>=2.3.4",
]
```

---

## Production Practices

### 1. Containerization & Docker
To guarantee that the application runs identically on developer machines and cloud infrastructure, we package it inside Docker.
* **Docker Container Analogy**: Think of placing a completed LEGO toy castle inside a hard plastic box with its own batteries and instructions included. When shipped, the castle works instantly, exactly the same way it did at your house.
* **Multi-stage Builds**: We separate the build environment from the final runtime container to minimize file sizes and vulnerabilities.

### 2. Scalability & Process Managers
* In production, FastAPI applications run behind an Application Load Balancer.
* Inside containers, Uvicorn runs in single-process mode, letting Kubernetes handle horizontal scaling, or Gunicorn manages multiple Uvicorn worker processes (typically 1 worker per CPU core + 1) to maximize thread execution.

### 3. CORS & Security
* CORS settings must explicitly reference specific trusted frontend domains (e.g. `https://nexusai.com`) instead of allowing all origins (`*`) in production.

---

## Interview Questions

### Q1: What is the difference between WSGI and ASGI?
* **Answer**: WSGI (Web Server Gateway Interface) is synchronous. Each request holds an execution thread, blocking new requests if all threads are busy. ASGI (Asynchronous Server Gateway Interface) is asynchronous and runs on a single-threaded event loop, allowing request processing to be paused during I/O waits, which frees the thread to process other requests in the meantime.

### Q2: How does Dependency Injection work in FastAPI?
* **Answer**: FastAPI provides the `Depends` utility. When a route function has a parameter wrapped in `Depends(callable)`, FastAPI executes `callable` first and passes the return value into the function. This is crucial for injecting database sessions, authenticating users, and managing test mocks.

### Q3: Why is async/await preferred for AI API servers?
* **Answer**: AI operations (LLM generation, vector search queries) often take 1 to 5+ seconds. Under a synchronous model, a few concurrent users would block all threads, causing timeouts. Asynchronous frameworks yield execution back to the loop during I/O waits, allowing a single server instance to handle thousands of concurrent requests.

---

## Common Mistakes

### 1. Omitted `await` Keyword
Calling an async function (like database queries) without `await` returns a coroutine object rather than the actual results.
* *Incorrect*: `user = get_user_by_id(db, id)`
* *Correct*: `user = await get_user_by_id(db, id)`

### 2. Blocking the Event Loop
Running synchronous CPU-heavy or blocking network calls (like `time.sleep()` or standard `requests.get()`) inside an `async def` route stops the entire event loop, freezing the server for all clients.

---
---

# Chapter 2: Database Modeling and SQLAlchemy ORM

## Theory

### Relational Databases (RDBMS)
A Relational Database Management System (like PostgreSQL) organizes data into tables of rows and columns, enforcing relational consistency, indexes, and ACID guarantees (Atomicity, Consistency, Isolation, Durability) to prevent data corruption.
* **RDBMS Analogy**: Think of a locked diary. If you write memories on loose scraps of paper, they will blow away. Writing them in a hardbound book with page numbers, dates, and strict lines ensures they are safe forever.

### ORM (Object-Relational Mapper)
SQLAlchemy ORM maps relational database tables directly to Python classes, letting developers write object-oriented queries instead of raw SQL strings.
* **ORM Analogy**: Imagine a dog (Python code) and a cat (SQL database) playing a board game. The dog only speaks English, and the cat only speaks Spanish. SQLAlchemy is the translator sitting between them. When the dog says, *"I want to move User to index 3,"* the translator tells the cat, *"UPDATE users SET index = 3"*.

### Relational Schemas & Modeling Keys
* **Primary Key**: A unique identifier for a table row (e.g. UUID).
* **Foreign Key**: A column that references a primary key of another table to create a link.
* **UUID (Universally Unique Identifier)**: A 128-bit value randomly generated. Auto-incrementing integers (`1, 2, 3...`) expose database capacities and allow sequential scraping. UUIDs are random, un-guessable, and can be generated offline without collision risks.
* **Cascade Deletes**: Establishes parent-child bounds. If you throw a toy airplane (parent document) in the trash, Cascade Delete ensures all passenger action figures (child document chunks) are automatically trashed, keeping the database free of orphaned records.

---

## Internal Working

SQLAlchemy uses two layers:
1. **Core**: Generates parameterized SQL queries and compiles dialect-specific styles.
2. **ORM**: High-level mapper tracking memory states in an **Identity Map** and executing changes via a **Unit of Work** engine when flushed or committed.

### Lifecycle of a Write Operation:
```
  [ Python Code Class ] ──► Inherits Declarative Base ──► Metaclass Inspects Attributes
                                                                │
                                                                ▼
  [ Session local changes ] ──► Dirty state check ──► Unit of Work flushes statements
                                                                │
                                                                ▼
  [ SQLAlchemy Core ] ──► Compiles SQL String ──► Parameterizes Values ──► Driver (asyncpg)
```

---

## Architecture

FastAPI dependencies manage database sessions per request. The engine establishes a connection pool to avoid negotiating a socket handshake on every HTTP request.

### Session Scope Placement:
```
                         [ FastAPI Dependency ]
                                   │
                                   ▼
                         [ get_db() Generator ]
                                   │
                                   ▼
                         [ AsyncSessionLocal ]
                                   │
                                   ▼
           ┌───────────────────────┴───────────────────────┐
           │ SQLAlchemy Session (Identity Map Workspace)   │
           └───────────────────────┬───────────────────────┘
                                   │
                                   ▼
           ┌───────────────────────┴───────────────────────┐
           │ Base Mapped Models (User, Conversation, etc.) │
           └───────────────────────────────────────────────┘
```

---

## Code Explanation

### 1. Database Connection (`backend/app/core/database.py`)
```python
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase

# Database Engine compiles SQL and caches sockets
engine = create_async_engine(settings.DATABASE_URL, pool_size=10, max_overflow=20)
# Session factory generates requests workspaces
AsyncSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
        # Session auto-closes when the generator block terminates
```

### 2. Time Auditing Mixin (`backend/app/core/database.py`)
```python
from datetime import datetime, timezone
from sqlalchemy import DateTime
from sqlalchemy.orm import Mapped, mapped_column

class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )
```

### 3. Model Declarations with Cascades (`backend/app/models/user.py`)
```python
import uuid
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.core.database import Base, TimestampMixin

class User(Base, TimestampMixin):
    __tablename__ = "users"
    
    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    # Cascade deletes: deleting a user deletes all their conversations automatically
    conversations: Mapped[list["Conversation"]] = relationship(
        "Conversation",
        back_populates="user",
        cascade="all, delete-orphan"
    )
```

---

## Production Practices

### 1. Database Indexing
Searching a database without an index forces a scan of every row in the table.
* **Index Analogy**: Think of looking for a word in a 500-page textbook. Instead of reading page 1 to 500 (Sequential Scan), you flip to the index page, search alphabetically, see it is on page 243, and jump straight there.
* **Practice**: Always add indexes to foreign keys and columns frequently used in `WHERE` and `JOIN` filters.

### 2. Connection Pooling Configuration
* `pool_size`: The number of permanent open socket connections kept in the pool.
* `max_overflow`: The maximum number of extra connections allowed to open under traffic spikes.
* Recycle idle connections regularly to prevent database disconnect timeouts.

### 3. Soft Deletes
Instead of hard deleting a row from disk, we set a `deleted_at` timestamp.
* **Soft Delete Analogy**: Rather than wiping a whiteboard drawing, we pull a curtain in front of it. It looks gone, but can be restored instantly if needed by sliding the curtain back.
* Queries must filter out records where `deleted_at is not Null`.

### 4. Connection Protocol Driver
Always use async driver protocols (`postgresql+asyncpg://`) in production to avoid forcing synchronous connections.

---

## Interview Questions

### Q1: What is the N+1 query problem, and how do we solve it?
* **Answer**: The N+1 query problem happens when you fetch a list of parent rows (1 query) and then, in a loop, fetch related child rows for each parent (N queries), totaling N+1 queries. We solve this in SQLAlchemy by configuring eager loading on the query using options like `selectinload()` (which runs a secondary batched query) or `joinedload()` (which executes a SQL JOIN).

### Q2: Why is `expire_on_commit=False` set in async session factories?
* **Answer**: By default, committing a transaction expires the python object attributes. Accessing these attributes later triggers a lazy-load database query to refresh them. In an asynchronous environment, this lazy loading will throw a `MissingGreenlet` exception. Setting `expire_on_commit=False` prevents attribute expiration.

### Q3: Why should all database timestamps use UTC with Timezone?
* **Answer**: Naive datetimes (without timezone offsets) are written using the host machine's timezone. If servers migrate across cloud regions (e.g. from US-East to EU-West), naive dates will drift and introduce chronological bugs. Storing dates in UTC timezone-aware columns ensures global consistency.

---

## Common Mistakes

### 1. Lazy Loading in Async Runtimes
Attempting to reference a relationship attribute (e.g. `user.conversations`) without pre-loading it throws:
`sqlalchemy.exc.MissingGreenlet: greenlet_spawn has not been called; can't call blocking io in this thread`
* *Solution*: Always pre-fetch relationships using `selectinload` or `joinedload` in queries.

### 2. Missing Index on Join Keys
Failing to index foreign key columns causes database queries to perform slow sequential table scans under load, causing massive bottleneck spikes.

---
---

# Chapter 3: Document Ingestion Pipeline

## Theory

### What is a RAG Ingestion Pipeline?
Retrieval-Augmented Generation (RAG) grounds LLM answers in real source material. Before a user can ask a question, the system must convert raw documents (PDFs, text files) into a format that can be semantically searched. This preparation phase is called the **ingestion pipeline**.

The pipeline has four stages:
1. **Extract** — parse raw bytes into readable text
2. **Chunk** — split text into sized segments that fit embedding model context windows
3. **Embed** — convert text segments to dense float vectors (Sprint B)
4. **Index** — store vectors in a vector database for similarity search (Sprint B)

Sprint A covers stages 1 and 2. Sprint B adds stages 3 and 4.

### Open/Closed Principle in the Ingestion Pipeline
Every swappable component (storage, extractor, chunker) is defined behind a **Python Protocol** — a structural interface. Concrete implementations satisfy the protocol without inheriting from it. Swapping Local → S3, PDF → DOCX, or Recursive → Semantic chunking requires changing **only `app/dependencies.py`**. Routes and services never change.

---

## Internal Working

### PDF Text Extraction
`pypdf` reads each page of the PDF and extracts text character-by-character from the internal object stream. For scanned (image-only) PDFs, extraction returns empty strings — OCR support would require a separate `TesseractExtractor` implementation.

Extraction runs in `asyncio.to_thread()` to avoid blocking the async event loop with CPU-bound PDF parsing.

### Recursive Chunking Strategy
```
Full Document Text
        │
        ▼ Step 1: Split on \n\n (paragraph boundaries)
[Para 1] [Para 2] [Para 3 — too large] [Para 4]
        │
        ▼ Step 2: Sliding window on oversized paragraphs
[Para 1] [Para 2] [Para 3a][Para 3b][Para 3c] [Para 4]
        │
        ▼ Step 3: Greedy merge of short adjacent paragraphs
[Chunk 1: Para 1 + Para 2] [Chunk 2: Para 3a] [Chunk 3: Para 3b + Para 4]
```
Each chunk records `char_start`, `char_end`, and `page_number` for citation generation in Sprint D.

---

## Architecture

### Component Placement in NexusAI
```
   HTTP POST /api/v1/documents/upload
               │
               ▼
   ┌─────────────────────────┐
   │  Route (documents.py)   │  ← Validates size, reads bytes, calls service
   └────────────┬────────────┘
                │
                ▼
   ┌─────────────────────────┐
   │   DocumentService       │  ← Orchestrates pipeline steps
   └──┬──────┬──────┬────────┘
      │      │      │
      ▼      ▼      ▼
  IFile  IDocument  IText        ← Ports (Protocols)
  Storage Extractor Chunker
      │      │      │
      ▼      ▼      ▼
  Local   Pdf    Recursive       ← Concrete implementations
  Storage Extractor Chunker
               │
               ▼
   ┌─────────────────────────┐
   │  DocumentRepository     │  ← All DB reads/writes
   └────────────┬────────────┘
                │
                ▼
   ┌─────────────────────────┐
   │  PostgreSQL             │  ← documents + document_chunks tables
   └─────────────────────────┘
```

### Port/Adapter Pattern
```
app/ports/           ← Interface definitions (Protocols)
    storage.py           IFileStorage
    extractor.py         IDocumentExtractor, PageContent
    chunker.py           ITextChunker, ChunkData
    embedding.py         IEmbeddingModel  (stub, Sprint B)
    vector_store.py      IVectorStore     (stub, Sprint B)
    llm.py               ILLMClient       (stub, Sprint C)

app/ingestion/       ← Concrete adapters
    storage/             LocalFileStorage → S3FileStorage (v0.4.0)
    extractors/          PdfExtractor → DocxExtractor (future)
    chunkers/            RecursiveChunker → SemanticChunker (v0.3.0)

app/dependencies.py  ← The ONLY wiring point
```

---

## Code Explanation

### 1. Python Protocol (Structural Interface)
```python
from typing import Protocol, runtime_checkable

@runtime_checkable
class IFileStorage(Protocol):
    async def save(self, file_id: str, content: bytes) -> str: ...
    async def delete(self, path: str) -> None: ...
```
`runtime_checkable` enables `isinstance(obj, IFileStorage)` checks at runtime — used in module-level assertions to detect interface drift immediately on startup.

### 2. Protocol Conformance Assertion
```python
# At the bottom of each concrete implementation file:
assert isinstance(LocalFileStorage(upload_dir="."), IFileStorage), (
    "LocalFileStorage does not satisfy IFileStorage protocol."
)
```
Fires when the module is first imported. If a protocol method is renamed or its signature changes, this fails immediately at startup rather than silently at runtime.

### 3. Thread Pool Offloading for Sync Libraries
```python
async def extract(self, file_path: str) -> list[PageContent]:
    return await asyncio.to_thread(self._extract_sync, file_path)
```
`asyncio.to_thread()` runs a synchronous blocking function in a thread pool without blocking the event loop. This is the standard pattern for integrating sync libraries (pypdf, PIL, pandas) inside async FastAPI routes.

### 4. Lifespan Context Manager
```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)  # startup
    yield
    # shutdown logic added here in future sprints
```
Replaces the deprecated `@app.on_event("startup")` decorator. The `yield` cleanly separates startup logic (before) from teardown logic (after).

---

## Production Practices

### 1. File Storage: Disk → Object Storage
Sprint A stores files on local disk. This works for single-server development but fails in a multi-instance production deployment where each server has its own disk. In v0.4.0, `LocalFileStorage` is replaced by `S3FileStorage` — swap requires changing only `app/dependencies.py`.

### 2. Ingestion: Synchronous → Background Worker
Sprint A runs the pipeline synchronously within the HTTP request. This can time out for large documents. In v0.4.0, the pipeline moves to a Celery/ARQ background worker: the endpoint returns immediately with a `task_id`, and the client polls a status endpoint.

### 3. Chunk Size Tuning
`CHUNK_SIZE` and `CHUNK_OVERLAP` are environment-configurable settings. The optimal values depend on the embedding model's token limit and document type. For OpenAI `text-embedding-3-small`, 2000 characters (≈500 tokens) is a safe default.

---

## Interview Questions

### Q1: Why not store PDF binary content in PostgreSQL directly?
**Answer**: Storing binary blobs in a relational database inflates table sizes, degrades query performance, and prevents CDN caching. The standard pattern is to store files in object storage (S3) and persist only the storage path in the database.

### Q2: What is the difference between a Python Protocol and an Abstract Base Class?
**Answer**: An ABC enforces inheritance — implementors must subclass it (`class MyClass(MyABC)`). A Protocol uses structural subtyping — any class implementing the required methods satisfies it without inheritance. Protocols are more flexible because they work with existing third-party classes.

### Q3: Why does RecursiveChunker split on paragraphs first?
**Answer**: A fixed character window blindly cuts mid-sentence and mid-paragraph, destroying semantic coherence. Paragraph splitting preserves natural language units. The sliding window is applied only as a fallback for oversized paragraphs.

---

## Common Mistakes

### 1. Running Sync I/O Inside Async Routes
Calling a synchronous blocking function directly inside `async def` freezes the entire event loop for all clients.
- *Wrong*: `text = PdfReader(path).pages[0].extract_text()` (inside async context)
- *Right*: `text = await asyncio.to_thread(extract_sync, path)`

### 2. Forgetting `selectinload` on Relationships
Accessing `document.chunks` without pre-loading raises `MissingGreenlet` in async SQLAlchemy.
- *Wrong*: `doc = await session.get(Document, id); count = len(doc.chunks)`
- *Right*: `select(Document).options(selectinload(Document.chunks))`

### 3. Hardcoding Chunk Size
Setting chunk size as a constant means redeployment is required to tune it. Load from environment-configurable `Settings` so operations teams can adjust without code changes.
