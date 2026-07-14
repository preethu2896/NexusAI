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

Setting chunk size as a constant means redeployment is required to tune it. Load from environment-configurable `Settings` so operations teams can adjust without code changes.

---
---

# Chapter 4: Embeddings, Vector Mathematics & Vector Databases

> **Sprint B — Semantic Search Engine | Milestone: v0.2.0 MVP**

---

## Part 1 — Embeddings

---

### What is an Embedding?

#### ELI5
Imagine you have a giant library with millions of books. If someone asks you "find me books about dogs," you cannot check every book. But what if every book had a GPS coordinate? Books about dogs would be near each other. Books about cats would be nearby too. Books about finance would be far away. An **embedding** is that GPS coordinate — a list of numbers that tells you where a piece of text lives in meaning-space.

#### Real-World Analogy
A colour can be described as three numbers: `(R, G, B)`. Red is `(255, 0, 0)`. Pink is `(255, 182, 193)`. They are numerically close because they are semantically related. Embeddings do the same for *words and sentences* — encode meaning as numbers so similar meanings produce numerically similar coordinates.

#### ASCII Diagram
```
  Text Input        Neural Network          Embedding Vector
 ─────────────   ──────────────────────   ───────────────────
"The dog runs"  →  [Transformer Encoder]  →  [0.21, -0.44, 0.88, ..., 0.12]
                                              ↑        1536 numbers ↑
"A puppy jogs"  →  [Transformer Encoder]  →  [0.20, -0.43, 0.87, ..., 0.11]
                                              (Very close! Same meaning)

"Stock markets" →  [Transformer Encoder]  →  [-0.91, 0.33, -0.07, ..., 0.67]
                                              (Far away! Different topic)
```

#### Technical Explanation
An embedding model is a neural network (typically a Transformer) trained to map any input text to a fixed-size dense vector in a high-dimensional space. The training objective ensures that **semantically similar texts are close together** in this space (small distance between their vectors) and semantically different texts are far apart.

The training process uses **contrastive learning**: pairs of similar sentences are pulled together in vector space, and dissimilar pairs are pushed apart. This is why `"The dog runs"` and `"A puppy jogs"` end up with nearly identical coordinates even though they share no words.

#### Why Can Text Be Represented as Numbers?
Text is discrete (words are symbols). But meaning is continuous and relational. A transformer model learns to encode the full *context* of a word — not just its identity but its relationships with surrounding words. By training on billions of documents, the model discovers that `dog` and `puppy` appear in similar contexts (they are described the same way, do the same things, appear alongside the same other words), and so they end up in similar positions in the vector space.

#### Dense vs Sparse Representations

| Feature | Sparse (TF-IDF, BM25) | Dense (Embeddings) |
| :--- | :--- | :--- |
| Representation | Very long vector, mostly zeros | Short dense vector, all values non-zero |
| Example | `[0, 0, 1, 0, 0, 3, 0, ...]` (one dim per word) | `[0.21, -0.44, 0.88, ...]` (fixed 768 dims) |
| Captures semantics | No — only exact word matches | Yes — similar meaning = similar vector |
| Captures synonyms | No — "dog" ≠ "puppy" | Yes — "dog" ≈ "puppy" |
| Storage | Large (vocabulary size) | Small (fixed dimension) |
| Used in | BM25 keyword search | Semantic search, RAG |

#### Embedding Dimensions
The vector size is a model design choice:
```
Model                        Dimensions   Notes
─────────────────────────────────────────────────────────
all-MiniLM-L6-v2 (local)         384    Fast, small, good quality
all-mpnet-base-v2 (local)         768    Better quality, 2× larger
BAAI/bge-base-en-v1.5             768    Top open-source model
OpenAI text-embedding-3-small    1536    API, high quality
OpenAI text-embedding-3-large    3072    API, highest quality
```
More dimensions → more expressive space → better quality → higher storage cost. For MVP, 384 dimensions with `all-MiniLM-L6-v2` gives excellent quality with fast local inference.

---

### Sentence Transformers vs OpenAI Embeddings

| | Sentence Transformers (Local) | OpenAI API |
| :--- | :--- | :--- |
| Cost | Free (compute only) | $0.02 per 1M tokens |
| Privacy | Data stays local | Data sent to OpenAI |
| Speed | 50–300ms per batch (CPU) | 200–500ms per call |
| Quality | Very good (MTEB benchmark) | Best in class |
| Internet required | No | Yes |
| Offline capable | Yes | No |

