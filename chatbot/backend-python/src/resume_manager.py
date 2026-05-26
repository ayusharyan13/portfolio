"""
Resume Manager — Handles PDF parsing, chunking, embedding, and
multi-profile storage for different resume versions.

Each profile (e.g. "Java Software Dev", "AI/ML Engineer") can have its own
uploaded resume PDF. The chatbot uses the currently active profile's
chunks for RAG retrieval.

Profiles are stored as JSON files in `resumes_cache/` with pre-computed
embeddings for instant chatbot startup.
"""

import json
import re
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Optional

from src.rag.knowledge import KnowledgeChunk
from src.rag.embedder import embed_batch

# ─── PDF parsing ────────────────────────────────────────────────────────

try:
    import fitz  # PyMuPDF
    HAS_PYMUPDF = True
except ImportError:
    HAS_PYMUPDF = False

# ─── Storage ────────────────────────────────────────────────────────────

CACHE_DIR = Path(__file__).resolve().parent / "resumes_cache"
INDEX_PATH = CACHE_DIR / "index.json"

# ─── Predefined resume profiles ─────────────────────────────────────────

RESUME_PROFILES = [
    {"id": "mobile-dev",       "label": "Mobile Developer",     "icon": "📱"},
    {"id": "java-software-dev", "label": "Java Software Dev",    "icon": "☕"},
    {"id": "backend-software",  "label": "Backend Software",     "icon": "⚙️"},
    {"id": "aiml",              "label": "AI/ML Engineer",       "icon": "🤖"},
    {"id": "nodejs-dev",        "label": "Node.js Developer",    "icon": "🟢"},
    {"id": "fullstack-dev",     "label": "Fullstack Developer",  "icon": "🌐"},
]


@dataclass
class ResumeProfileInfo:
    """Public info about a resume profile."""
    id: str
    label: str
    icon: str
    uploaded_at: Optional[str] = None
    chunk_count: int = 0
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    active: bool = False


# ─── Manager ────────────────────────────────────────────────────────────

def _ensure_index():
    """Create the cache dir and index file if they don't exist."""
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    if not INDEX_PATH.exists():
        _write_index({})


def _read_index() -> dict:
    _ensure_index()
    with open(INDEX_PATH) as f:
        return json.load(f)


def _write_index(data: dict):
    with open(INDEX_PATH, "w") as f:
        json.dump(data, f, indent=2)


def list_profiles() -> list[ResumeProfileInfo]:
    """List all profiles with their upload status."""
    _ensure_index()
    index = _read_index()
    active_id = index.get("_active")

    profiles = []
    for p in RESUME_PROFILES:
        data = index.get(p["id"], {})
        profiles.append(ResumeProfileInfo(
            id=p["id"],
            label=p["label"],
            icon=p["icon"],
            uploaded_at=data.get("uploaded_at"),
            chunk_count=data.get("chunk_count", 0),
            file_name=data.get("file_name"),
            file_size=data.get("file_size"),
            active=(p["id"] == active_id),
        ))
    return profiles


def get_active_profile_id() -> Optional[str]:
    """Get the currently active profile ID."""
    index = _read_index()
    return index.get("_active")


