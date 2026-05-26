# Deployment Guide — Vercel + Cloudflare Workers

This guide walks you through deploying the portfolio app **for free** using:

| Component | Platform | Cost | Purpose |
|---|---|---|---|
| **Frontend** (React/Vite) | [Vercel](https://vercel.com) | Free (Hobby) | Static site hosting |
| **Backend** (TypeScript Worker) | [Cloudflare Workers](https://workers.cloudflare.com) | Free (100k req/day) | Chat API + RAG |

---

## 📦 Prerequisites

- [Node.js](https://nodejs.org) (v18+)
- A **Cloudflare account** (free at [cloudflare.com](https://cloudflare.com))
- A **GitHub account** (for Vercel import)

### The Only API Key You Need

| Service | Required For | Get Key | Cost |
|---|---|---|---|
| **Groq** | Chat LLM (llama-3.1) | [console.groq.com/keys](https://console.groq.com/keys) | Free tier (30 req/min) |

> 💡 **Embeddings are free** — They use Cloudflare Workers AI (`bge-small-en-v1.5`), included in the Workers free tier (10k Neurons/day). No OpenAI key needed.

---

## 🚀 Step 1: Deploy the Backend (Cloudflare Workers)

### 1.1 Log in & Set API Key

```bash
cd chatbot/backend

# Log in to Cloudflare (opens browser)
npx wrangler login

# Set the ONLY API key you need
npx wrangler secret put GROQ_API_KEY
# Paste: gsk_your_groq_api_key
```

That's it — just one key. Embeddings use Cloudflare Workers AI (free, built-in).

### 1.2 Deploy

```bash
npx wrangler deploy
```

After deployment, you'll get a URL like:
```
https://portfolio-chatbot.your-subdomain.workers.dev
```

**Save this URL** — you'll need it for the frontend config.

### 1.3 Verify the Backend

```bash
curl https://portfolio-chatbot.your-subdomain.workers.dev/api/health
# → {"status":"ok","timestamp":"..."}

curl https://portfolio-chatbot.your-subdomain.workers.dev/api/providers
# → {"current":"groq","available":["openai","gemini","groq","custom"]}
```

---

## 🚀 Step 2: Deploy the Frontend (Vercel)

### 2.1 Push to GitHub

```bash
# From the project root
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2.2 Import to Vercel

1. Go to [vercel.com](https://vercel.com/new)
2. Import your GitHub repository
3. **Framework preset**: Vite (auto-detected)
4. **Root directory**: `./` (default)

### 2.3 Set Environment Variable

In the Vercel project settings → **Environment Variables**, add:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://portfolio-chatbot.your-subdomain.workers.dev` |

> This tells the chatbot to talk to your Cloudflare Worker instead of localhost.

### 2.4 Deploy

Click **Deploy**. Vercel will:
- Run `npm install`
- Run `npm run build`
- Deploy to a `.vercel.app` domain

Your site is live! 🎉

---

## 🔄 Update After Changes

### Frontend updates (push to git)
```bash
git add .
git commit -m "Update frontend"
git push
# Vercel auto-deploys
```

### Backend updates
```bash
cd chatbot/backend
npx wrangler deploy
```

---

## 🌐 Custom Domain (Optional)

### Vercel (Frontend)
1. Go to Vercel project → Settings → Domains
2. Add your domain (e.g., `ayusharyan.com`)
3. Update DNS records as instructed

### Cloudflare Workers (Backend)
1. Go to Cloudflare Dashboard → Workers & Pages
2. Select your worker → Triggers → Custom Domain
3. Add your domain (e.g., `api.ayusharyan.com`)

---

## 📋 Architecture Overview

```
User's Browser                        Vercel                         Cloudflare Workers
┌──────────────┐                 ┌──────────────┐                  ┌──────────────────┐
│              │  GET /index.html │              │                  │                  │
│  Portfolio   │─────────────────▶│  Vite SPA    │                  │  Worker Runtime  │
│  Website     │◀────────────────│  (Static)    │                  │                  │
│              │                 └──────────────┘                  │  POST /api/chat  │
│              │                                                    │  ├─ RAG Pipeline │
│  Chatbot.jsx │──── POST /api/chat ───────────────────────────────▶│  ├─ LLM (Groq)   │
│  (React)     │◀─── SSE Stream ───────────────────────────────────│  ├─ Embeddings   │
│              │                                                    │  │ (Workers AI)  │
│              │                                                    │  └─ SSE Response │
└──────────────┘                                                    └──────────────────┘
```

---

## 🔍 Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| `Network Error` in chat | Wrong `VITE_API_URL` | Check env var in Vercel matches worker URL |
| `401 Unauthorized` | Missing GROQ_API_KEY | Run `npx wrangler secret put GROQ_API_KEY` |
| Chat responds with wrong info | RAG context not matching | The hardcoded knowledge is used — customize `knowledge.ts` |
| CORS error | Worker not allowing your domain | Set `ALLOWED_ORIGINS` env var in worker |
| Cold start delay (~1s) | First request loads embeddings | Normal — subsequent requests are fast |

---

## 💰 Free Tier Limits

| Platform | Limit | More |
|---|---|---|
| **Vercel Hobby** | 100 GB bandwidth, 6000 build minutes/month | [vercel.com/pricing](https://vercel.com/pricing) |
| **Cloudflare Workers Free** | 100k requests/day, 10k Neurons/day (AI) | [cloudflare.com/plans](https://cloudflare.com/plans) |
| **Groq Free** | 30 requests/min, 1440 requests/day | [console.groq.com/settings](https://console.groq.com/settings) |

> **Total estimated monthly cost:** $0.00 (everything is on free tiers)

---

## 📝 Notes

- The **resume admin panel** (easter egg) only works with the **Python backend** (local). The Cloudflare Worker uses hardcoded knowledge from `chatbot/backend/src/rag/knowledge.ts`.
- To customize the knowledge base, edit `chatbot/backend/src/rag/knowledge.ts` and redeploy the worker.
- The backend automatically seeds embeddings on first request — no manual seed step needed.
- If you want to switch to OpenAI embeddings later, just update `embedder.ts` — no other changes needed.
