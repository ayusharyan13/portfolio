"""
OpenAI provider — supports GPT-4o, GPT-4o-mini, and any OpenAI models.
"""

from typing import AsyncGenerator, List

from openai import AsyncOpenAI

from .interface import LLMProvider, ChatMessage
from ..config import LLMConfig


class OpenAIProvider(LLMProvider):
    def __init__(self, config: LLMConfig):
        self._config = config
        self._client = AsyncOpenAI(api_key=config.api_key)

    @property
    def name(self) -> str:
        return "OpenAI"

    def is_configured(self) -> bool:
        return bool(self._config.api_key)

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
