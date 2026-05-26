"""
RAG Pipeline — Retrieval-Augmented Generation for the portfolio chatbot.

Flow:
1. Embed the user's question (via sentence-transformers, local)
2. Find top-k most similar knowledge chunks (cosine similarity)
3. Build a system prompt with the retrieved context
4. Return the augmented prompt + source metadata
"""

from dataclasses import dataclass, field

from .knowledge import KnowledgeChunk
from .embedder import embed_text, find_top_k


@dataclass
class RAGResult:
    context: str
    sources: list[dict] = field(default_factory=list)
    system_prompt: str = ""


SYSTEM_PROMPT_TEMPLATE = """You are an AI assistant for Ayush Aryan's portfolio website. Your job is to answer questions about Ayush — his skills, experience, projects, education, and background.

Use the following context about Ayush to answer the user's question. Be helpful, concise, and accurate.

If the question is about Ayush's availability, location, or contact info, provide that information clearly.
If the question is about his technical skills or experience, give specific examples from the context.
If you don't know the answer based on the context, say so honestly — don't make things up.

Keep responses conversational but professional. Use "Ayush" or "he/him" when referring to him.

Context about Ayush Aryan:
---
{context}
---
"""


def build_system_prompt(context: str) -> str:
    """Inject retrieved context into the system prompt template."""
    return SYSTEM_PROMPT_TEMPLATE.format(context=context)


def run_rag(
    query: str,
    chunks: list[KnowledgeChunk],
    top_k: int = 5,
    model_name: str = "all-MiniLM-L6-v2",
) -> RAGResult:
    """
    Run the full RAG pipeline.

    1. Embed the query using sentence-transformers (local, no API key).
    2. Find top-k similar chunks via cosine similarity.
    3. Build context from retrieved chunks.
    4. Build augmented system prompt.

    Args:
        query: The user's question.
        chunks: Knowledge base chunks with pre-computed embeddings.
        top_k: Number of chunks to retrieve.
        model_name: Sentence-transformers model name.

    Returns:
        RAGResult with context, sources, and system_prompt.
    """
    # Step 1: Embed the query
    query_vector = embed_text(query, model_name)

    # Step 2: Find top-k similar chunks
    vectors = [c.embedding for c in chunks]
    if not vectors or not vectors[0]:
        raise ValueError(
            "Knowledge chunks have no embeddings. "
            "Run `python src/seed.py` first to pre-compute embeddings."
        )
    results = find_top_k(query_vector, vectors, top_k)  # type: ignore

    # Step 3: Build context from retrieved chunks
    retrieved = [
        {"chunk": chunks[r["index"]], "score": r["score"]}
        for r in results
    ]

    context_parts = [
        f"[{item['chunk'].category}] {item['chunk'].content}"
        for item in retrieved
    ]
    context = "\n\n".join(context_parts)

    sources = [
        {"id": item["chunk"].id, "category": item["chunk"].category}
        for item in retrieved
    ]

    # Step 4: Build the augmented system prompt
    system_prompt = build_system_prompt(context)

    return RAGResult(context=context, sources=sources, system_prompt=system_prompt)


# Re-export so main.py can import it cleanly
run_rag_with_chunks = run_rag
