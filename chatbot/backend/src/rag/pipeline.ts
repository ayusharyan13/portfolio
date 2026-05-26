/**
 * RAG Pipeline — Retrieval-Augmented Generation for the portfolio chatbot.
 *
 * Flow:
 * 1. Embed the user's question
 * 2. Find top-k most similar knowledge chunks
 * 3. Build a system prompt with the retrieved context
 * 4. Return the augmented prompt for the LLM
 */

import { embedText, findTopK } from './embedder'
import { Env } from '../config'
import { KnowledgeChunk } from './knowledge'

export interface RAGResult {
  context: string
  sources: Array<{ id: string; category: string }>
  systemPrompt: string
}

/**
 * System prompt template that instructs the LLM how to behave.
 * Retrieved context is injected into this template.
 */
function buildSystemPrompt(context: string): string {
  return `You are an AI assistant for Ayush Aryan's portfolio website. Your job is to answer questions about Ayush — his skills, experience, projects, education, and background.

Use the following context about Ayush to answer the user's question. Be helpful, concise, and accurate.

If the question is about Ayush's availability, location, or contact info, provide that information clearly.
If the question is about his technical skills or experience, give specific examples from the context.
If you don't know the answer based on the context, say so honestly — don't make things up.

Keep responses conversational but professional. Use "Ayush" or "he/him" when referring to him.

Context about Ayush Aryan:
---
${context}
---
`
}

/**
 * Run the full RAG pipeline:
 * 1. Embed the query
 * 2. Retrieve relevant chunks
 * 3. Build an augmented system prompt
 * 4. Return the result
 */
export async function runRAG(
  query: string,
  env: Env,
  chunks: KnowledgeChunk[],
  topK: number = 5
): Promise<RAGResult> {
  // Step 1: Embed the query
  const queryVector = await embedText(query, env)

  // Step 2: Find top-k similar chunks
  const vectors = chunks.map((c) => c.embedding!)
  const results = findTopK(queryVector, vectors, topK)

  // Step 3: Build context from retrieved chunks
  const retrievedChunks = results.map((r) => ({
    chunk: chunks[r.index],
    score: r.score,
  }))

  const contextParts = retrievedChunks.map(
    ({ chunk, score }) =>
      `[${chunk.category}] ${chunk.content}`
  )
  const context = contextParts.join('\n\n')

  const sources = retrievedChunks.map(({ chunk, score }) => ({
    id: chunk.id,
    category: chunk.category,
  }))

  // Step 4: Build the augmented system prompt
  const systemPrompt = buildSystemPrompt(context)

  return { context, sources, systemPrompt }
}


