#!/usr/bin/env bash
#
# start.sh — One-command launcher for the Portfolio Chatbot
#
# Starts both:
#   1. Python FastAPI backend (port 8001)
#   2. Vite React frontend  (port 5173)
#
# Usage:
#   chmod +x start.sh
#   ./start.sh
#
# Press Ctrl+C to stop both servers.

set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/chatbot/backend-python"
FRONTEND_DIR="$ROOT_DIR"

# ─── Colors ─────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ─── Prerequisite checks ────────────────────────────────────────────────
command -v python3 >/dev/null 2>&1 || { echo -e "${YELLOW}❌ python3 is required but not installed${NC}"; exit 1; }
command -v npm     >/dev/null 2>&1 || { echo -e "${YELLOW}❌ npm is required but not installed${NC}"; exit 1; }

# ─── Cleanup handler ────────────────────────────────────────────────────
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down...${NC}"
    [ -n "$BACKEND_PID" ] && kill "$BACKEND_PID" 2>/dev/null
    [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null
    wait 2>/dev/null
    echo -e "${GREEN}✅ Done${NC}"
    exit 0
}
trap cleanup SIGINT SIGTERM

# ─── 1. Install backend dependencies ────────────────────────────────────
echo -e "${BLUE}╔══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🚀 Portfolio Chatbot Launcher             ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${CYAN}📦 Installing backend dependencies...${NC}"
cd "$BACKEND_DIR"
pip3 install -q -r requirements.txt 2>&1 | grep -v "already satisfied" || true
echo -e "${GREEN}   ✅ Backend deps ready${NC}"
echo ""

# ─── 2. Install frontend dependencies (if needed) ──────────────────────
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo -e "${CYAN}📦 Installing frontend dependencies...${NC}"
    cd "$FRONTEND_DIR"
    npm install --silent 2>&1 | tail -1 || true
    echo -e "${GREEN}   ✅ Frontend deps ready${NC}"
    echo ""
fi

# ─── 3. Copy .env if missing ────────────────────────────────────────────
if [ ! -f "$BACKEND_DIR/.env" ] && [ -f "$BACKEND_DIR/../.env.example" ]; then
    cp "$BACKEND_DIR/../.env.example" "$BACKEND_DIR/.env"
    echo -e "${YELLOW}⚠️  Created .env from .env.example — edit $BACKEND_DIR/.env to add your API keys${NC}"
    echo ""
elif [ ! -f "$BACKEND_DIR/.env" ] && [ -f "$ROOT_DIR/.env.example" ]; then
    cp "$ROOT_DIR/.env.example" "$BACKEND_DIR/.env"
    echo -e "${YELLOW}⚠️  Created .env from .env.example — edit $BACKEND_DIR/.env to add your API keys${NC}"
    echo ""
fi

# ─── 4. Start backend ──────────────────────────────────────────────────
echo -e "${CYAN}⚡ Starting backend server (port 8001)...${NC}"
cd "$BACKEND_DIR"
python3 -m uvicorn src.main:app --host 0.0.0.0 --port 8001 --reload &
BACKEND_PID=$!
echo -e "${GREEN}   ✅ Backend running at http://localhost:8001${NC}"

# Wait a moment for the backend to initialize (first run loads ML model)
sleep 2

# ─── 5. Start frontend ─────────────────────────────────────────────────
echo -e "${CYAN}🎨 Starting frontend dev server (port 5173)...${NC}"
cd "$FRONTEND_DIR"
npm run dev -- --host 0.0.0.0 &
FRONTEND_PID=$!
echo -e "${GREEN}   ✅ Frontend running at http://localhost:5173${NC}"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   🎉 Both servers are up!                              ║${NC}"
echo -e "${GREEN}║                                                         ║${NC}"
echo -e "${GREEN}║   Frontend:  http://localhost:5173                      ║${NC}"
echo -e "${GREEN}║   Backend:   http://localhost:8001                      ║${NC}"
echo -e "${GREEN}║   API Docs:  http://localhost:8001/docs                 ║${NC}"
echo -e "${GREEN}║                                                         ║${NC}"
echo -e "${GREEN}║   🥚 Secret: Click the avatar 'A' 5 times to open      ║${NC}"
echo -e "${GREEN}║            the Resume Admin Panel                       ║${NC}"
echo -e "${GREEN}║                                                         ║${NC}"
echo -e "${GREEN}║   Press Ctrl+C to stop both servers                    ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# ─── 6. Wait for either process to exit ────────────────────────────────
wait