**MVP choice**: `sentence-transformers` with `all-MiniLM-L6-v2` — free, local, no API key, fast enough for development. Swappable to OpenAI via `IEmbeddingModel` in `dependencies.py`.

---

## Part 2 — Vector Mathematics

---

### Vectors
A vector is an ordered list of numbers: `v = [0.21, -0.44, 0.88]`. In embedding space, each dimension captures some latent semantic feature (not directly interpretable, but learned during training). Two vectors are compared using a **distance or similarity metric**.

```
               ↑ dim2
               │
   "puppy" •──────────────────────────────
               │      ↗ nearby
   "dog"   •──────── ↗
               │
               │                  • "stock market"  (far away)
               └────────────────────────────────→ dim1
```

### Cosine Similarity
```
                   A · B
  cos(θ) = ─────────────────
             ‖A‖ × ‖B‖

Where:
  A · B  = dot product (sum of element-wise products)
  ‖A‖    = magnitude (Euclidean length) of vector A
  ‖B‖    = magnitude (Euclidean length) of vector B

Result range: [-1, 1]
  1.0  = identical direction (semantically identical)
  0.0  = perpendicular (unrelated)
 -1.0  = opposite direction (antonyms)
```

**Example:**
```
A = [1, 0, 1]      (embedding for "dog")
B = [0.9, 0.1, 0.9] (embedding for "puppy")
C = [-0.9, 0.1, -0.9] (embedding for "antonym of dog")

cos(A, B) = (0.9 + 0 + 0.9) / (√2 × √(0.81+0.01+0.81)) ≈ 0.99  ← very similar
cos(A, C) = (-0.9 + 0 - 0.9) / (√2 × √(...))             ≈ -0.99 ← opposite
```

### Why Cosine Similarity is Preferred Over Euclidean Distance
```
Euclidean distance measures absolute position.
Cosine similarity measures angular direction.

Problem with Euclidean in high dimensions:
  A "dog" sentence: [0.21, -0.44, 0.88, ...]     ← short document
  B "dog" sentence: [0.42, -0.88, 1.76, ...]     ← long document (twice as long)

  Euclidean distance: LARGE (they look far apart)
  Cosine similarity:  1.0  (same direction = same meaning)

Cosine similarity is SCALE-INVARIANT — long and short documents about the
same topic compare correctly, because it only measures angle, not magnitude.
```

### Vector Normalization
When vectors are L2-normalized (each vector divided by its magnitude so `‖v‖ = 1`), cosine similarity becomes equivalent to the dot product:
```
  cos(A, B) = A · B      (when ‖A‖ = ‖B‖ = 1)
```
This is significant: most vector databases (including ChromaDB) normalize vectors and then use fast dot product operations instead of the full cosine formula, making search much faster.

---

## Part 3 — Vector Databases

---

### Why SQL Databases Are Inefficient for Semantic Search

#### ELI5
A traditional database is like a dictionary — it can find "dog" instantly because it knows exactly where "dog" is alphabetically. But if you ask "find me words that mean something like dog," the dictionary cannot help — it has no concept of meaning similarity.

A vector database is like a library organized by *topic*. All the animal books are in one area, all the finance books in another. You walk to the "animal" area, and everything nearby is relevant.

#### The SQL Problem
```sql
-- This only finds EXACT matches. "puppy" and "canine" would not appear.
SELECT * FROM chunks WHERE content LIKE '%dog%';

-- Even this fails for semantic similarity:
-- "The Labrador fetched the ball" matches "dog" concepts but contains no keyword.
```

SQL uses B-tree or hash indexes — both are designed for **exact match** or **range queries** on ordered data. They have no concept of similarity in high-dimensional space.

### Exact Search vs Approximate Nearest Neighbour (ANN)

**Exact KNN (k-Nearest Neighbours):**
- Compute distance from query to EVERY vector in the database
- Return the k smallest distances
- Time complexity: `O(N × D)` where N = vectors, D = dimensions
- At 1M vectors × 768 dims: 768 million multiplications per query → 200–500ms
- **Unusable at scale**

**Approximate Nearest Neighbour (ANN):**
- Build an index that organises vectors into navigable clusters
- Search only a small region of the space near the query
- Time complexity: `O(log N)` — nearly constant regardless of collection size
- Trade-off: ~5% chance of missing the absolute nearest neighbour
- At 1M vectors: 2–5ms per query → **production-ready**

