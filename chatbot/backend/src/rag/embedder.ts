/**
 * Embedding utilities for the RAG pipeline.
 * Generates embeddings using OpenAI's API and performs cosine similarity search.
 */

import { Env } from '../config'

/**
 * Generate an embedding vector for a single text string.
 * Uses OpenAI's text-embedding-3-small model.
 */
export async function embedText(
  text: string,
  env: Env
): Promise<number[]> {
  const apiKey = env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY is required for embeddings. Set it via `npx wrangler secret put OPENAI_API_KEY`'
    )
  }

  const model = env.EMBEDDING_MODEL || 'text-embedding-3-small'

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: text,
      encoding_format: 'float',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI Embedding API error (${response.status}): ${error}`)
  }

  const data = (await response.json()) as {
    data: Array<{ embedding: number[] }>
  }
  return data.data[0].embedding
}

/**
 * Generate embeddings for multiple texts in batch.
 * More efficient than calling embedText multiple times.
 */
export async function embedBatch(
  texts: string[],
  env: Env
): Promise<number[][]> {
  const apiKey = env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for embeddings.')
  }

  const model = env.EMBEDDING_MODEL || 'text-embedding-3-small'

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: texts,
      encoding_format: 'float',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI Embedding API error (${response.status}): ${error}`)
  }

  const data = (await response.json()) as {
    data: Array<{ index: number; embedding: number[] }>
  }
  // Sort by index to maintain original order
  return data.data.sort((a, b) => a.index - b.index).map((d) => d.embedding)
}

/**
 * Compute cosine similarity between two vectors.
 * OpenAI embeddings are normalized to unit length, so this is just the dot product.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error(
      `Vector dimension mismatch: ${vecA.length} vs ${vecB.length}`
    )
  }

  let dotProduct = 0
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
  }
  return dotProduct
}

/**
 * Find the top-k most similar chunks to a query vector.
 * Returns the indices and similarity scores sorted by relevance (highest first).
 */
export function findTopK(
  queryVector: number[],
  chunkVectors: number[][],
  k: number = 5
): Array<{ index: number; score: number }> {
  const scored = chunkVectors.map((vec, index) => ({
    index,
    score: cosineSimilarity(queryVector, vec),
  }))

  // Sort by similarity score descending
  scored.sort((a, b) => b.score - a.score)

  // Return top-k
  return scored.slice(0, k)
}
