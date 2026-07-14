# ADR-0004: Use ChromaDB for local vector database in Basic RAG

* **Status**: Accepted
* **Date**: 2026-07-14
* **Author**: Senior AI Engineer & Architect

---

## Context
NexusAI needs to perform semantic searches on text chunks extracted from uploaded documents. To do this, text chunks must be converted into high-dimensional vector embeddings, stored in a specialized database, and retrieved using approximate nearest-neighbour (ANN) similarity search.

## Problem Statement
We need a vector database (vector store) that:
1. Is lightweight, developer-friendly, and runs locally for prototyping and MVP stages.
2. Supports persistent disk storage so vector data survives application restarts.
3. Provides metadata filtering (e.g., filtering search results by `document_id` or `user_id`).
4. Offers high performance with HNSW-based index queries.
5. Can be easily abstracted behind our Port/Adapter pattern to allow swapping with pgvector or Qdrant in later production stages.

## Decision
We choose **ChromaDB** in Persistent mode as the vector database for our Basic RAG (v0.2.0) milestone.

## Alternatives Considered

### 1. pgvector (PostgreSQL extension)
* **Why rejected for MVP**: While pgvector is excellent for keeping all data within PostgreSQL, it requires installing the pgvector extension inside the PostgreSQL container, creating additional configuration overhead. For the MVP, we want a clean separation of concerns and immediate setup capability. In v0.4.0, we will compare pgvector against ChromaDB as an alternative implementation.

### 2. Qdrant
* **Why rejected for MVP**: Qdrant is a powerful distributed vector store, highly suited for scaling to millions of documents. However, it requires running a separate service container and adds network latency. We want a fast, zero-dependency embedded vector store for local development. We plan to migrate to Qdrant or similar distributed databases in v0.3.0/v1.0.0.

---

## Trade-offs (Advantages & Disadvantages)

### Advantages
* **Embedded Mode**: Runs in-process with a persistent SQLite back-end, eliminating the need to spin up and maintain another standalone database server container.
* **Auto-indexing**: Automatically manages index creation (defaulting to HNSW graph index with cosine space metrics).
* **Metadata Filtering**: Native support for dictionary queries directly on HNSW layers.
* **Easy API**: Python native client with minimal boilerplate.

### Disadvantages
* **Horizontal Scalability**: Being in-process, it does not scale horizontally out of the box and is memory-constrained on a single machine.
* **Concurrency limits**: Multi-process access is restricted due to SQLite file locks in persistent mode.

---

## Consequences
* We will define the `IVectorStore` port and implement a `ChromaVectorStore` adapter.
* ChromaDB data will be stored locally in the `chroma_db` folder (which is ignored by Git).
* Vector lookups will be filtered by `document_id` to ensure isolated semantic search scope.

---

## Industry Practices
ChromaDB is the primary go-to choice for prototyping RAG systems and building small-to-medium agent workloads due to its simplicity, speed of iteration, and robustness in local-first storage.
