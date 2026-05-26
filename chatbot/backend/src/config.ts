/** Type for Cloudflare Workers AI binding */
export interface AiBinding {
  run: (model: string, inputs: Record<string, unknown>) => Promise<{
    shape: number[]
    data: number[][]
  }>
}

export interface Env {
  // Cloudflare Workers AI binding (used for embeddings — no API key needed)
  AI: AiBinding

  // LLM Provider selection
  LLM_PROVIDER: 'openai' | 'gemini' | 'groq' | 'custom'

  // OpenAI
  OPENAI_API_KEY?: string
  OPENAI_MODEL?: string

  // Google Gemini
  GEMINI_API_KEY?: string
  GEMINI_MODEL?: string

  // Groq Cloud (fast, free tier, OpenAI-compatible)
  GROQ_API_KEY?: string
  GROQ_MODEL?: string

  // Custom OpenAI-compatible provider (e.g., Ollama, vLLM, local)
  CUSTOM_API_KEY?: string
  CUSTOM_API_BASE_URL?: string
  CUSTOM_MODEL?: string

  // Generation params
  MAX_TOKENS?: string
  TEMPERATURE?: string

  // CORS
  ALLOWED_ORIGINS?: string
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface LLMConfig {
  provider: 'openai' | 'gemini' | 'groq' | 'custom'
  model: string
  apiKey: string
  maxTokens: number
  temperature: number
  // For custom providers
  baseUrl?: string
}

export function getLLMConfig(env: Env): LLMConfig {
  const provider = env.LLM_PROVIDER || 'openai'

  switch (provider) {
    case 'openai':
      return {
        provider: 'openai',
        model: env.OPENAI_MODEL || 'gpt-4o-mini',
        apiKey: env.OPENAI_API_KEY || '',
        maxTokens: parseInt(env.MAX_TOKENS || '512'),
        temperature: parseFloat(env.TEMPERATURE || '0.7'),
      }
    case 'gemini':
      return {
        provider: 'gemini',
        model: env.GEMINI_MODEL || 'gemini-1.5-flash',
        apiKey: env.GEMINI_API_KEY || '',
        maxTokens: parseInt(env.MAX_TOKENS || '512'),
        temperature: parseFloat(env.TEMPERATURE || '0.7'),
      }
    case 'groq':
      return {
        provider: 'groq',
        model: env.GROQ_MODEL || 'llama-3.1-8b-instant',
        apiKey: env.GROQ_API_KEY || '',
        maxTokens: parseInt(env.MAX_TOKENS || '512'),
        temperature: parseFloat(env.TEMPERATURE || '0.7'),
      }
    case 'custom':
      return {
        provider: 'custom',
        model: env.CUSTOM_MODEL || 'gpt-4o-mini',
        apiKey: env.CUSTOM_API_KEY || '',
        baseUrl: env.CUSTOM_API_BASE_URL || 'http://localhost:11434/v1',
        maxTokens: parseInt(env.MAX_TOKENS || '512'),
        temperature: parseFloat(env.TEMPERATURE || '0.7'),
      }
  }
}
