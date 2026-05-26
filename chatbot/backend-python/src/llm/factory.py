"""
LLMProviderFactory — Creates the appropriate LLM provider based on configuration.

Factory Pattern: Each provider is an adapter that implements the LLMProvider ABC.
To add a new provider, create a new class implementing LLMProvider and register it here.
"""

from typing import Dict, Callable, Type

from .interface import LLMProvider
from .groq import GroqProvider
from .openai import OpenAIProvider
from .gemini import GeminiProvider
from .custom import CustomProvider
from ..config import LLMConfig


class LLMProviderFactory:
    """Factory that creates LLM providers based on config."""

    _providers: Dict[str, Callable[[LLMConfig], LLMProvider]] = {
        "groq": lambda cfg: GroqProvider(cfg),
        "openai": lambda cfg: OpenAIProvider(cfg),
        "gemini": lambda cfg: GeminiProvider(cfg),
        "custom": lambda cfg: CustomProvider(cfg),
    }

    _hints: Dict[str, str] = {
        "groq": "Set GROQ_API_KEY in your .env file",
        "openai": "Set OPENAI_API_KEY in your .env file",
        "gemini": "Set GEMINI_API_KEY in your .env file",
        "custom": "Set CUSTOM_API_BASE_URL in your .env file",
    }

    @classmethod
    def register(cls, name: str, factory: Callable[[LLMConfig], LLMProvider]) -> None:
        """Register a custom provider at runtime."""
        cls._providers[name] = factory

    @classmethod
    def get_provider(cls, config: LLMConfig) -> LLMProvider:
        """Get the appropriate provider for the given config."""
        factory = cls._providers.get(config.provider)
        if factory is None:
            available = ", ".join(cls._providers.keys())
            raise ValueError(
                f"Unknown LLM provider: '{config.provider}'. "
                f"Available: {available}. "
                f"Set LLM_PROVIDER in .env to one of: {available}"
            )

        provider = factory(config)

        if not provider.is_configured():
            hint = cls._hints.get(config.provider, "Check your configuration.")
            raise ValueError(
                f"Provider '{config.provider}' is not configured. {hint}"
            )

        return provider

    @classmethod
    def list_providers(cls) -> list[str]:
        """List all available provider names."""
        return list(cls._providers.keys())
