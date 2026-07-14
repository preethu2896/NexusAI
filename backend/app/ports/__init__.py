"""
app/ports — Abstract interface definitions for all swappable NexusAI components.

Every module that has a realistic future replacement is defined here as a
Python Protocol (PEP 544 structural subtyping). Concrete implementations
live in app/ingestion/ and satisfy the protocol without inheriting from it.

Wiring of which concrete class backs each protocol is done exclusively in
app/dependencies.py — nowhere else.
"""
