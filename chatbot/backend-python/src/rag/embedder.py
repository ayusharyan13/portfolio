"""
Embedding utilities for the RAG pipeline.

Uses sentence-transformers for local embeddings (no API key needed).
Model: all-MiniLM-L6-v2 (384-dim, fast, lightweight ~80MB).

First run will download the model automatically. Subsequent runs use cache.
"""

from typing import Optional

import numpy as np
from sentence_transformers import SentenceTransformer

# Lazy-loaded singleton — model loads on first use, then stays in memory
_model: Optional[SentenceTransformer] = None


def _get_model(model_name: str = "all-MiniLM-L6-v2") -> SentenceTransformer:
    """Get or create the sentence-transformers model singleton."""
    global _model
    if _model is None:
        _model = SentenceTransformer(model_name)
    return _model


def embed_text(text: str, model_name: str = "all-MiniLM-L6-v2") -> list[float]:
    """
    Generate an embedding vector for a single text string.

    Args:
        text: The text to embed.
        model_name: Sentence-transformers model name (default: all-MiniLM-L6-v2).

    Returns:
        A list of floats representing the embedding vector.
    """
    model = _get_model(model_name)
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()


def embed_batch(
    texts: list[str],
    model_name: str = "all-MiniLM-L6-v2",
    show_progress: bool = False,
) -> list[list[float]]:
    """
    Generate embeddings for multiple texts in batch.

    More efficient than calling embed_text multiple times.

    Args:
        texts: List of texts to embed.
        model_name: Sentence-transformers model name.
        show_progress: Whether to show a progress bar.

    Returns:
        A list of embedding vectors (each a list of floats).
    """
    model = _get_model(model_name)
    embeddings = model.encode(texts, normalize_embeddings=True, show_progress_bar=show_progress)
    return [e.tolist() for e in embeddings]


def cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    """
    Compute cosine similarity between two vectors.

    Since sentence-transformers normalizes embeddings by default,
    this is simply the dot product of the two vectors.
    """
    if len(vec_a) != len(vec_b):
        raise ValueError(
            f"Vector dimension mismatch: {len(vec_a)} vs {len(vec_b)}"
        )
    return float(np.dot(vec_a, vec_b))


def find_top_k(
    query_vector: list[float],
    chunk_vectors: list[list[float]],
    k: int = 5,
) -> list[dict]:
    """
    Find the top-k most similar chunks to a query vector.

    Args:
        query_vector: The embedding of the query.
        chunk_vectors: List of chunk embedding vectors.
        k: Number of top results to return.

    Returns:
        List of dicts with 'index' and 'score' keys, sorted by score descending.
    """
    scored = [
        {"index": i, "score": cosine_similarity(query_vector, vec)}
        for i, vec in enumerate(chunk_vectors)
    ]
    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:k]
