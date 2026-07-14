# ADR-0002: Use PostgreSQL for relational application datastore

* **Status**: Accepted
* **Date**: 2026-07-13
* **Author**: Senior AI Engineer & Architect

---

## Context
We are building NexusAI, an Enterprise Agentic RAG Platform. The system needs to manage structured application state, including user authentication data, organization metadata, document records (file size, upload status, storage paths), conversation histories (sessions, user questions, agent replies), and security logs.

## Problem Statement
We need a robust, relational database management system (RDBMS) that supports:
1. High reliability and ACID compliance (Atomicity, Consistency, Isolation, Durability) to ensure user accounts and files are never in a corrupted state.
2. Advanced indexing capabilities for fast search and relations.
3. Native JSON support (JSONB) to store unstructured or semi-structured data (like agent metadata, tool outputs, or intermediate step logs) without forcing a strict relational schema on dynamic data fields.
4. Scale-readiness for cloud deployments.

## Decision
We choose **PostgreSQL** as our primary relational database.

## Alternatives Considered

### 1. MySQL
* **Why rejected**: MySQL is a great relational database, but its JSON support and performance (especially JSONB querying, indexing, and indexing expressions) are inferior to PostgreSQL's native `jsonb` type and GIN indexes. PostgreSQL also has superior support for advanced SQL features, window functions, CTEs (Common Table Expressions), and custom data types, which are heavily used in enterprise analytical query patterns.

### 2. MongoDB
* **Why rejected**: MongoDB is a document store. While excellent for semi-structured data, it does not enforce relational integrity (foreign keys) or joins natively at the database level. For our application core (users, documents, auth, billing), relational constraints are vital. We want to avoid writing complex validation code in the application layer to enforce relational consistency.

---

## Trade-offs (Advantages & Disadvantages)

### Advantages
* **ACID Integrity**: Ensures transactional safety for mission-critical operations like user registration or document processing pipelines.
* **JSONB Capabilities**: Allows hybrid schemas. We can store strict relational tables (like `users`) while also storing dynamic JSON documents (like agent logs or intermediate chat traces) with fast indexing.
* **Extensibility**: PostgreSQL has a rich extension ecosystem, including `pgvector` (which we can leverage if we want to run vector searches inside PostgreSQL rather than a separate database).
* **Connection Pooling**: Supported by standard tools like PgBouncer for scaling connections to thousands.

### Disadvantages
* **Write Overhead**: Relational databases write to Write-Ahead Logs (WAL) and update indices, making them slower for high-throughput write streams than pure NoSQL key-value caches.
* **Schema Rigidity**: Altering massive tables in production requires careful planning (migrations) to avoid database locks.

---

## Consequences
* We will establish an async connection pool to PostgreSQL using SQLAlchemy and `asyncpg`.
* Database schema modifications will be managed using Alembic migration scripts.
* We can support hybrid schemas using the JSONB column type for storing dynamic agent histories.

---

## Industry Practices
PostgreSQL is widely considered the gold standard open-source database for enterprise startups and mature tech companies. Its reliability, extensive features, and compatibility with modern ORMs make it the default choice for relational database needs.
