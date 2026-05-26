import { LLMProvider } from './interface'
import { LLMConfig, ChatMessage } from '../config'
import { parseOpenAIStream } from './openai'

/**
 * Custom OpenAI-compatible provider.
 *
 * Supports any API that follows the OpenAI chat completions format, including:
 * - Ollama (http://localhost:11434/v1)
 * - vLLM
 * - LocalAI
 * - Azure OpenAI
 * - Together AI
 * - Any OpenAI-compatible endpoint
 *
 * Implements LLMProvider directly and reuses the standalone parseOpenAIStream function.
 */
export class CustomProvider implements LLMProvider {
  readonly name = 'Custom (OpenAI-compatible)'

  isConfigured(config: LLMConfig): boolean {
    return !!config.baseUrl
  }

  async chat(
    messages: ChatMessage[],
    config: LLMConfig
  ): Promise<ReadableStream<string>> {
    if (!this.isConfigured(config)) {
      throw new Error(
        'Custom provider base URL is not configured. Set CUSTOM_API_BASE_URL in wrangler.toml or env vars.'
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

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Add API key if provided (optional for local models like Ollama)
    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`
    }

    const baseUrl = config.baseUrl!
    const response = await fetch(
      `${baseUrl.replace(/\/$/, '')}/chat/completions`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Custom provider API error (${response.status}): ${error}`)
    }

    if (!response.body) {
      throw new Error('Custom provider response body is null')
    }

    // Reuse the standalone OpenAI SSE parser — the format is identical
    return parseOpenAIStream(response.body as ReadableStream<Uint8Array>)
  }
}
