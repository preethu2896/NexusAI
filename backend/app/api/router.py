from fastapi import APIRouter
from backend.app.api.v1 import health, documents, chats

api_router = APIRouter()

# System routes
api_router.include_router(health.router, tags=["system"])

# Ingestion Pipeline routes (Sprint A)
api_router.include_router(documents.router, tags=["documents"])

# Generation Engine routes (Sprint C)
api_router.include_router(chats.router, tags=["chats"])
