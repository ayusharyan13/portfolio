import { LLMProvider } from './interface'
import { OpenAIProvider } from './openai'
import { GeminiProvider } from './gemini'
import { GroqProvider } from './groq'
import { CustomProvider } from './custom'
import { LLMConfig } from '../config'

/**
 * LLMProviderFactory — Creates the appropriate LLM provider based on configuration.
 *
 * Factory Pattern: Each provider is an adapter that implements the LLMProvider interface.
 * To add a new provider, create a new class implementing LLMProvider and add it here.
 */
export class LLMProviderFactory {
  private static providers: Record<string, () => LLMProvider> = {
    openai: () => new OpenAIProvider(),
    gemini: () => new GeminiProvider(),
    groq: () => new GroqProvider(),
    custom: () => new CustomProvider(),
  }

  /**
   * Register a custom provider at runtime.
   * Useful for adding providers dynamically without modifying the factory.
   */
  static register(name: string, factory: () => LLMProvider): void {
    LLMProviderFactory.providers[name] = factory
  }

  /**
   * Get the appropriate provider for the given config.
   * Throws if the provider type is unknown or not configured.
   */
  static getProvider(config: LLMConfig): LLMProvider {
    const factory = LLMProviderFactory.providers[config.provider]
    if (!factory) {
      const available = Object.keys(LLMProviderFactory.providers).join(', ')
      throw new Error(
        `Unknown LLM provider: "${config.provider}". Available: ${available}. ` +
          `Set LLM_PROVIDER in wrangler.toml to one of: ${available}`
      )
    }

    const provider = factory()

    if (!provider.isConfigured(config)) {
      const hints: Record<string, string> = {
        openai: 'Set OPENAI_API_KEY via `npx wrangler secret put OPENAI_API_KEY`',
        gemini: 'Set GEMINI_API_KEY via `npx wrangler secret put GEMINI_API_KEY`',
        groq: 'Set GROQ_API_KEY via `npx wrangler secret put GROQ_API_KEY`',
        custom: 'Set CUSTOM_API_BASE_URL in wrangler.toml',
      }
      throw new Error(
        `Provider "${config.provider}" is not configured. ${hints[config.provider] || 'Check your configuration.'}`
      )
    }

    return provider
  }

  /** List all available provider names */
  static listProviders(): string[] {
    return Object.keys(LLMProviderFactory.providers)
  }
}