### HNSW Index (Hierarchical Navigable Small World)

This is the algorithm that makes modern vector databases fast. It is used by ChromaDB, Qdrant, Weaviate, and pgvector.

```
HNSW builds a multi-layer graph of vectors:

Layer 2 (sparse):  A ──── C ──── F
                           │
Layer 1 (medium):  A ── B ── C ── D ── F
                               │
Layer 0 (dense):   A─B─C─D─E─F─G─H─I (all vectors connected to neighbours)

Search algorithm:
1. Enter at top layer, find the closest node to query Q
2. Descend to next layer, starting from that node
3. Greedily traverse to closer neighbours
4. Repeat until Layer 0, collect top-K results

Result: Finds approximate nearest neighbours in O(log N) time
```

**Why it works**: It's inspired by the "six degrees of separation" concept — any node is reachable from any other node in a small number of hops via well-connected "hub" nodes at higher layers.

---

## Part 4 — ChromaDB

---

### What is ChromaDB?

#### ELI5
ChromaDB is like a filing cabinet specifically designed to store GPS coordinates (vectors) alongside the original documents they represent. When you ask "find documents near this coordinate," ChromaDB can search through millions of coordinates in milliseconds and hand you back the original documents.

#### Internal Architecture
```
ChromaDB Instance
│
├── Collections (like SQL tables)
│   ├── Collection: "nexusai_chunks"
│   │   ├── Segment: HNSW Vector Index      ← for fast similarity search
│   │   └── Segment: SQLite Metadata Store  ← for filtering by metadata
│   └── Collection: "nexusai_other"
│
├── Persistence Layer
│   ├── DuckDB (metadata + IDs)             ← local persistence
│   └── HNSW files (vector data)            ← binary index files
│
└── API Layer
    ├── Python client (used directly in-process)
    └── HTTP server mode (for multi-process access)
```

### ChromaDB Core Concepts

**Collection**: A named namespace of vectors. Equivalent to a table. Each collection has its own HNSW index.
```python
collection = client.get_or_create_collection("nexusai_chunks")
```

**Document ID**: Every vector has a unique string ID. In NexusAI, this is the chunk UUID as a string.

**Embedding**: The actual float vector stored and indexed.

**Metadata**: A flat JSON dict stored alongside the vector. Supports equality and range filter on queries.
```python
metadata = {
    "document_id": "3fa85f64-...",
    "chunk_index": 7,
    "page_number": 3,
    "filename": "security-policy.pdf"
}
```

**Document text**: ChromaDB can also store the original text. We store it here so queries return the chunk text directly without a PostgreSQL round-trip.

### ChromaDB Query Lifecycle
```
query_embeddings=[[0.21, -0.44, ...]]
query_where={"document_id": "3fa85f64-..."}
n_results=5
           │
           ▼
┌──────────────────────────────────┐
│ 1. Apply metadata pre-filter     │ ← SQLite WHERE query
│    WHERE document_id = '...'     │    narrows candidate set
└──────────────────┬───────────────┘
                   │
                   ▼
┌──────────────────────────────────┐
│ 2. HNSW ANN search on candidates │ ← searches HNSW graph
│    find top-5 nearest vectors    │    returns approximate KNN
└──────────────────┬───────────────┘
                   │
                   ▼
┌──────────────────────────────────┐
│ 3. Return results with distances │ ← cosine distances
│    ids, documents, metadatas     │
└──────────────────────────────────┘
```

### Storage Layout (Local Persistence)
```
chroma_db/                          ← CHROMA_PERSIST_DIR setting
├── chroma.sqlite3                  ← metadata, IDs, embeddings table
└── {uuid}/
    ├── header.bin                  ← HNSW index config
    ├── data_level0.bin             ← Layer 0 graph (all vectors)
    └── link_lists.bin              ← Higher layer links
```

---

## Part 5 — Full Pipeline Architecture (Sprint B)

