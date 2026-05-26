"""
LLM Provider interface (abstract base class).

Each provider implements chat streaming and returns an async generator
that yields text chunks as they arrive from the API.
"""

from abc import ABC, abstractmethod
from typing import AsyncGenerator, List
from dataclasses import dataclass


@dataclass
class ChatMessage:
    """A single message in the conversation."""
    role: str  # "user", "assistant", "system"
    content: str


class LLMProvider(ABC):
    """Abstract base class for all LLM providers."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Provider name for logging and display."""
        ...

    @abstractmethod
    def is_configured(self) -> bool:
        """Check if the provider has valid configuration (API key, etc.)."""
        ...

    @abstractmethod
    async def chat(
        self,
        messages: List[ChatMessage],
    ) -> AsyncGenerator[str, None]:
        """
        Send a chat request with streaming response.

        Args:
            messages: Conversation history (system + user + assistant).

        Yields:
            Text chunks as they arrive from the API.
        """
        ...
