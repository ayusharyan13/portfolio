"""
Google Gemini provider — supports Gemini 1.5 Flash, Gemini 1.5 Pro, Gemini 2.0.

Uses the Gemini API directly via HTTP (no Python SDK dependency).
"""

import json
from typing import AsyncGenerator, List, Optional, Tuple

from .interface import LLMProvider, ChatMessage
from ..config import LLMConfig


class GeminiProvider(LLMProvider):
    def __init__(self, config: LLMConfig):
        self._config = config

    @property
    def name(self) -> str:
        return "Gemini"

    def is_configured(self) -> bool:
        return bool(self._config.api_key)

    async def chat(
        self,
        messages: List[ChatMessage],
    ) -> AsyncGenerator[str, None]:
        system_instruction, contents = self._convert_messages(messages)

        body: dict = {
            "contents": contents,
            "generationConfig": {
                "maxOutputTokens": self._config.max_tokens,
                "temperature": self._config.temperature,
            },
        }

        if system_instruction:
            body["systemInstruction"] = {"parts": [{"text": system_instruction}]}

        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{self._config.model}:streamGenerateContent"
            f"?alt=sse&key={self._config.api_key}"
        )

        import httpx

        async with httpx.AsyncClient() as client:
            async with client.stream(
                "POST", url, json=body, headers={"Content-Type": "application/json"}
            ) as response:
                response.raise_for_status()
                buffer = ""
                async for raw_line in response.aiter_lines():
                    buffer += raw_line
                    lines = buffer.split("\n")
                    buffer = lines.pop() if lines else ""

                    for line in lines:
                        line = line.strip()
                        if not line or line == "[DONE]":
                            continue
                        if line.startswith("data: "):
                            try:
                                data = json.loads(line[6:])
                                text = (
                                    data.get("candidates", [{}])[0]
                                    .get("content", {})
                                    .get("parts", [{}])[0]
                                    .get("text", "")
                                )
                                if text:
                                    yield text
                            except json.JSONDecodeError:
                                continue

    def _convert_messages(
        self, messages: List[ChatMessage]
    ) -> Tuple[Optional[str], List[dict]]:
        system_parts: list[str] = []
        contents: list[dict] = []

        for msg in messages:
            if msg.role == "system":
                system_parts.append(msg.content)
            elif msg.role == "user":
                contents.append({"role": "user", "parts": [{"text": msg.content}]})
            elif msg.role == "assistant":
                contents.append({"role": "model", "parts": [{"text": msg.content}]})

        system_instruction = "\n".join(system_parts).strip() or None
        return system_instruction, contents