```
                     SPRINT A (already built)
  PDF Upload
      │
      ▼
  PdfExtractor → RecursiveChunker → PostgreSQL (document_chunks)
                                          │
                                ─ ─ ─ ─ ─ ┘ (Sprint B picks up here)
                     SPRINT B
      │
      ▼
  POST /documents/{id}/index
      │
      ▼
  ┌────────────────────────────┐
  │   RetrievalService         │
  │   .index_document()        │
  └──────────┬─────────────────┘
             │
             ├──► EmbeddingRepository.get_chunks(document_id)
             │         (read from PostgreSQL)
             │
             ├──► IEmbeddingModel.embed(texts)
             │         SentenceTransformerEmbedding
             │         input:  ["chunk 1 text", "chunk 2 text", ...]
             │         output: [[0.21, ...], [0.44, ...], ...]
             │
             ├──► IVectorStore.upsert(collection, ids, vectors, metadatas)
             │         ChromaVectorStore
             │         stores vectors + metadata in ChromaDB
             │
             └──► EmbeddingRepository.mark_embedded(chunk_ids, model)
                       (update embedding_metadata in PostgreSQL)

  POST /api/v1/search
      │
      ▼
  ┌────────────────────────────┐
  │   RetrievalService         │
  │   .search(query, top_k)    │
  └──────────┬─────────────────┘
             │
             ├──► IEmbeddingModel.embed([query_text])
             │         converts query to vector
             │
             └──► IVectorStore.query(collection, vector, top_k)
                       ChromaVectorStore
                       returns: ids, distances, metadatas, documents
                       (ranked by cosine similarity — most relevant first)
```

---

## Performance Discussion

### Embedding Generation Cost
- `all-MiniLM-L6-v2` on CPU: ~50ms for 32 chunks in a batch
- Batching is critical: embedding 1 chunk at a time = 100ms each; 32 chunks at once = 1.5ms each
- For a 100-page PDF (≈200 chunks), total embedding time on CPU: ~5–10 seconds
- In production (GPU): <1 second for the same 200 chunks

### Storage Requirements
- 384 dimensions × 4 bytes/float = 1,536 bytes per vector
- 1 million chunks = 1.5 GB vector storage
- ChromaDB also stores metadata + text: add 0.5–1 KB per chunk
- 1 million chunks total: approximately 2–3 GB

### Search Complexity
- Exact KNN at 1M vectors: ~500ms
- HNSW ANN at 1M vectors: ~2–5ms
- HNSW ANN at 10M vectors: ~5–15ms (nearly linear growth in log scale)

---

## Production Best Practices

### 1. Model Versioning
Never silently change the embedding model. If you embed with Model A and search with Model B, the vectors are in incompatible spaces — similarity scores are meaningless. Always store `model_name` in `embedding_metadata` and prevent mixing.

### 2. Embedding Drift & Re-indexing
When you upgrade the embedding model, you must re-embed every chunk. Design for this from the start: the `EmbeddingRepository.mark_embedded()` records which model embedded each chunk, enabling targeted re-indexing (`WHERE model_name = 'old-model'`).

### 3. Batch Embedding
Always embed in batches. Typical batch sizes: 32–256 chunks. This is 10–100× faster than embedding one at a time.

### 4. Collection Design
- **One collection per application**: simple, but cannot filter by user
- **One collection per document**: clean isolation, expensive to scale
- **One shared collection with metadata filters**: scalable, requires careful metadata design

NexusAI MVP uses one shared collection `nexusai_chunks` with document-level metadata filtering.

### 5. Metadata Filtering
ChromaDB supports `where` filters on any stored metadata field:
```python
results = collection.query(
    query_embeddings=[...],
    where={"document_id": "3fa85f64-..."},  # restrict to one document
    n_results=5
)
```
Plan metadata schema carefully — you cannot add new filterable fields to existing vectors without re-inserting them.

---

## Interview Questions

### Beginner
1. **What is an embedding?** A fixed-size numerical vector that represents the semantic meaning of a text, where similar meanings produce numerically similar vectors.
2. **Why can't SQL `LIKE` find semantically similar text?** SQL LIKE does exact string pattern matching. It has no concept of semantic similarity — "dog" and "puppy" match nothing in common.
3. **What is cosine similarity?** A measure of the angle between two vectors. Returns 1.0 for identical direction, 0 for perpendicular, -1 for opposite. Used in semantic search because it is scale-invariant.
4. **What is a vector database?** A specialized database designed to store high-dimensional vectors and perform fast approximate nearest-neighbour similarity searches.
5. **What is a collection in ChromaDB?** A named namespace of vectors, equivalent to a table. Has its own HNSW index and metadata store.

### Intermediate
1. **Why is cosine similarity preferred over Euclidean distance for text embeddings?** Cosine similarity is scale-invariant. Long and short documents about the same topic produce vectors in the same direction but different magnitudes. Cosine similarity correctly identifies them as similar; Euclidean distance would penalize the length difference.
2. **What is the difference between exact KNN and ANN?** Exact KNN scans every vector (O(N×D)), guaranteeing the true nearest neighbours. ANN (e.g., HNSW) builds an index for O(log N) search with a small approximation error (~5% miss rate). ANN is production-necessary at scale.
3. **What is HNSW and why does it work?** Hierarchical Navigable Small World — a multi-layer graph index. Upper layers are sparse (long-range connections), lower layers are dense (short-range). Search starts at top, descends greedily. Works because of the "small world" property: any vector is reachable from any other in O(log N) hops.
4. **What happens if you embed with one model and search with another?** The results are garbage. Each model produces vectors in its own learned coordinate space. Mixing models is like measuring distances in miles on one map and kilometres on another.
5. **What is embedding drift and how do you handle it?** Over time, upgrading the embedding model causes stored vectors (old model) to be incompatible with new query vectors. Handle it by: storing model name with each vector, detecting version mismatches, and running full re-indexing jobs when upgrading models.

### Senior
1. **How would you design a multi-tenant vector search system where users cannot see each other's documents?** Options: (a) separate ChromaDB collections per tenant (expensive), (b) single collection with `user_id` metadata filter on every query (scalable), or (c) namespace-aware vector store like Qdrant with payload filters. The metadata filter approach scales to millions of documents but requires the filter to be applied at the HNSW pre-filter stage for performance.
2. **How would you handle the cold start problem when re-embedding millions of chunks after a model upgrade?** Design a background re-indexing job: (1) create a new ChromaDB collection for the new model, (2) batch-embed all chunks in parallel workers (Celery), (3) dual-write to both collections during transition, (4) switch traffic to new collection atomically, (5) delete old collection.
3. **Compare ChromaDB, pgvector, and Qdrant for a production RAG system at 100M documents.** ChromaDB: excellent for development/small scale, embedded mode does not scale horizontally. pgvector: integrates with existing PostgreSQL, no additional infra, but HNSW is single-server. Qdrant: purpose-built, distributed, supports sharding across nodes, recommended for 100M+ scale with production SLAs.
4. **What is the ANN recall-speed tradeoff and how do you tune it in HNSW?** HNSW has parameters `ef` (search beam width) and `ef_construction` (index build beam width). Higher `ef` = more candidates examined = higher recall = slower search. For production RAG: `ef=200` gives 98%+ recall at 5–10ms latency. For real-time: `ef=64` gives 95% recall at 2ms.
5. **Why might dense retrieval alone be insufficient and what hybrid approach would you recommend?** Dense retrieval misses exact keyword matches (e.g., product codes, names, acronyms). Sparse retrieval (BM25) excels at exact matching but misses semantic meaning. **Hybrid retrieval** — combine dense cosine similarity scores with BM25 scores using RRF (Reciprocal Rank Fusion) — achieves best of both. This is implemented in Sprint v0.3.0 (Agentic Upgrade).

---

## Common Mistakes

### 1. Not Normalising Vectors Before Dot Product Search
If your vector store uses dot product (not cosine), unnormalized vectors give wrong similarity scores — longer documents score higher regardless of relevance. Always normalize before storing or use a vector store that normalizes internally (ChromaDB does this by default for cosine).

### 2. Embedding One Chunk at a Time
```python
# Wrong — 200 sequential API calls:
for chunk in chunks:
    embed(chunk.text)

# Right — one batched call:
embed([chunk.text for chunk in chunks])
```
Batching is 10–100× faster due to GPU parallelism and reduced API round-trips.

### 3. Storing Embeddings Without Model Metadata
Without recording which model produced each embedding, you cannot detect incompatible vectors after a model upgrade. Always store `model_name` and `vector_dimension` in `embedding_metadata`.

### 4. Using ChromaDB in Ephemeral Mode in Production
`chromadb.Client()` (no persist path) stores data in memory only — lost on restart. Always use `chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)`.

### 5. Not Using Metadata Filtering
Searching across all chunks when the user is querying a specific document is wasteful and returns results from unrelated documents. Always filter by `document_id` (or user scope) in the `where` clause.

---

## Part 6 — Large Language Models & Retrieval-Augmented Generation (RAG) (Sprint C)

