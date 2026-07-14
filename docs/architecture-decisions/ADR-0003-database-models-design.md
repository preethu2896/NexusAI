# ADR-0003: Database Models and Schema Design for NexusAI

* **Status**: Accepted
* **Date**: 2026-07-13
* **Author**: Senior AI Engineer & Architect

---

## Context
We are constructing the transactional core of NexusAI. The application metadata layer must track users, chat threads (conversations), individual chat messages, uploaded documents, document text chunks, and embedding configurations.

## Problem Statement
We need a schema design that:
1. Ensures total data isolation per user to comply with security requirements.
2. Supports scalable text retrieval (RAG) by cleanly mapping documents to chunks.
3. Decouples vector indexing structures (models, dimensions) from raw text chunks.
4. Prevents data fragmentation (orphaned rows) during delete actions.
5. Scales horizontally by avoiding sequential ID predictions.

## Decision
We establish a normalized, relational database schema with the following attributes:
* **UUIDv4 Primary Keys**: All records use UUID identifiers instead of sequential integers.
* **TimestampMixin**: Every table contains auto-updating `created_at`, `updated_at`, and `deleted_at` fields.
* **Cascading Foreign Keys**: Relational deletions cascade automatically from parent tables (`users`) to children (`conversations`, `documents`).
* **Granular Chunk Separation**: Document chunks are stored in an independent `document_chunks` table linked by foreign key to `documents`, rather than stored as an array within the document row.
* **One-to-One Embedding Metadata**: Embedding metrics (dimension, model) are isolated in an `embedding_metadata` table.

## Alternatives Considered

### 1. Integer-based sequential Primary Keys
* **Why rejected**: Sequential IDs (1, 2, 3...) make it trivial for external scrapers to cycle public URLs (e.g. `/api/v1/documents/3`) and scrape system data. Additionally, merging tables from different server environments creates primary key collisions.

### 2. Storing document text chunks directly inside the Document table (as JSON Arrays)
* **Why rejected**: Relational operations (like searching for a single chunk's citations or updating a single chunk's text) would require loading and rewriting the entire document array in memory, causing severe lock contentions and slow index lookups.

---

## Trade-offs (Advantages & Disadvantages)

### Advantages
* **Isolation**: All queries are namespaces by `user_id`, maintaining tenant separation.
* **Referential Integrity**: Cascading foreign keys guarantee that deleting a user clears their chats and uploads, satisfying compliance audits (e.g., GDPR).
* **Future-Proofing**: Splitting embeddings metadata into its own table allows us to swap vector models or track hybrid indexing metrics without modifying the core document tables.

### Disadvantages
* **UUID Index Size**: UUIDs consume 16 bytes compared to 4 bytes for standard integers, leading to larger B-Tree index sizes in RAM.
* **Join Complexity**: Normalized tables require SQL `JOIN` statements to reconstruct nested objects, necessitating eager loading to prevent N+1 query bottlenecks.

---

## Consequences
* We write database queries using explicit eager loading (`selectinload` or `joinedload`) to prevent async lazy loading failures.
* We utilize Alembic to audit schema evolutions.

---

## Industry Practices
Enterprise AI platforms (like LangSmith or Coherence engines) utilize UUID schemas and normalized relational mappings to handle multi-tenant isolation, data versioning, and compliance audit logging.
