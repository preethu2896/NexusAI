# NexusAI: Enterprise Agentic RAG Platform

NexusAI is a production-grade, asynchronous Enterprise Agentic Retrieval-Augmented Generation (RAG) platform. It provides modular services for secure client-server communication, schema validations, robust database modeling, hierarchical relationship mappings, and background task execution, designed to run multi-agent workflows at scale.

---

## Features

- **Asynchronous Native API**: Built on FastAPI and Uvicorn ASGI event loop for high concurrency and low latency.
- **Relational Memory Storage**: Uses PostgreSQL for persistent user metadata, chat history, and document indexing.
- **Secure Architecture**: Implements CORS origin protections, strict secrets isolation, and parameterized SQLAlchemy transactions to prevent SQL Injection.
- **Robust Schema Mapping**: Utilizing SQLAlchemy 2.0 ORM with asyncpg driver, enforcing cascade deletion rules, audit-trail mixins, and UUID identifiers.
- **Environment and Package Optimization**: Utilizes `uv` for ultra-fast installation caches and fully isolated `.venv` contexts.
- **Scalable Infrastructure**: Containerized with Docker and docker-compose for consistent deployments.

---

## Tech Stack

- **Core Framework**: Python 3.12+, FastAPI
- **Web Server**: Uvicorn (ASGI)
- **Database Engine**: PostgreSQL 16 (Alpine)
- **ORM / Driver**: SQLAlchemy 2.0, asyncpg
- **Package Manager**: uv
- **Infrastructure**: Docker, Docker Compose

---

## Architecture

NexusAI uses a stateless, layered web and data model architecture to ensure clean separation of concerns and linear scaling:

```
               [ Client Browser ]
                       │
                       ▼
       ┌───────────────────────────────┐
       │   Nginx / ALB Load Balancer   │ (TLS Termination)
       └───────────────┬───────────────┘
                       │
                       ▼
       ┌───────────────────────────────┐
       │ Uvicorn ASGI Server Instance  │
       └───────────────┬───────────────┘
                       │
                       ▼
       ┌───────────────────────────────┐
       │     FastAPI Router App        │ (CORS Middleware & Pydantic)
       └───────────────┬───────────────┘
                       │
            ┌──────────┴──────────┐
            ▼                     ▼
      [ SQLAlchemy ]       [ Async Session ]
            │                     │
            ▼                     ▼
      [ asyncpg Driver ] ◄────────┘
            │
            ▼
      [ PostgreSQL DB ] (Relational Tables)
```

---

## Folder Structure

```
NexusAI/
├── .agents/                    # Custom agent styling rules and configurations
│   └── AGENTS.md               # Active workspace rules for coding assistants
├── backend/
│   ├── app/
│   │   ├── api/                # Presentation Layer (routers and HTTP paths)
│   │   │   ├── v1/
│   │   │   │   └── health.py   # System status and db integrity checks
│   │   │   └── router.py       # Master API router registration
│   │   ├── core/               # Configuration, security, and DB connector pool
│   │   │   ├── config.py       # Pydantic settings loading env variables
│   │   │   └── database.py     # SQLAlchemy async engine session generators
│   │   ├── models/             # Data Layer (SQLAlchemy Declarative Base models)
│   │   │   ├── base.py         # Unified metadata registry import
│   │   │   ├── conversation.py # Conversation relational schemas
│   │   │   ├── document.py     # Document metadata indexing models
│   │   │   └── user.py         # Secure User properties and cascades
│   │   └── main.py             # Server initialization and middleware registry
│   ├── pyproject.toml          # Workspace Python configurations and uv locks
│   └── .env                    # Environment credentials (gitignored in production)
├── docs/                       # High-value system documentation
│   ├── HANDBOOK.md             # AI Engineering concept handbook
│   ├── GLOSSARY.md             # Glossary of technical terms
│   └── architecture-decisions/ # Architectural Decision Records (ADRs)
└── infrastructure/
    └── docker/
        └── docker-compose.yml  # Docker Compose file for PostgreSQL infrastructure
```

---

## Installation & Setup

### 1. Prerequisites
- [uv](https://github.com/astral-sh/uv) (recommended Python package runner)
- Docker and Docker Compose

### 2. Setup Infrastructure
Spin up the local PostgreSQL container:
```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d
```

### 3. Install Dependencies
Navigate to the backend directory and install packages using `uv`:
```bash
cd backend
uv sync
```

### 4. Configure Environment Variables
Create a `.env` file inside the `backend` folder:
```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres_password@localhost:5432/nexusai
```

### 5. Running the Application Locally
Run the FastAPI development server:
```bash
uv run uvicorn backend.app.main:app --reload --port 8000
```
Visit `http://localhost:8000/docs` to interactive test our Swagger UI endpoints.

---

## Roadmap

- [x] **Milestone 1: Foundation (v0.1.0)** - Async FastAPI core, SQLAlchemy modeling, PostgreSQL container setup, and database migrations framework.
- [ ] **Milestone 2: Basic RAG (v0.2.0)** - Document chunking pipelines, hybrid retrieval models (sparse + dense), vector database integration, and basic semantic search.
- [ ] **Milestone 3: Agentic RAG (v0.3.0)** - Multi-agent routing logic using LangGraph, tool execution systems, memory preservation across active sessions, and streaming.
- [ ] **Milestone 4: Production Release (v1.0.0)** - Redis cache locks, User JWT Authentication, logging monitors, secure deployment configurations, and automated staging test suites.

---

## Screenshots

*(Screenshots will be added as UI development progresses)*
