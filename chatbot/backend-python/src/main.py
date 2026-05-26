"""
Portfolio Chatbot — FastAPI Server

API Endpoints:
- GET  /api/health               → Health check
- POST /api/chat                 → Chat with RAG (streaming SSE response)
- GET  /api/providers            → List available LLM providers
- GET  /api/config               → Get current configuration (without secrets)
- GET  /api/admin/profiles       → List resume profiles with status
- POST /api/admin/resume/upload  → Upload a PDF resume for a profile
- POST /api/admin/resume/activate → Activate a resume profile
- DELETE /api/admin/resume/{id}  → Delete a resume profile

Run with:
    uvicorn src.main:app --reload --port 8001
    # or: python -m src.main
"""

import json
import logging
import sys
from contextlib import asynccontextmanager
from typing import AsyncGenerator, List, Optional

from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from .config import AppConfig, get_llm_config
from .llm.interface import ChatMessage
from .llm.factory import LLMProviderFactory
from .rag.knowledge import build_knowledge_base, KnowledgeChunk
from .rag.embedder import embed_batch
from .rag.pipeline import run_rag, run_rag_with_chunks
from . import resume_manager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("portfolio-chatbot")

# ─── Global state ───────────────────────────────────────────────────────

cfg = AppConfig()

# Build knowledge base at startup
raw_chunks = build_knowledge_base()
embedded_chunks: Optional[List[KnowledgeChunk]] = None


def _get_all_chunks() -> list[KnowledgeChunk]:
    """Merge hardcoded knowledge base with active resume chunks."""
    base = embedded_chunks or []
    resume_chunks = resume_manager.get_active_chunks()
    if resume_chunks:
        logger.info("Merging %d resume chunks with %d base chunks", len(resume_chunks), len(base))
        return resume_chunks + base
    return base


def _init_embeddings():
    """Pre-compute embeddings for all chunks at startup (blocking, runs once)."""
    global embedded_chunks
    if embedded_chunks is not None:
        return
    logger.info("Computing embeddings for %d chunks using sentence-transformers...", len(raw_chunks))
    texts = [c.content for c in raw_chunks]
    embeddings = embed_batch(texts, cfg.embedding_model, show_progress=True)
    for chunk, emb in zip(raw_chunks, embeddings):
        chunk.embedding = emb
    embedded_chunks = raw_chunks
    logger.info("Embeddings ready (dim=%d)", len(embeddings[0]))


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan — compute embeddings on startup."""
    _init_embeddings()
    yield


app = FastAPI(title="Portfolio Chatbot", version="1.0.0", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=cfg.allowed_origins.split(",") if cfg.allowed_origins != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Request/Response models ────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = None


class ActivateRequest(BaseModel):
    profile_id: str


# ─── Endpoints ──────────────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {"status": "ok", "timestamp": __import__("datetime").datetime.now().isoformat()}


@app.get("/api/providers")
async def providers():
    return {
        "current": cfg.llm_provider,
        "available": LLMProviderFactory.list_providers(),
    }


@app.get("/api/config")
async def config():
    return {
        "provider": cfg.llm_provider,
        "groqModel": cfg.groq_model,
        "openaiModel": cfg.openai_model,
        "geminiModel": cfg.gemini_model,
        "embeddingModel": cfg.embedding_model,
        "maxTokens": cfg.max_tokens,
        "temperature": cfg.temperature,
    }


@app.post("/api/chat")
async def chat(req: ChatRequest):
    """
    Chat with RAG — streaming SSE response.

    Returns a Server-Sent Events stream with events:
      data: {"type":"sources","sources":[...]}
      data: {"type":"content","content":"..."}
      data: {"type":"done"}
      data: {"type":"error","error":"..."}
    """
    if not req.message or not req.message.strip():
        return {"error": 'Missing "message" field in request body'}

    async def event_stream() -> AsyncGenerator[str, None]:
        try:
            # Get all chunks (base + active resume)
            all_chunks = _get_all_chunks()

            # Step 1: Run RAG (sync, runs on event loop thread pool)
            import asyncio
            rag_result = await asyncio.to_thread(
                run_rag_with_chunks, req.message, all_chunks, 5, cfg.embedding_model
            )

            # Step 2: Build messages for the LLM
            messages: list[ChatMessage] = [
                ChatMessage(role="system", content=rag_result.system_prompt),
            ]

            # Add conversation history (last 6 messages)
            if req.history:
                for msg in req.history[-6:]:
                    messages.append(ChatMessage(role=msg.get("role", "user"), content=msg.get("content", "")))

            # Add the current question
            messages.append(ChatMessage(role="user", content=req.message))

            # Step 3: Send source metadata first
            yield f"data: {json.dumps({'type': 'sources', 'sources': rag_result.sources})}\n\n"

            # Step 4: Get the LLM provider and stream the response
            llm_config = get_llm_config(cfg)
            provider = LLMProviderFactory.get_provider(llm_config)

            async for chunk in provider.chat(messages):
                yield f"data: {json.dumps({'type': 'content', 'content': chunk})}\n\n"

            # Signal end of stream
            yield f"data: {json.dumps({'type': 'done'})}\n\n"

        except Exception as e:
            logger.exception("Chat error")
            yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )


# ─── Admin: Resume Management ───────────────────────────────────────────

@app.get("/api/admin/profiles")
async def admin_list_profiles():
    """List all resume profiles with upload status."""
    profiles = resume_manager.list_profiles()
    return {
        "profiles": [
            {
                "id": p.id,
                "label": p.label,
                "icon": p.icon,
                "uploaded_at": p.uploaded_at,
                "chunk_count": p.chunk_count,
                "file_name": p.file_name,
                "file_size": p.file_size,
                "active": p.active,
            }
            for p in profiles
        ]
    }


@app.post("/api/admin/resume/upload")
async def admin_upload_resume(
    profile_id: str = Form(...),
    file: UploadFile = File(...),
):
    """
    Upload a PDF resume for a given profile.
    Accepts multipart form data with profile_id and a PDF file.
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    pdf_bytes = await file.read()
    if len(pdf_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file")

    try:
        result = resume_manager.upload_resume(
            profile_id=profile_id,
            pdf_bytes=pdf_bytes,
            file_name=file.filename,
        )
        logger.info(
            "Resume uploaded: profile=%s chunks=%d chars=%d",
            profile_id, result["chunks"], result["characters"],
        )
        return {"status": "ok", **result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except ImportError as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/admin/resume/activate")
async def admin_activate_resume(req: ActivateRequest):
    """Activate a resume profile for the chatbot."""
    success = resume_manager.set_active_profile(req.profile_id)
    if not success:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot activate profile '{req.profile_id}'. Make sure it exists and has been uploaded."
        )
    return {"status": "ok", "active_profile": req.profile_id}


@app.delete("/api/admin/resume/{profile_id}")
async def admin_delete_resume(profile_id: str):
    """Delete a resume profile."""
    resume_manager.delete_profile(profile_id)
    logger.info("Resume deleted: profile=%s", profile_id)
    return {"status": "ok", "deleted": profile_id}


# ─── Main entry point ───────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host=cfg.host,
        port=cfg.port,
        reload=True,
    )
