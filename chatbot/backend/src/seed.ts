/**
 * Seed Script — Pre-computes embeddings for all knowledge base chunks.
 *
 * Usage:
 *   1. Set OPENAI_API_KEY environment variable
 *   2. Run: npx tsx src/seed.ts
 *   3. Use the output JSON to update the knowledge chunks with embeddings
 *
 * This script should be run before deploying the worker, and the resulting
 * embeddings can be embedded directly into the worker code for faster cold starts.
 */

import { writeFileSync } from 'fs'
import { buildKnowledgeBase } from './rag/knowledge'
import { embedBatch } from './rag/embedder'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
if (!OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY environment variable is required')
  console.error('Usage: OPENAI_API_KEY=sk-... npx tsx src/seed.ts')
  process.exit(1)
}

const mockEnv = {
  OPENAI_API_KEY,
  EMBEDDING_MODEL: 'text-embedding-3-small',
} as any

async function main() {
  console.log('Building knowledge base...')
  const chunks = buildKnowledgeBase()
  console.log(`Generated ${chunks.length} knowledge chunks`)

  console.log('\nGenerating embeddings via OpenAI...')
  const texts = chunks.map((c) => c.content)
  const embeddings = await embedBatch(texts, mockEnv)
  console.log(`Generated ${embeddings.length} embeddings`)

  // Attach embeddings to chunks
  const enrichedChunks = chunks.map((chunk, i) => ({
    ...chunk,
    embedding: embeddings[i],
  }))

  // Output as JSON for embedding into the worker code
  const outputPath = './src/rag/embeddings.json'
  writeFileSync(outputPath, JSON.stringify(enrichedChunks, null, 2))

  console.log(`\n✅ Saved embeddings to ${outputPath}`)
  console.log('Embedding dimension:', embeddings[0].length)
  console.log('Total characters:', texts.reduce((a, b) => a + b.length, 0))
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
