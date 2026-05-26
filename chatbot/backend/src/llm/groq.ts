import { LLMProvider } from './interface'
import { ChatMessage, LLMConfig } from '../config'
import { parseOpenAIStream } from './openai'

/**
 * Groq Cloud provider — blazing fast inference via custom LPUs.
 *
 * Groq is fully OpenAI-compatible, so this adapter reuses the OpenAI SSE parser.
 *
 * Recommended models (fastest first):
 * - llama-3.1-8b-instant  — Fastest, 8K context, great for RAG chatbots
 * - llama3-70b-8192        — Smarter but still very fast
 * - mixtral-8x7b-32768     — 32K context window
 * - gemma2-9b-it           — Lightweight, fast
 *
 * Free tier: ~30 req/min, generous token limits. Enough for portfolio traffic.
 * Get API key: https://console.groq.com/keys
 */
export class GroqProvider implements LLMProvider {
  readonly name = 'Groq Cloud'

  isConfigured(config: LLMConfig): boolean {
    return !!config.apiKey
  }

  async chat(
    messages: ChatMessage[],
    config: LLMConfig
  ): Promise<ReadableStream<string>> {
    if (!this.isConfigured(config)) {
      throw new Error(
        'Groq API key is not configured. Set GROQ_API_KEY via `npx wrangler secret put GROQ_API_KEY`'
      )
    }

    const body = {
      model: config.model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      stream: true,
    }

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify(body),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Groq API error (${response.status}): ${error}`)
    }

    if (!response.body) {
      throw new Error('Groq response body is null')
    }

    // Groq uses the exact same SSE format as OpenAI
    return parseOpenAIStream(response.body as ReadableStream<Uint8Array>)
  }
}
