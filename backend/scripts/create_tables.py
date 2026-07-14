"""
One-time script to create all SQLAlchemy tables in the database.

This is used for MVP development only. In v0.4.0 (Platform Hardening),
Alembic migrations will replace this script for production deployments.

Usage (from NexusAI/ root):
    uv run python backend/scripts/create_tables.py
"""
import asyncio
import sys
import os

# Ensure the project root is on the path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.core.database import engine, Base

# Import all models so they register with Base.metadata
import backend.app.models.base  # noqa: F401


async def create_tables() -> None:
    print("Creating database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("[OK] All tables created successfully.")
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(create_tables())
