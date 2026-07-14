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
- **Vector Index**: ChromaDB (Local Store)
- **ORM / Driver**: SQLAlchemy 2.0, asyncpg
- **Frontend Stack**: Next.js 15, React 19, Tailwind CSS, Recharts, Zustand
- **Package Manager**: uv (Backend), npm (Frontend)
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
├── backend/                    # FastAPI core app & database migrations
│   ├── app/
│   │   ├── api/                # Presentation Layer (routers and HTTP paths)
│   │   ├── models/             # Data Layer (SQLAlchemy Declarative Base models)
│   │   └── services/           # Business Layer (RAG search & chat loops)
│   ├── pyproject.toml          # Workspace Python configurations and uv locks
│   └── .env                    # Environment credentials
├── frontend/                   # Next.js 15 Enterprise UI Client
│   ├── app/                    # App Router pages (Dashboard, Chat, Knowledge, Agents)
│   ├── components/             # Reusable UI controls and global layouts
│   ├── store/                  # Zustand global state manager
│   ├── services/               # API service adapter layer
│   └── package.json            # Node project configuration
├── docs/                       # High-value system documentation
└── infrastructure/             # Docker compose deployment configurations
```

---

## Installation & Setup

### 1. Prerequisites
- [uv](https://github.com/astral-sh/uv) (recommended Python package runner)
- Node.js 20+ and npm
- Docker and Docker Compose

### 2. Setup Infrastructure & Backend
Spin up the local PostgreSQL container:
```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d
```

Navigate to the backend directory and install packages using `uv`:
```bash
cd backend
uv sync
```

Create a `.env` file inside the `backend` folder:
```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres_password@localhost:5432/nexusai
OPENAI_API_KEY=your_key_here
```

Run the FastAPI development server:
```bash
uv run uvicorn backend.app.main:app --reload --port 8000
```
Visit `http://localhost:8000/docs` to test our Swagger UI endpoints.

### 3. Setup Frontend Client
Navigate to the frontend directory, install npm packages, and run the Next.js development server:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` to interact with the NexusAI Enterprise Platform!

---

## Roadmap

- [x] **Milestone 1: Foundation (v0.1.0)** - Async FastAPI core, SQLAlchemy modeling, PostgreSQL container setup, and database migrations framework.
- [x] **Milestone 2: Basic RAG & persistence (v0.2.0)** - Document chunking pipelines, Chroma vector store search, grounded LLM answers, stateful conversation persistence, SSE token streaming, and pixel-perfect enterprise frontend dashboard.
- [ ] **Milestone 3: Agentic RAG (v0.3.0)** - Multi-agent routing logic using LangGraph, tool execution systems, memory preservation across active sessions, and streaming.
- [ ] **Milestone 4: Production Release (v1.0.0)** - Redis cache locks, User JWT Authentication, logging monitors, secure deployment configurations, and automated staging test suites.
