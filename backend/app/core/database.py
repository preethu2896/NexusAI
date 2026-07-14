from datetime import datetime, timezone
from sqlalchemy import DateTime
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from typing import AsyncGenerator
from backend.app.core.config import settings

# Create the asynchronous engine
# pool_size: number of open connections to maintain in the pool
# max_overflow: number of temporary connections allowed beyond pool_size
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,  # Set to True to log raw SQL queries (useful for debugging)
    pool_size=10,
    max_overflow=20
)

# Create an async session maker. 
# expire_on_commit=False prevents SQLAlchemy from querying the DB for expired object attributes
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

class TimestampMixin:
    """
    Mixin class that automatically adds created_at, updated_at, and deleted_at columns
    to models. Supports soft-delete strategies.
    """
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        default=None,
        nullable=True
    )

# Declarative base class for models
class Base(DeclarativeBase):
    pass

# Dependency generator to inject database sessions into FastAPI routes.
# It yields a session and ensures it is closed after the request is finished.
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
