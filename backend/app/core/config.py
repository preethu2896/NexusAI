import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    """
    Application settings class based on Pydantic BaseSettings.
    Automatically reads environment variables and validates them.
    """
    # Environment name: development, staging, production
    ENV: str = Field(default="development")
    
    # Database connection URL
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:postgres_password@localhost:5432/nexusai"
    )

    # Directory where uploaded documents are stored on disk
    # In v0.4.0 this will be replaced by an S3-compatible object storage path
    UPLOAD_DIR: str = Field(default="uploads")

    # Maximum allowed file size for document uploads, in megabytes
    MAX_FILE_SIZE_MB: int = Field(default=20)

    # Chunker settings — character-based sizes (≈ 512 tokens / 50 token overlap)
    CHUNK_SIZE: int = Field(default=2000)
    CHUNK_OVERLAP: int = Field(default=200)

    # ChromaDB — vector store for semantic search (Sprint B)
    # In v0.4.0, this is compared against pgvector as an alternative implementation
    CHROMA_PERSIST_DIR: str = Field(default="chroma_db")
    CHROMA_COLLECTION_NAME: str = Field(default="nexusai_chunks")

    # Embedding model settings (Sprint B)
    # Model is read from config so swapping Local→OpenAI requires only an env change
    EMBEDDING_MODEL_NAME: str = Field(default="all-MiniLM-L6-v2")
    EMBEDDING_BATCH_SIZE: int = Field(default=32)

    # OpenAI and LLM Generation Settings (Sprint C)
    OPENAI_API_KEY: str = Field(default="")
    LLM_MODEL_NAME: str = Field(default="gpt-4o-mini")
    LLM_TEMPERATURE: float = Field(default=0.0)
    LLM_MAX_TOKENS: int = Field(default=1024)

    # Configuration metadata for Pydantic Settings
    # This instructs Pydantic to read from a .env file located in the parent directory
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore" # Ignore extra env variables not declared here
    )

# Instantiate the settings class to be imported throughout the application.
# It reads and validates variables once during this import.
settings = Settings()