### Dynamic RAG Generation Lifecycle
In the Retrieval phase (Sprint B), we mapped the user's question to a dense vector, performed an ANN similarity search on ChromaDB, and retrieved the top-K relevant text chunks.
In the Generation phase (Sprint C), we combine these retrieved context chunks and the user's question into a structured prompt, feed it to the Large Language Model, and return a factually grounded answer with citations.

The data flow is structured as follows:
```
[User Query] + [Top-K Relevant Chunks (with page markers)]
      │
      ▼
┌──────────────┐
│Prompt Builder│ ──► Truncates context dynamically to fit token budget (using tiktoken)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  LLM Client  │ ──► gpt-4o-mini (temperature=0.0)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│RAG Generator │ ──► Grounded response string
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Chat Service │ ──► Parsed unique citations list [e.g. 2, 4] + latency tracking
└──────────────┘
```

### Prompt Engineering and Constraints
To guarantee that the LLM does not hallucinate, we use a rigid `RAG_SYSTEM_PROMPT` containing specific rules:
1. **Factual Grounding**: The LLM must answer using only the provided context. If the context does not contain the answer, it must output exactly: `"I don't know based on the provided documents."`
2. **Conciseness**: Answers must be factual and clear, avoiding verbose explanations.
3. **Citation Formatting**: Whenever the model relies on a fact, it must append `[Page X]` referencing the page number header.

### Context Budgeting & Truncation
To prevent token window overflow, the `PromptBuilder` uses the `tiktoken` library (or character heuristic fallback) to calculate prompt length. If the combined token count of the system prompt, context chunks, and user query exceeds the `max_context_tokens` ceiling, lower-ranked chunks are excluded dynamically to preserve the token budget.

### Citation Parsing
When the response is returned from the LLM, the `ChatService` scans the text response using regular expressions (`\[Page (\d+)\]`) to find all unique page citations and returns them in the response metadata as `citations`.

---

## Part 6 Performance Discussion

### 1. Context Window vs. Cost
- Modern models like `gpt-4o-mini` support massive context windows (128K tokens), but the cost scales linearly with the input length. 
- In addition, latency scales with the prompt size because the self-attention mechanism must attend over the entire context. Keeping $K$ constrained (e.g. $K=5$, approximately 2000 tokens) is optimal for speed and cost.

### 2. Output Token Latency
- LLMs generate tokens auto-regressively (one token at a time). Generation speed is model-dependent: `gpt-4o-mini` generates at roughly 80-100 tokens per second.
- Capping `max_tokens` (e.g. 1024 tokens) prevents excessive costs and protects against endless generation loops.

---

## Part 6 Production Best Practices

