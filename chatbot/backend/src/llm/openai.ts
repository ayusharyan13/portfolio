import { LLMProvider } from './interface'
import { ChatMessage, LLMConfig } from '../config'

/**
 * OpenAI provider — supports GPT-4o, GPT-4o-mini, and any OpenAI-compatible models.
 */
export class OpenAIProvider implements LLMProvider {
  readonly name = 'OpenAI'

  isConfigured(config: LLMConfig): boolean {
    return !!config.apiKey
  }

  async chat(
    messages: ChatMessage[],
    config: LLMConfig
  ): Promise<ReadableStream<string>> {
    if (!this.isConfigured(config)) {
      throw new Error('OpenAI API key is not configured. Set OPENAI_API_KEY via `npx wrangler secret put OPENAI_API_KEY`')
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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenAI API error (${response.status}): ${error}`)
    }

    if (!response.body) {
      throw new Error('OpenAI response body is null')
    }

    // Parse the SSE stream from OpenAI and yield text content chunks
    return parseOpenAIStream(response.body as ReadableStream<Uint8Array>)
  }
}

/**
 * Parse OpenAI's SSE (Server-Sent Events) stream.
 * OpenAI sends: data: {"choices":[{"delta":{"content":"text"}}]}\n\n
 */
export async function parseOpenAIStream(
  stream: ReadableStream<Uint8Array>
): Promise<ReadableStream<string>> {
  const decoder = new TextDecoder()
  const reader = stream.getReader()

  return new ReadableStream<string>({
    async start(controller) {
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // Keep incomplete line in buffer

          for (const line of lines) {
            const trimmed = line.trim()

            // End of stream signal
            if (trimmed === 'data: [DONE]') {
              controller.close()
              return
            }

            // Data lines
            if (trimmed.startsWith('data: ')) {
              try {
                const json = JSON.parse(trimmed.slice(6))
                const content = json.choices?.[0]?.delta?.content || ''
                if (content) {
                  controller.enqueue(content)
                }
              } catch {
                // Skip malformed JSON lines
              }
            }
          }
        }
      } catch (err) {
        controller.error(err)
      } finally {
        controller.close()
        reader.releaseLock()
      }
    },
  })
}
