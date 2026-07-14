# ADR-0001: Use FastAPI for backend API layer

* **Status**: Accepted
* **Date**: 2026-07-13
* **Author**: Senior AI Engineer & Architect

---

## Context
We are building a production-ready, Enterprise Agentic RAG Platform called NexusAI. The platform needs to support high-concurrency requests, stream responses from Large Language Models (LLMs) in real time (e.g., token-by-token streaming), perform asynchronous actions (e.g., querying vector databases, fetching web pages), and provide a clean API boundary for our Next.js frontend.

## Problem Statement
We need an API framework in Python that meets the following criteria:
1. Native asynchronous (async/await) support to prevent blocking I/O during network calls to external LLMs and databases.
2. Low latency and high execution performance.
3. Rapid development speed with clean validation and auto-documentation.
4. Extensible design that integrates smoothly with AI tools like LangChain and LangGraph.

## Decision
We choose **FastAPI** as our core backend web framework.

## Alternatives Considered

### 1. Django / Django REST Framework (DRF)
* **Why rejected**: Django is a synchronous-first framework. Although it has added basic async support in recent versions, its entire ecosystem (including its famous ORM) is fundamentally built around synchronous execution. For an AI application that relies heavily on waiting for external network calls (LLM APIs), sync-only operations would block threads, severely limiting scalability. It is also overly heavy with features we do not need.

### 2. Flask
* **Why rejected**: Flask is lightweight and simple but lacks native async support out of the box, does not include built-in modern typing support (like Pydantic), and does not autogenerate API docs. Adding these features requires stacking third-party extensions, leading to a fragmented codebase.

---

## Trade-offs (Advantages & Disadvantages)

### Advantages
* **Performance**: Underpinned by Starlette and Uvicorn, FastAPI is one of the fastest Python frameworks available.
* **Async by Default**: Simplifies handling parallel agent tool execution and real-time token streaming.
* **Automatic Docs**: Out-of-the-box interactive documentation (Swagger UI / OpenAPI) speeds up frontend-backend integration.
* **Type Safety & Validation**: Built on Python type hints and Pydantic, ensuring that invalid client requests are rejected at the edge before hitting business logic.

### Disadvantages
* **Smaller Ecosystem than Django**: Django has ready-to-use packages for almost everything (like admin portals). FastAPI requires us to assemble some components ourselves (which aligns with our desire to build a custom enterprise platform).
* **Python Async Learning Curve**: Developers must understand asynchronous event loops and avoid blocking calls.

---

## Consequences
* The backend API will be built as an async-first codebase.
* All external operations (database, search, model requests) will use non-blocking async drivers.
* FastAPI will autogenerate OpenAPI schemas, making frontend integration straightforward.

---

## Industry Practices
FastAPI is the industry standard for serving AI models and agent APIs. Companies like Netflix, Microsoft, and Uber use it to expose machine learning inference endpoints because of its performance and native integration with the Python data/AI ecosystem.
