/**
 * Embedding utilities for the RAG pipeline.
 * Generates embeddings using Cloudflare Workers AI (free, no API key needed).
 * Uses @cf/baai/bge-small-en-v1.5 — small, fast, 384-dimensional embeddings.
 */

import { Env } from '../config'

/** Workers AI embedding model — free tier (10k Neurons/day), plenty for a portfolio site. */
const EMBEDDING_MODEL = '@cf/baai/bge-small-en-v1.5'

/**
 * Generate an embedding vector for a single text string.
 * Uses Cloudflare Workers AI — no API key required.
 */
export async function embedText(
  text: string,
  env: Env
): Promise<number[]> {
  const result = await env.AI.run(EMBEDDING_MODEL, {
    text: [text],
  })

  if (!result.data || result.data.length === 0) {
    throw new Error('Workers AI returned empty embedding data')
  }

  return result.data[0]
}

/**
 * Generate embeddings for multiple texts in batch.
 * Uses Cloudflare Workers AI — no API key required.
 */
export async function embedBatch(
  texts: string[],
  env: Env
): Promise<number[][]> {
  const result = await env.AI.run(EMBEDDING_MODEL, {
    text: texts,
  })

  if (!result.data || result.data.length !== texts.length) {
    throw new Error(
      `Workers AI returned ${result.data?.length ?? 0} embeddings for ${texts.length} texts`
    )
  }

  return result.data
}

/**
 * Compute cosine similarity between two vectors.
 * bge-small-en-v1.5 embeddings are normalized to unit length,
 * so cosine similarity is just the dot product.
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