def set_active_profile(profile_id: str) -> bool:
    """Activate a profile (must have been uploaded)."""
    index = _read_index()
    if profile_id not in [p["id"] for p in RESUME_PROFILES]:
        return False
    if profile_id not in index:
        return False  # Not uploaded yet
    index["_active"] = profile_id
    _write_index(index)
    return True


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract text from a PDF using PyMuPDF."""
    if not HAS_PYMUPDF:
        raise ImportError(
            "PyMuPDF is required for PDF parsing. Run: pip install PyMuPDF"
        )
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = "\n".join(page.get_text() for page in doc)
    doc.close()
    return text.strip()


def chunk_resume_text(text: str, profile_id: str, chunk_size: int = 400, overlap: int = 80) -> list[KnowledgeChunk]:
    """
    Split resume text into overlapping chunks, trying to respect
    section boundaries (Education, Experience, Skills, etc.).
    """
    # Identify section headers
    section_pattern = re.compile(
        r'(?im)^\s*(education|experience|work\s*history|work\s*experience|'
        r'professional\s*experience|skills|technical\s*skills|projects|'
        r'certifications|certification|summary|professional\s*summary|'
        r'objective|about|contact|achievements|publications|languages|'
        r'interests|volunteering|leadership|profile|personal\s*projects|'
        r'core\s*competencies|technologies|tools|employment|'
        r'relevant\s*experience|research|publication)\s*[\:\n]'
    )

    # Split by section headers
    parts = section_pattern.split(text)
    parts = [p.strip() for p in parts if p.strip()]

    chunks: list[KnowledgeChunk] = []
    current_section = "General"
    chunk_counter = 0

    for part in parts:
        # Check if this part is a section header
        if section_pattern.match(part + "\n"):
            current_section = part.strip().rstrip(":").strip().title()
            continue

        # Chunk the section text by word count
        words = part.split()
        if len(words) < 20:
            # Small fragments, attach to previous section info
            if chunks:
                chunks[-1].content += "\n" + part
            continue

        for i in range(0, len(words), chunk_size - overlap):
            word_slice = words[i:i + chunk_size]
            if len(word_slice) < 15:  # Skip tiny chunks
                continue
            chunk_text = " ".join(word_slice)
            chunks.append(KnowledgeChunk(
                id=f"resume-{profile_id}-{chunk_counter}",
                content=chunk_text,
                category=f"Resume - {current_section}",
                metadata={"section": current_section, "profile": profile_id},
            ))
            chunk_counter += 1

    # Fallback: if no chunks were created (no clear sections), chunk evenly
    if not chunks:
        words = text.split()
        for i in range(0, len(words), chunk_size - overlap):
            word_slice = words[i:i + chunk_size]
            if len(word_slice) < 15:
                continue
            chunk_text = " ".join(word_slice)
            chunks.append(KnowledgeChunk(
                id=f"resume-{profile_id}-{chunk_counter}",
                content=chunk_text,
                category="Resume",
                metadata={"profile": profile_id},
            ))
            chunk_counter += 1

    return chunks


def upload_resume(profile_id: str, pdf_bytes: bytes, file_name: str = "resume.pdf") -> dict:
    """
    Upload and parse a PDF resume for a given profile.
    Returns stats about the upload.
    """
    if profile_id not in [p["id"] for p in RESUME_PROFILES]:
        raise ValueError(f"Unknown profile: {profile_id}")

    # Extract text
    text = extract_text_from_pdf(pdf_bytes)

    if not text:
        raise ValueError("No text could be extracted from the PDF")

    # Chunk
    chunks = chunk_resume_text(text, profile_id)

    # Compute embeddings
    texts = [c.content for c in chunks]
    embeddings = embed_batch(texts)

    # Store chunks with embeddings
    chunk_data = [
        {
            "id": c.id,
            "content": c.content,
            "category": c.category,
            "metadata": c.metadata,
            "embedding": emb,
        }
        for c, emb in zip(chunks, embeddings)
    ]

    # Save to disk
    profile_path = CACHE_DIR / f"{profile_id}.json"
    with open(profile_path, "w") as f:
        json.dump(chunk_data, f, indent=2)

    # Update index
    index = _read_index()
    index[profile_id] = {
        "uploaded_at": datetime.now().isoformat(),
        "chunk_count": len(chunks),
        "file_name": file_name,
        "file_size": len(pdf_bytes),
    }
    index["_active"] = profile_id  # Auto-activate on upload
    _write_index(index)

    return {
        "profile_id": profile_id,
        "chunks": len(chunks),
        "characters": len(text),
    }


def get_active_chunks() -> list[KnowledgeChunk]:
    """Get the chunks for the active profile. Returns empty list if none."""
    profile_id = get_active_profile_id()
    if not profile_id:
        return []

    profile_path = CACHE_DIR / f"{profile_id}.json"
    if not profile_path.exists():
        return []

    with open(profile_path) as f:
        chunk_data = json.load(f)

    chunks = []
    for d in chunk_data:
        chunk = KnowledgeChunk(
            id=d["id"],
            content=d["content"],
            category=d.get("category", "Resume"),
            metadata=d.get("metadata", {}),
        )
        chunk.embedding = d["embedding"]
        chunks.append(chunk)

    return chunks


def delete_profile(profile_id: str) -> bool:
    """Delete a resume profile and its data."""
    profile_path = CACHE_DIR / f"{profile_id}.json"
    if profile_path.exists():
        profile_path.unlink()

    index = _read_index()
    index.pop(profile_id, None)
    if index.get("_active") == profile_id:
        index.pop("_active", None)
    _write_index(index)
    return True
