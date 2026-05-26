"""
Groq Cloud provider — blazing fast inference via custom LPUs.

Groq is fully OpenAI-compatible, so we use the `groq` Python client library.

Recommended models:
- llama-3.1-8b-instant  — Fastest, 8K context, great for RAG chatbots
- llama3-70b-8192        — Smarter but still very fast
- mixtral-8x7b-32768     — 32K context window
- gemma2-9b-it           — Lightweight, fast

Free tier: ~30 req/min, generous token limits. Enough for portfolio traffic.
Get API key: https://console.groq.com/keys
"""

from typing import AsyncGenerator, List

import groq
from groq.types.chat import ChatCompletionChunk

from .interface import LLMProvider, ChatMessage
from ..config import LLMConfig


class GroqProvider(LLMProvider):
    def __init__(self, config: LLMConfig):
        self._config = config
        self._client = groq.AsyncGroq(api_key=config.api_key)

    @property
    def name(self) -> str:
        return "Groq Cloud"

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
            if isinstance(chunk, ChatCompletionChunk):
                delta = chunk.choices[0].delta.content
                if delta:
                    yield delta
