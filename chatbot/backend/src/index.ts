/**
 * Portfolio Chatbot — Cloudflare Worker
 *
 * API Endpoints:
 * - GET  /api/health          → Health check
 * - POST /api/chat            → Chat with RAG (streaming response)
 * - GET  /api/providers       → List available LLM providers
 * - GET  /api/config          → Get current configuration (without secrets)
 */

import { Router } from 'itty-router'
import { getLLMConfig, Env, ChatMessage } from './config'
import { LLMProviderFactory } from './llm/factory'
import { runRAG } from './rag/pipeline'
import { buildKnowledgeBase } from './rag/knowledge'

// Initialize knowledge base at cold start
// Embeddings are lazily initialized on first request
const rawChunks = buildKnowledgeBase()
let embeddedChunks: Array<typeof rawChunks[0] & { embedding: number[] }> | null = null

const router = Router()

/**
 * Lazily initialize embeddings for all knowledge chunks.
 * First request will be slightly slower, subsequent requests are fast.
 */
async function getEmbeddedChunks(env: Env) {
  if (embeddedChunks) return embeddedChunks

  const { embedBatch } = await import('./rag/embedder')
  const texts = rawChunks.map((c) => c.content)
  const embeddings = await embedBatch(texts, env)

  embeddedChunks = rawChunks.map((chunk, i) => ({
    ...chunk,
    embedding: embeddings[i],
  }))

  return embeddedChunks
}

/**
 * CORS headers helper
 */
function corsHeaders(env: Env): Record<string, string> {
  const origin = env.ALLOWED_ORIGINS || '*'
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  }
}

/**
 * Handle CORS preflight requests
 */
router.options('*', (request: Request, env: Env) => {
  return new Response(null, {
    headers: corsHeaders(env),
  })
})

/**
 * GET /api/health — Health check
 */
router.get('/api/health', () => {
  return new Response(
    JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  )
})

/**
 * GET /api/providers — List available LLM providers
 */
router.get('/api/providers', (request: Request, env: Env) => {
  const currentProvider = env.LLM_PROVIDER || 'openai'
  return new Response(
    JSON.stringify({
      current: currentProvider,
      available: LLMProviderFactory.listProviders(),
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  )
})

/**
 * GET /api/config — Get current configuration (without secrets)
 */
router.get('/api/config', (request: Request, env: Env) => {
  return new Response(
    JSON.stringify({
      provider: env.LLM_PROVIDER || 'openai',
      openaiModel: env.OPENAI_MODEL || 'gpt-4o-mini',
      geminiModel: env.GEMINI_MODEL || 'gemini-1.5-flash',
      embeddingModel: env.EMBEDDING_MODEL || 'text-embedding-3-small',
      maxTokens: parseInt(env.MAX_TOKENS || '512'),
      temperature: parseFloat(env.TEMPERATURE || '0.7'),
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  )
})

/**
 * POST /api/chat — Chat with RAG (streaming response)
 *
 * Request body:
 * {
 *   "message": "User's question",
 *   "history": [  // Optional: previous messages for context
 *     { "role": "user"|"assistant", "content": "..." }
 *   ]
 * }
 *
 * Response: Server-Sent Events stream
 */
router.post('/api/chat', async (request: Request, env: Env) => {
  try {
    const body = (await request.json()) as {
      message: string
      history?: Array<{ role: 'user' | 'assistant'; content: string }>
    }

    if (!body.message || typeof body.message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing "message" field in request body' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders(env),
          },
        }
      )
    }

    // Step 1: Initialize embeddings (lazy) and run RAG
    const chunks = await getEmbeddedChunks(env)
    const ragResult = await runRAG(body.message, env, chunks)

    // Step 2: Build messages array for LLM
    const messages: ChatMessage[] = [
      { role: 'system', content: ragResult.systemPrompt },
    ]

    // Add conversation history for context (last 6 messages)
    if (body.history && body.history.length > 0) {
      const recentHistory = body.history.slice(-6)
      for (const msg of recentHistory) {
        messages.push({
          role: msg.role,
          content: msg.content,
        })
      }
    }

    // Add the current question
    messages.push({ role: 'user', content: body.message })

    // Step 3: Get the LLM provider and stream the response
    const config = getLLMConfig(env)
    const provider = LLMProviderFactory.getProvider(config)

    const llmStream = await provider.chat(messages, config)

    // Step 4: Transform the LLM stream into SSE with source metadata
    const encoder = new TextEncoder()

    // Send sources as the first SSE event
    const sourceEvent = `data: ${JSON.stringify({
      type: 'sources',
      sources: ragResult.sources,
    })}\n\n`

    const { readable, writable } = new TransformStream()
    const writer = writable.getWriter()

    // Write the source event first
    writer.write(encoder.encode(sourceEvent))

    // Then pipe the LLM stream as content events
    ;(async () => {
      const llmReader = llmStream.getReader()
      try {
        while (true) {
          const { done, value } = await llmReader.read()
          if (done) break
          const event = `data: ${JSON.stringify({
            type: 'content',
            content: value,
          })}\n\n`
          await writer.write(encoder.encode(event))
        }
        // Signal end of stream
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
        )
      } catch (err) {
        const errorEvent = `data: ${JSON.stringify({
          type: 'error',
          error: err instanceof Error ? err.message : 'Unknown error',
        })}\n\n`
        await writer.write(encoder.encode(errorEvent))
      } finally {
        await writer.close()
        llmReader.releaseLock()
      }
    })()

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        ...corsHeaders(env),
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders(env),
        },
      }
    )
  }
})

/**
 * 404 handler
 */
router.all('*', () => {
  return new Response(
    JSON.stringify({ error: 'Not found. Available endpoints: GET /api/health, POST /api/chat, GET /api/providers, GET /api/config' }),
    {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    }
  )
})

export default {
  fetch: router.fetch,
}