### 1. Multi-Model Fallbacks
Implement error handling in the adapter. If the primary API provider is down or rate-limited, catch the exception and redirect the call to a secondary model (e.g. a local Ollama instance or Anthropic's Claude API).

### 2. Input caching
Reusing the exact system prompt prefix allows the API provider to cache the prompt, reducing costs by up to 50% and retrieval latency by up to 2x.

### 3. Parse and Validate citations
Always double-check that the pages cited by the LLM are actually in the list of pages supplied in the context. This prevents the model from hallucinating citation markers.

---

## Part 7 — Conversation Management & Chat Memory (Sprint D)

### Conversation Database Modeling
AI conversation systems require parent-child relational structures to associate a thread context with individual messages.
- **`conversations` Table**: The parent thread model containing a system user foreign key, created timestamps, and descriptive titles.
- **`messages` Table**: The child record containing message payload (`role`, `content`), execution details (`model_used`, `latency_ms`), and structured references.

### Cascading Deletions and Cascade Constraints
To maintain relational integrity, deleting a conversation thread must automatically remove all child message blocks. This is configured in the database layer via:
- SQL foreign key definitions: `ON DELETE CASCADE`
- SQLAlchemy relationships: `cascade="all, delete-orphan"`

Cascade bounds prevent orphaned records from consuming storage space without references.

### Indexing and Scaling Message History
Reading chat logs requires indexing the foreign key `messages.conversation_id`.
- Without indexes, fetching history for a thread is an $O(N)$ full table scan, causing latency to degrade linearly as the total messages table size grows.
- Indexing resolves lookups to $O(\log N)$ B-Tree queries.
- Sorting must be enforced chronologically using sequence IDs or sequential timestamps (`ORDER BY created_at ASC`).

### Structured Citation Mapping
RAG systems store citation links natively using `JSON` or `JSONB` database column types rather than parsing raw text strings during read operations.
- The `ChatService` maps cited pages to their retrieved database counterparts.
- Structured Citation Schema:
  ```json
  {
    "document_id": "c3e9812a-89a1...",
    "chunk_id": "89b3f021-cd34...",
    "page": 2,
    "score": 0.7257
  }
  ```
This structure preserves traceability, allowing visual frontends to highlight exact matches.

### Pagination Patterns for Chronological Feeds
Production chat platforms never fetch the complete message list at once. Instead, they use offset-based pagination:
```python
query = (
    select(Message)
    .where(Message.conversation_id == id)
    .order_by(Message.created_at.asc())
    .limit(limit)
    .offset(offset)
)
```
This protects service layers from memory overload when retrieving long-lived conversation threads.

---

## Part 7 Performance Discussion

### 1. Database Indexing Cost
While indexes speed up message reads, they add database write overhead. Because every chat query results in 2 writes (1 User question, 1 Assistant response), indexes on `messages.conversation_id` and `messages.created_at` must be pruned of redundant constraints to optimize transaction throughput.

### 2. Transaction Splitting
For large installations, routing heavy message inserts to primary databases while serving history list queries from read-replicas prevents primary thread lockups.

---

## Part 7 Production Best Practices

### 1. GDPR Right to Be Forgotten
Under privacy laws, users must be allowed to completely erase their data. Cascade deletion triggers must execute hard-deletes on `messages` and related objects when a user deletes a thread.

### 2. Data Retention Limits
Implement background cleaning workers to archive or delete conversation logs older than a specified period (e.g. 180 days) to manage database size and data liabilities.

### 3. Session Isolation
Ensure that a conversation's messages are only accessible by the authorized owner of that thread by verifying the `user_id` context inside the repository or query filter layer.

---

## Part 8 — Streaming AI Responses with Server-Sent Events (SSE) (Sprint E)

### Real-Time Streaming and SSE
Rather than buffering complete text payloads on the server, real-time AI platforms push token streams to the browser.
- **Server-Sent Events (SSE)**: A unidirectional protocol over HTTP that streams text bytes chunk-by-chunk using `Content-Type: text/event-stream`.
- **Chunked Transfer Encoding**: Pushing dynamic payloads where the final size is unknown. Standardized using `Transfer-Encoding: chunked` header.

### Async Generators and Event Loop Yielding
FastAPI utilizes Python's async generators and `yield` statements to stream response tokens.
- Running `async def` functions with `yield` returns an iterator.
- Pushing chunks to `StreamingResponse` yields control back to the event loop, enabling concurrency without blocking thread workers.

### Dynamic Connection Closure and Task Cancellation
When a client disconnects (e.g. closes the browser tab), the underlying ASGI server detects the socket closure and raises an `asyncio.CancelledError` inside the active generator task.
- Developers use `try...except asyncio.CancelledError` blocks to abort the stream gracefully.
- This prevents incomplete or garbage text queries from being written to the PostgreSQL database if a query is aborted early.

### Structured SSE Event Protocols
To allow client-side interfaces to parse chunk payloads, events are structured as JSON strings:
```text
data: {"type": "token", "content": "According"}

data: {"type": "citation", "page": 2}

data: {"type": "metadata", "model_used": "gpt-4o-mini", "latency_ms": 250.0}

data: {"type": "done"}
```

---

## Part 8 Performance Discussion

### 1. Time To First Token (TTFT)
The primary KPI for streaming interfaces. Optimized by:
- Directing vector store queries to local indices (minimizing retrieval to <10ms).
- Immediate yielding of first delta tokens before starting PG write operations.

### 2. Backpressure Management
If the client cannot consume data as fast as it is generated, TCP buffers fill up. An async ASGI engine (like Uvicorn) propagates backpressure, pausing the async generator block until buffers clear, protecting memory from leak drift.

---

## Part 8 Production Best Practices

### 1. Load Balancer Configuration
Ensure proxy buffering is disabled (e.g., `proxy_buffering off;` in Nginx) and persistent socket timeouts are raised to prevent intermediate nodes from holding or terminating the event stream.

### 2. Keep-Alive Heartbeats
If an LLM has a long delay between token yields, intermediate networks may close the connection. Yielding empty comment lines (`: keep-alive\n\n`) every 15 seconds prevents timeouts.
