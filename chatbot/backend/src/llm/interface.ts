import { ChatMessage, LLMConfig } from '../config'

/**
 * LLMProvider — Adapter interface for any LLM provider.
 * Each provider implements chat streaming and returns a ReadableStream of text chunks.
 */
export interface LLMProvider {
  /** Provider name for logging/debugging */
  readonly name: string

  /**
   * Send a chat request with streaming response.
   * @param messages - Conversation history (system + user + assistant)
   * @param config - LLM configuration (model, temperature, etc.)
   * @returns A ReadableStream that yields text chunks as they arrive
   */
  chat(
    messages: ChatMessage[],
    config: LLMConfig
  ): Promise<ReadableStream<string>>

  /**
   * Check if the provider configuration is valid (API key present, etc.)
   */
  isConfigured(config: LLMConfig): boolean
}
