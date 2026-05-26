"""
Seed Script — Pre-computes embeddings for all knowledge base chunks
and caches them to disk for faster startup.

Usage:
    cd chatbot/backend-python
    python src/seed.py

This script:
1. Builds the knowledge base
2. Computes embeddings using sentence-transformers (local, no API key needed)
3. Saves to src/rag/embeddings_cache.json

On subsequent runs, the chatbot loads the cached embeddings for instant startup.
"""

import json
import os
import sys
from pathlib import Path

# Ensure we can import from the project src directory
_project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_project_root))

from src.rag.knowledge import build_knowledge_base
from src.rag.embedder import embed_batch


CACHE_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "rag",
    "embeddings_cache.json",
)


def main():
    print("Building knowledge base...")
    chunks = build_knowledge_base()
    print(f"Generated {len(chunks)} knowledge chunks")

    print("\nComputing embeddings via sentence-transformers (all-MiniLM-L6-v2)...")
    print("(First run downloads the model ~80MB, subsequent runs use cache)")
    texts = [c.content for c in chunks]
    embeddings = embed_batch(texts, show_progress=True)
    print(f"Generated {len(embeddings)} embeddings (dim={len(embeddings[0])})")

    # Build serializable cache
    cache_data = [
        {
            "id": chunk.id,
            "content": chunk.content,
            "category": chunk.category,
            "metadata": chunk.metadata,
            "embedding": emb,
        }
        for chunk, emb in zip(chunks, embeddings)
    ]

    with open(CACHE_PATH, "w") as f:
        json.dump(cache_data, f, indent=2)

    print(f"\n✅ Saved embeddings cache to {CACHE_PATH}")
    print(f"   File size: {os.path.getsize(CACHE_PATH) / 1024:.1f} KB")
    print(f"   Embedding dimension: {len(embeddings[0])}")
    print(f"   Total characters: {sum(len(t) for t in texts)}")


if __name__ == "__main__":
    main()
