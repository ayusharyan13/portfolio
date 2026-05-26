"""
Custom OpenAI-compatible provider.

Supports any API that follows the OpenAI chat completions format, including:
- Ollama (http://localhost:11434/v1)
- vLLM
- LocalAI
- Azure OpenAI
- Together AI
"""

from typing import AsyncGenerator, List

from openai import AsyncOpenAI

from .interface import LLMProvider, ChatMessage
from ..config import LLMConfig


class CustomProvider(LLMProvider):
    def __init__(self, config: LLMConfig):
        self._config = config
        base_url = (config.base_url or "http://localhost:11434/v1").rstrip("/")
        self._client = AsyncOpenAI(
            api_key=config.api_key or "sk-no-key-required",
            base_url=base_url,
        )

    @property
    def name(self) -> str:
        return "Custom (OpenAI-compatible)"

    def is_configured(self) -> bool:
        return bool(self._config.base_url)

    async def chat(
        self,
        messages: List[ChatMessage],
    ) -> AsyncGenerator[str, None]:
        stream = await self._client.chat.completions.create(
            model=self._config.model,
            messages=[{"role": m.role, "content": m.content} for m in messages],
            max_tokens=self._config.max_tokens,
            temperature=self._config.temperature,
            stream=True,
        )

        async for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta
