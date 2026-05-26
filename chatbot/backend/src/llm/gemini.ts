import { LLMProvider } from './interface'
import { ChatMessage, LLMConfig } from '../config'

/**
 * Google Gemini provider — supports Gemini 1.5 Flash, Gemini 1.5 Pro, Gemini 2.0.
 * Uses the Gemini API's streaming endpoint.
 */
export class GeminiProvider implements LLMProvider {
  readonly name = 'Gemini'

  isConfigured(config: LLMConfig): boolean {
    return !!config.apiKey
  }

  async chat(
    messages: ChatMessage[],
    config: LLMConfig
  ): Promise<ReadableStream<string>> {
    if (!this.isConfigured(config)) {
      throw new Error('Gemini API key is not configured. Set GEMINI_API_KEY via `npx wrangler secret put GEMINI_API_KEY`')
    }

    // Convert our message format to Gemini's format
    const { systemInstruction, contents } = this.convertMessages(messages)

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        maxOutputTokens: config.maxTokens,
        temperature: config.temperature,
      },
    }

    // Add system instruction if present
    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }],
      }
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:streamGenerateContent?alt=sse&key=${config.apiKey}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Gemini API error (${response.status}): ${error}`)
    }

    if (!response.body) {
      throw new Error('Gemini response body is null')
    }

    return parseGeminiStream(response.body as ReadableStream<Uint8Array>)
  }

  private convertMessages(messages: ChatMessage[]): {
    systemInstruction?: string
    contents: Array<{ role: string; parts: Array<{ text: string }> }>
  } {
    let systemInstruction: string | undefined
    const contents: Array<{
      role: string
      parts: Array<{ text: string }>
    }> = []

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemInstruction = (systemInstruction || '') + msg.content + '\n'
      } else if (msg.role === 'user') {
        contents.push({ role: 'user', parts: [{ text: msg.content }] })
      } else if (msg.role === 'assistant') {
        contents.push({ role: 'model', parts: [{ text: msg.content }] })
      }
    }

    return { systemInstruction: systemInstruction?.trim(), contents }
  }
}

/**
 * Parse Gemini's SSE stream.
 * Gemini sends: data: {"candidates":[{"content":{"parts":[{"text":"content"}]}}]}
 */
async function parseGeminiStream(
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
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed || trimmed === '[DONE]') continue

            if (trimmed.startsWith('data: ')) {
              try {
                const json = JSON.parse(trimmed.slice(6))
                const text =
                  json.candidates?.[0]?.content?.parts?.[0]?.text || ''
                if (text) {
                  controller.enqueue(text)
                }
              } catch {
                // Skip malformed JSON
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
