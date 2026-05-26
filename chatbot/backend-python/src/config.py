"""
Configuration — loads environment variables and provides typed config models.

To set up:
1. Copy `.env.example` to `.env`
2. Fill in your GROQ_API_KEY (needed for chat)
3. Optionally fill in OPENAI_API_KEY / GEMINI_API_KEY if using those providers
"""

import os
from pathlib import Path
from typing import Literal, Optional
from dataclasses import dataclass, field

from dotenv import load_dotenv

# Load .env from the backend-python directory (one level up from src/)
_dotenv_path = Path(__file__).resolve().parent.parent / ".env"
if _dotenv_path.exists():
    load_dotenv(dotenv_path=str(_dotenv_path))
else:
    load_dotenv()  # fallback to CWD


ProviderType = Literal["openai", "gemini", "groq", "custom"]


@dataclass
class LLMConfig:
    """Configuration for a single LLM provider."""
    provider: ProviderType
    model: str
    api_key: str
    max_tokens: int = 512
    temperature: float = 0.7
    # For custom providers (OpenAI-compatible endpoint)
    base_url: Optional[str] = None


@dataclass
class AppConfig:
    """Top-level application configuration loaded from environment variables."""

    # LLM Provider selection
    llm_provider: ProviderType = field(
        default_factory=lambda: os.getenv("LLM_PROVIDER", "groq")  # type: ignore
    )

    # Groq Cloud
    groq_api_key: str = field(
        default_factory=lambda: os.getenv("GROQ_API_KEY", "")
    )
    groq_model: str = field(
        default_factory=lambda: os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
    )

    # OpenAI
    openai_api_key: str = field(
        default_factory=lambda: os.getenv("OPENAI_API_KEY", "")
    )
    openai_model: str = field(
        default_factory=lambda: os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    )

    # Google Gemini
    gemini_api_key: str = field(
        default_factory=lambda: os.getenv("GEMINI_API_KEY", "")
    )
    gemini_model: str = field(
        default_factory=lambda: os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    )

    # Custom OpenAI-compatible provider
    custom_api_key: str = field(
        default_factory=lambda: os.getenv("CUSTOM_API_KEY", "")
    )
    custom_base_url: str = field(
        default_factory=lambda: os.getenv("CUSTOM_API_BASE_URL", "http://localhost:11434/v1")
    )
    custom_model: str = field(
        default_factory=lambda: os.getenv("CUSTOM_MODEL", "gpt-4o-mini")
    )

    # Embedding model (sentence-transformers)
    embedding_model: str = field(
        default_factory=lambda: os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
    )

    # Generation params
    max_tokens: int = field(
        default_factory=lambda: int(os.getenv("MAX_TOKENS", "512"))
    )
    temperature: float = field(
        default_factory=lambda: float(os.getenv("TEMPERATURE", "0.7"))
    )

    # CORS
    allowed_origins: str = field(
        default_factory=lambda: os.getenv("ALLOWED_ORIGINS", "*")
    )

    # Server
    host: str = field(
        default_factory=lambda: os.getenv("HOST", "0.0.0.0")
    )
    port: int = field(
        default_factory=lambda: int(os.getenv("PORT", "8000"))
    )


def get_llm_config(cfg: AppConfig) -> LLMConfig:
    """Build LLMConfig from the active provider settings in AppConfig."""
    provider = cfg.llm_provider

    if provider == "groq":
        return LLMConfig(
            provider="groq",
            model=cfg.groq_model,
            api_key=cfg.groq_api_key,
            max_tokens=cfg.max_tokens,
            temperature=cfg.temperature,
        )
    elif provider == "openai":
        return LLMConfig(
            provider="openai",
            model=cfg.openai_model,
            api_key=cfg.openai_api_key,
            max_tokens=cfg.max_tokens,
            temperature=cfg.temperature,
        )
    elif provider == "gemini":
        return LLMConfig(
            provider="gemini",
            model=cfg.gemini_model,
            api_key=cfg.gemini_api_key,
            max_tokens=cfg.max_tokens,
            temperature=cfg.temperature,
        )
    elif provider == "custom":
        return LLMConfig(
            provider="custom",
            model=cfg.custom_model,
            api_key=cfg.custom_api_key,
            base_url=cfg.custom_base_url,
            max_tokens=cfg.max_tokens,
            temperature=cfg.temperature,
        )
    else:
        raise ValueError(f"Unknown provider: {provider}")
