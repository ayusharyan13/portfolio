# 🤖 Portfolio Chatbot — AI Resume Assistant

An intelligent chatbot for [Ayush Aryan's portfolio](https://ayusharyan13.github.io/portfolio/) that answers questions about his skills, experience, projects, and background using **Retrieval-Augmented Generation (RAG)**.

> **🥚 Secret Feature:** Click the avatar "A" 5 times to open the **Resume Admin Panel** — upload and switch between multiple resume PDFs for different roles!

---

## ✨ Features

- **💬 AI Chat** — Ask anything about Ayush's experience, skills, education, projects
- **📄 Resume Upload** — Upload your resume PDF and the chatbot instantly knows it
- **🔄 Multiple Profiles** — Maintain separate resumes for different roles (Mobile Dev, Java Dev, Backend, AI/ML, Node.js, Fullstack)
- **🧠 RAG Pipeline** — Uses local embeddings (sentence-transformers) + cosine similarity for accurate retrieval
- **⚡ Streaming Responses** — Real-time SSE streaming from the LLM
- **🔒 Private & Local** — Embeddings run locally, no data leaves your machine (except LLM API calls)
- **🎨 Dark Theme** — Matches the portfolio's aesthetic

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.9+** with `pip3`
- **Node.js 18+** with `npm`

### One-Command Launch

From the **project root** directory:

```bash
chmod +x start.sh
./start.sh
```

Or from anywhere:

```bash
/path/to/portfolio/start.sh
```

This will:
1. Install Python dependencies (`PyMuPDF`, `sentence-transformers`, `fastapi`, etc.)
2. Install Node.js dependencies (`react`, `vite`, `tailwindcss`)
3. Start the backend server on **port 8001**
4. Start the frontend dev server on **port 5173**
5. Print a summary with all URLs

> ⏳ **First run:** The `sentence-transformers` model (~80MB) will download automatically on first startup. Subsequent startups are instant.

### Manual Launch

**Terminal 1 — Backend:**
```bash
cd chatbot/backend-python
pip3 install -r requirements.txt
python3 -m uvicorn src.main:app --reload --port 8001
```

**Terminal 2 — Frontend:**
```bash
npm install
npm run dev
```

---

## 🥚 The Easter Egg: Resume Admin Panel

This is the **secret feature** — a hidden admin panel for managing resume uploads.

### How to Access

1. Open the chatbot (bottom-right of the portfolio page)
2. **Click the green avatar "A"** in the chat header **5 times**
3. The **Resume Admin Panel** slides open

### How to Use

| Step | Action |
|------|--------|
| 1 | Click the upload button (⬆️) next to any profile |
| 2 | Select a **PDF resume** from your computer |
| 3 | The backend parses it, creates chunks, and computes embeddings |
| 4 | The profile shows as uploaded with chunk count |
| 5 | Click **"Activate"** to make it the active resume |
| 6 | Start chatting — the chatbot uses your uploaded resume! |

### Available Profiles

| Profile | Icon | Role |
|---------|------|------|
| Mobile Developer | 📱 | React Native / Flutter / iOS / Android |
| Java Software Dev | ☕ | Java / Spring Boot / Microservices |
| Backend Software | ⚙️ | APIs / Distributed Systems / Kafka |
| AI/ML Engineer | 🤖 | Machine Learning / RAG / LLMs |
| Node.js Developer | 🟢 | Node.js / Express / TypeScript |
| Fullstack Developer | 🌐 | Frontend + Backend |

> **Pro tip:** Upload different resume PDFs for different roles. Re-upload anytime to update — the old version is replaced.

---

## 🔌 API Endpoints

The backend runs at `http://localhost:8001`. All admin endpoints are hidden (no public UI) — use the easter egg panel instead.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/chat` | Chat with RAG (SSE streaming) |
| `GET` | `/api/providers` | List available LLM providers |
| `GET` | `/api/config` | Current configuration |
| `GET` | `/api/admin/profiles` | List resume profiles with status |
| `POST` | `/api/admin/resume/upload` | Upload a PDF resume (multipart) |
| `POST` | `/api/admin/resume/activate` | Activate a profile |
| `DELETE` | `/api/admin/resume/{id}` | Delete a resume profile |

### Chat Request

```json
POST /api/chat
{
  "message": "What technologies does Ayush work with?",
  "history": [
    {"role": "user", "content": "Previous question"},
    {"role": "assistant", "content": "Previous answer"}
  ]
}
```

Returns a **Server-Sent Events** stream:

```
data: {"type":"sources","sources":[...]}
data: {"type":"content","content":"Ayush works with..."}
data: {"type":"done"}
```

### Upload Resume

```bash
curl -X POST http://localhost:8001/api/admin/resume/upload \
  -F "profile_id=java-software-dev" \
  -F "file=@/path/to/resume.pdf"
```

---

## 🧠 Architecture

```
User Question
     │
     ▼
┌─────────────────────┐
│  1. Embed Question  │  ← sentence-transformers (local)
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ 2. Find Top-K       │  ← cosine similarity on resume + base chunks
│    Similar Chunks   │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ 3. Build Context    │  ← retrieved chunks → system prompt
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ 4. LLM Generation   │  ← Groq / OpenAI / Gemini / Custom
└────────┬────────────┘
         │
         ▼
   Streaming Response
```

### Knowledge Sources

1. **Uploaded Resume** (if active) — parsed from PDF, chunked, embedded
2. **Hardcoded Knowledge Base** — `knowledge.py` (about, experience, skills, projects, etc.)

Both sources are merged at query time, with the resume chunks prepended for priority.

---

## 🛠️ Configuration

Copy `.env.example` to `.env` and configure:

```env
# LLM Provider: openai | gemini | groq | custom
LLM_PROVIDER=groq

# Groq Cloud (fast free tier)
GROQ_API_KEY=gsk_your_key_here

# Optional: OpenAI / Gemini / Custom
# OPENAI_API_KEY=sk-your-key
# GEMINI_API_KEY=your-key
```

---

## 📁 Project Structure

```
chatbot/backend-python/
├── src/
│   ├── main.py              # FastAPI server + admin endpoints
│   ├── config.py            # Environment config
│   ├── resume_manager.py    # PDF parsing, chunking, multi-profile storage
│   ├── seed.py              # Pre-compute embeddings (one-time)
│   ├── resumes_cache/       # Cached resume chunks + embeddings
│   ├── llm/
│   │   ├── interface.py     # ChatMessage model
│   │   ├── factory.py       # LLM provider factory
│   │   ├── groq.py          # Groq Cloud provider
│   │   ├── openai.py        # OpenAI provider
│   │   ├── gemini.py        # Google Gemini provider
│   │   └── custom.py        # Custom OpenAI-compatible provider
│   └── rag/
│       ├── knowledge.py     # Hardcoded knowledge base
│       ├── embedder.py      # Sentence-transformers embeddings
│       └── pipeline.py      # RAG retrieval pipeline
├── requirements.txt
└── .env

src/
└── components/
    └── Chatbot.jsx          # React chatbot component + admin panel
```

---

## 🧪 Testing

Start the servers and test the chat:

```bash
# Quick health check
curl http://localhost:8001/api/health

# List profiles
curl http://localhost:8001/api/admin/profiles

# Test chat
curl -X POST http://localhost:8001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What does Ayush specialize in?"}'
```

---

## ❓ FAQ

**Q: The chatbot says "Server error" — what's wrong?**
A: Check that your API key is set in `.env` and the provider is configured correctly. Run `curl http://localhost:8001/api/config` to verify.

**Q: My PDF uploaded but the chatbot doesn't know the new info?**
A: Make sure the profile shows "ACTIVE" in the admin panel. The active profile is used for retrieval.

**Q: Can I upload the same resume to multiple profiles?**
A: Yes! Each profile stores its own copy. Upload the same PDF to different roles.

**Q: Is my resume data stored somewhere?**
A: Chunks and embeddings are stored locally in `chatbot/backend-python/src/resumes_cache/`. Nothing is sent to any server except the LLM API calls.

**Q: The sentence-transformers model download is slow?**
A: It's ~80MB and downloads once. Subsequent startups are instant.

**Q: How do I change the LLM model?**
A: Edit `.env` and set `LLM_PROVIDER` to `openai`, `gemini`, `groq`, or `custom`. Add the corresponding API key.
