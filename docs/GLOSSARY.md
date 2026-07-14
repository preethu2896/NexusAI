# NexusAI Glossary of Terms

This glossary defines core engineering, database, and AI systems terms used throughout the NexusAI codebase.

---

### RDBMS (Relational Database Management System)
A database engine based on the relational model (organizing data into tables of rows and columns), enforcing relational checks, indexing, and ACID constraints. Example: PostgreSQL.

### SQL (Structured Query Language)
A declarative language used to query, update, insert, and delete data in relational databases.

### ORM (Object-Relational Mapper)
A programming layer that maps relational database tables directly to object-oriented code classes, allowing queries and updates using class structures rather than raw SQL text strings.

### Engine (SQLAlchemy)
The low-level coordinator in SQLAlchemy that opens connection pools, translates dialect styles, and communicates directly with the database socket drivers.

### Session (SQLAlchemy)
A transactional workspace in SQLAlchemy that holds objects fetched or created during a single operation scope. Handles transactions and compiles changes into single commit batches.

### Declarative Base
A common Python superclass in SQLAlchemy that acts as a registry, mapping code metadata models to actual database schema structures.

### Primary Key
A unique column or group of columns that uniquely identifies a row in a table. It cannot contain null values.

### Foreign Key
A column that links a child row to a parent row by referencing the parent's primary key, enforcing relational consistency.

### UUID (Universally Unique Identifier)
A 128-bit value randomly generated that is guaranteed to be unique across all databases and hosts, eliminating ID collisions.

### Index
A database search tree (usually B-Tree) created on specific columns that speeds up searches at the cost of additional write overhead and storage space.

### Soft Delete
An data isolation pattern where rows are not deleted from disk but are marked as inactive using a boolean flag or timestamp (e.g. `deleted_at`), making them invisible to standard queries.

### Eager Loading
A query loading strategy that fetches parent and related child data in a single SQL operation using database joins, preventing subsequent database round-trips.

### Lazy Loading
The default ORM loading strategy where relational child data is not fetched from the database until the object attribute is explicitly accessed in the code.

### N+1 Query Problem
A performance bug where a loop fetches parent records (1 query) and then executes a separate query for every parent's child records (N queries), resulting in N+1 database queries.


### Connection Pooling
A cache of open database connection sockets that are shared and recycled across requests, preventing connection exhaustion and handshake latency.

### RAG (Retrieval-Augmented Generation)
An AI architecture that grounds LLM responses in real source documents. Before generating an answer, the system retrieves the most relevant document chunks and includes them in the LLM prompt as context, reducing hallucinations.

### Ingestion Pipeline
The multi-step process of converting raw document files (PDFs, DOCX, etc.) into semantically searchable data. Stages: Extract → Chunk → Embed → Index.

### Chunking
The process of splitting extracted document text into smaller, sized segments called chunks. Each chunk has a defined maximum character/token length and may overlap with adjacent chunks to preserve context at boundaries.

### Document Chunk
A single text segment produced by the chunker, representing a portion of a source document. Each chunk records its source page number and character offsets to enable precise citations in query responses.

### Python Protocol (Structural Interface)
A Python typing construct (PEP 544) that defines an interface through method signatures without requiring inheritance. Any class implementing the required methods satisfies the protocol. Used in NexusAI to define swappable component contracts (IFileStorage, IDocumentExtractor, ITextChunker, etc.).

### Port / Adapter Pattern
An architectural pattern where business logic communicates only through abstract interfaces (Ports). Concrete implementations (Adapters) satisfy these interfaces and are injected at runtime. Enables swapping implementations (Local → S3, PDF → DOCX) without modifying business logic.

### asyncio.to_thread()
A Python asyncio utility that runs a synchronous blocking function in a separate thread pool, allowing it to execute without blocking the async event loop. Used in NexusAI to integrate synchronous libraries (like pypdf) into async FastAPI routes.

### Lifespan Handler
A FastAPI application lifecycle manager (using `@asynccontextmanager`) that runs initialization logic before the server accepts requests (startup) and cleanup logic after it shuts down (teardown). Replaces the deprecated `@app.on_event` decorator.
