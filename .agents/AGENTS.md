# Workspace Rules for NexusAI Coding Assistant

## 1. Documentation Maintenance and Simplification

Maintain a clean, high-quality, and simplified documentation structure. Do not expand the documentation system or create separate books/session notes. Only maintain the following:
1. [HANDBOOK.md](file:///c:/Users/preet/OneDrive/Desktop/NexusAI/docs/HANDBOOK.md): The primary learning textbook organized by concepts.
2. [README.md](file:///c:/Users/preet/OneDrive/Desktop/NexusAI/README.md): Professional project overview and setup guide.
3. [GLOSSARY.md](file:///c:/Users/preet/OneDrive/Desktop/NexusAI/docs/GLOSSARY.md): Definition index of technical terms. Append new terms here only when introducing new terminology.
4. [architecture-decisions](file:///c:/Users/preet/OneDrive/Desktop/NexusAI/docs/architecture-decisions/): ADR directory. Only create or update ADRs for significant architectural changes.

### Documentation Quality Rules
- **Do Not Only Append**: When new concepts are introduced, refactor the relevant chapters in `docs/HANDBOOK.md`, merge duplicates, update examples, improve diagrams, and cross-reference related chapters. The handbook must read like a textbook, prioritizing quality over quantity.
- **Maintain Current State**: Continuously update older chapters and diagrams in `docs/HANDBOOK.md` as the project architecture evolves (e.g., adding LangGraph, hybrid retrieval, authentication, Redis, or streaming). The documentation must always reflect the *current* architecture.

---

## 2. Session Git Workflow

At the end of every active coding session, complete the following workflow:
1. **Verify Build**: Ensure that all code compilation and servers build successfully without errors.
2. **Verify Documentation**: Ensure that any architectural or conceptual changes are fully reflected in `docs/HANDBOOK.md`, `README.md`, `docs/GLOSSARY.md`, and ADRs in accordance with the quality rules.
3. **Session Summary**: Generate a concise summary of the session's achievements.
4. **Suggest Commit Message**: Recommend a clean, professional Git commit message.
5. **Commit**: Commit the session changes locally.
6. **Push after Approval**: Propose a push command to GitHub, executing it *only after receiving explicit user approval*.

### Milestone Versioning
For major milestones, suggest semantic version tags:
- `v0.1.0 Foundation` (FastAPI core, PostgreSQL Docker setup, base models)
- `v0.2.0 Basic RAG` (Document chunking, hybrid search, vector db setup)
- `v0.3.0 Agentic RAG` (LangGraph agent, memory preservation, tool use)
- `v1.0.0 Production Release` (Authentication, Redis, logs, production configs)

---

## 3. Sprint Completion Protocol

At the end of every sprint, before moving to the next sprint, always complete the following:

1. **Sprint Summary**: State clearly what was built in this sprint.
2. **Feature Mapping**: Show the mapping block:
   ```
   Module       : [Product module name]
   Milestone    : [e.g. v0.2.0 MVP — Sprint A]
   Endpoint(s)  : [Implemented API routes]
   DB Changes   : [Tables created or modified]
   Handbook Ch. : [Relevant handbook chapter]
   ```
3. **Manual Testing Guide**: Provide step-by-step curl commands or Swagger UI instructions the user can run immediately to verify the sprint works end-to-end.
4. **Architecture Context**: Briefly explain where this sprint's output sits inside the complete NexusAI architecture and how it connects to the next sprint.
5. **Await Approval**: Do not begin the next sprint until the user explicitly approves.
