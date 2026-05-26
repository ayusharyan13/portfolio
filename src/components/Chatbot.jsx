import { useState, useRef, useEffect, useCallback } from 'react'

/**
 * Chatbot — Floating chat widget for the portfolio.
 *
 * Features:
 * - Floating action button to toggle chat
 * - Streaming responses via SSE
 * - Message history with auto-scroll
 * - Configurable API endpoint
 * - Mobile-responsive
 * - Keyboard shortcuts (Enter to send, Escape to close)
 *
 * 🥚 Secret: Click the avatar "A" 5 times to open the Resume Admin Panel.
 *   There you can upload/switch between resume PDFs for different roles.
 */

// Default API URL — uses VITE_API_URL env var in production, falls back to localhost for dev
const DEFAULT_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'

const RESUME_PROFILES = [
  { id: 'mobile-dev',       label: 'Mobile Developer',     icon: '📱' },
  { id: 'java-software-dev', label: 'Java Software Dev',    icon: '☕' },
  { id: 'backend-software',  label: 'Backend Software',     icon: '⚙️' },
  { id: 'aiml',              label: 'AI/ML Engineer',       icon: '🤖' },
  { id: 'nodejs-dev',        label: 'Node.js Developer',    icon: '🟢' },
  { id: 'fullstack-dev',     label: 'Fullstack Developer',  icon: '🌐' },
]

export default function Chatbot({ apiUrl = DEFAULT_API_URL }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hi! I'm Ayush's AI assistant. Ask me anything about his skills, experience, projects, or background! 👋",
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // ─── Admin panel state ───
  const [adminOpen, setAdminOpen] = useState(false)
  const [clickCount, setClickCount] = useState(0)
  const [profiles, setProfiles] = useState(null)
  const [uploading, setUploading] = useState(null)     // profile id being uploaded
  const [adminMsg, setAdminMsg] = useState(null)       // { type: 'success'|'error', text }
  const fileInputRef = useRef(null)

  // Auto-scroll to latest message
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (adminOpen) {
          setAdminOpen(false)
        } else {
          setIsOpen(false)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, adminOpen])

  // ─── Avatar click handler (easter egg trigger) ───
  const handleAvatarClick = () => {
    const newCount = clickCount + 1
    setClickCount(newCount)
    if (newCount >= 5) {
      setClickCount(0)
      fetchProfiles()
      setAdminOpen(true)
    }
  }

  // ─── Fetch profiles from backend ───
  const fetchProfiles = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/admin/profiles`)
      const data = await res.json()
      setProfiles(data.profiles)
    } catch (e) {
      setAdminMsg({ type: 'error', text: 'Could not connect to server' })
    }
  }

  // ─── Upload resume for a profile ───
  const handleUpload = async (profileId, file) => {
    setUploading(profileId)
    setAdminMsg(null)

    try {
      const formData = new FormData()
      formData.append('profile_id', profileId)
      formData.append('file', file)

      const res = await fetch(`${apiUrl}/api/admin/resume/upload`, {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || 'Upload failed')
      }

      setAdminMsg({
        type: 'success',
        text: `✅ ${file.name} uploaded — ${data.chunks} chunks parsed`,
      })
      fetchProfiles()
    } catch (e) {
      setAdminMsg({ type: 'error', text: `❌ ${e.message}` })
    } finally {
      setUploading(null)
    }
  }

  // ─── Activate a profile ───
  const handleActivate = async (profileId) => {
    setAdminMsg(null)
    try {
      const res = await fetch(`${apiUrl}/api/admin/resume/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: profileId }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Activation failed')
      }
      setAdminMsg({ type: 'success', text: `✅ Activated` })
      fetchProfiles()
    } catch (e) {
      setAdminMsg({ type: 'error', text: `❌ ${e.message}` })
    }
  }

  // ─── Delete a profile ───
  const handleDelete = async (profileId) => {
    setAdminMsg(null)
    try {
      const res = await fetch(`${apiUrl}/api/admin/resume/${profileId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Delete failed')
      }
      setAdminMsg({ type: 'success', text: `🗑️ Deleted` })
      fetchProfiles()
    } catch (e) {
      setAdminMsg({ type: 'error', text: `❌ ${e.message}` })
    }
  }

  // ─── File picker handler ───
  const triggerFilePicker = (profileId) => {
    if (fileInputRef.current) {
      fileInputRef.current._profileId = profileId
      fileInputRef.current.click()
    }
  }

  const handleFileSelected = (e) => {
    const file = e.target.files?.[0]
    const profileId = e.target._profileId
    if (file && profileId) {
      handleUpload(profileId, file)
    }
    e.target.value = ''
  }

  // ─── Chat logic ───
  const sendMessage = async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    setInput('')
    setError(null)
    setIsLoading(true)

    // Add user message
    const userMsg = { role: 'user', content: trimmed }
    const assistantMsg = { role: 'assistant', content: '' }
    setMessages((prev) => [...prev, userMsg, assistantMsg])

    // Build history for context (last 10 messages, excluding system)
    const history = [...messages, userMsg]
      .filter((m) => m.role !== 'system')
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }))

    try {
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: history.slice(0, -1), // Exclude the just-added user message
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || `Server error: ${response.status}`)
      }

      // Parse SSE stream
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmedLine = line.trim()
          if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue

          try {
            const data = JSON.parse(trimmedLine.slice(6))

            if (data.type === 'content') {
              // Append streaming content to the assistant message
              setMessages((prev) => {
                const updated = [...prev]
                const last = updated[updated.length - 1]
                if (last.role === 'assistant') {
                  updated[updated.length - 1] = {
                    ...last,
                    content: last.content + data.content,
                  }
                }
                return updated
              })
            } else if (data.type === 'done') {
              // Stream complete
            } else if (data.type === 'error') {
              throw new Error(data.error)
            }
          } catch (parseErr) {
            if (parseErr.message?.startsWith('Server error')) throw parseErr
            // Ignore malformed SSE lines
          }
        }
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to send message'
      setError(errorMsg)
      // Replace the last (empty) assistant message with error
      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last.role === 'assistant' && !last.content) {
          updated[updated.length - 1] = {
            role: 'assistant',
            content: `Sorry, I encountered an error: ${errorMsg}`,
          }
        }
        return updated
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleFileSelected}
      />

      {/* Chat button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
          isOpen
            ? 'bg-gray-700 rotate-45 scale-90'
            : 'bg-[#12d640] hover:bg-[#12d640]/90 hover:scale-105'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        title="Ask about Ayush"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0a0a1a]">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        )}
      </button>

      {/* Chat window */}
      <div
        className={`absolute bottom-16 right-0 w-[360px] sm:w-[400px] max-w-[calc(100vw-48px)] bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden transition-all duration-300 origin-bottom-right ${
          isOpen
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
        style={{ maxHeight: 'min(600px, calc(100vh - 120px))' }}
      >
        {/* Header — click avatar 5x for secret admin panel */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0a0a1a]">
          <div className="flex items-center gap-3">
            <button
              onClick={handleAvatarClick}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-[#12d640] to-[#0ea5e9] flex items-center justify-center text-sm font-bold text-[#0a0a1a] cursor-pointer hover:ring-2 hover:ring-[#12d640]/50 transition-all select-none"
              title={adminOpen ? 'Close admin panel' : `${5 - clickCount} clicks left for secret menu`}
            >
              A
            </button>
            <div>
              <p className="text-sm font-semibold text-white">Ayush's AI</p>
              <p className="text-xs text-gray-500">
                {adminOpen ? '📋 Resume Admin' : 'Ask me anything!'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (adminOpen) setAdminOpen(false)
              else setIsOpen(false)
            }}
            className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            aria-label={adminOpen ? 'Close admin panel' : 'Close chat'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content area — either messages or admin panel */}
        {adminOpen ? (
          <ResumeAdminPanel
            profiles={profiles}
            uploading={uploading}
            adminMsg={adminMsg}
            onUpload={triggerFilePicker}
            onActivate={handleActivate}
            onDelete={handleDelete}
            onRefresh={fetchProfiles}
            onClose={() => setAdminOpen(false)}
          />
        ) : (
          <>
            {/* Messages */}
            <div
              className="overflow-y-auto p-4 space-y-4"
              style={{ height: '400px', maxHeight: 'calc(100vh - 280px)' }}
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#12d640] text-[#0a0a1a] rounded-br-md'
                        : 'bg-white/5 text-gray-200 rounded-bl-md border border-white/5'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content || (isLoading && i === messages.length - 1 ? '...' : '')}</p>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && messages[messages.length - 1]?.content === '' && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/5 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="border-t border-white/10 p-3 bg-[#0a0a1a]">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about Ayush..."
                  disabled={isLoading}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 disabled:opacity-50 focus:outline-none focus:border-[#12d640]/50 focus:ring-1 focus:ring-[#12d640]/20 transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 rounded-xl bg-[#12d640] text-[#0a0a1a] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#12d640]/90 transition-all shrink-0"
                  aria-label="Send message"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}


/* ─── Admin Panel ──────────────────────────────────────────────────────────── */

function ResumeAdminPanel({ profiles, uploading, adminMsg, onUpload, onActivate, onDelete, onRefresh, onClose }) {
  const [loading, setLoading] = useState(!profiles)

  useEffect(() => {
    if (!profiles) {
      onRefresh()
    }
  }, [])

  useEffect(() => {
    if (profiles) {
      setLoading(false)
    }
  }, [profiles])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#12d640] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading profiles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-y-auto p-4" style={{ height: '450px' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold text-sm">📋 Resume Admin</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Upload & switch resumes for different roles
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          title="Refresh"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
        </button>
      </div>

      {/* Status message */}
      {adminMsg && (
        <div
          className={`text-xs px-3 py-2 rounded-lg mb-3 ${
            adminMsg.type === 'success'
              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}
        >
          {adminMsg.text}
        </div>
      )}

      {/* Profile cards */}
      <div className="space-y-2">
        {profiles?.map((p) => (
          <div
            key={p.id}
            className={`rounded-xl border p-3 transition-all ${
              p.active
                ? 'border-[#12d640]/40 bg-[#12d640]/5'
                : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-lg">{p.icon}</span>
                <div className="min-w-0">
                  <p className="text-sm text-white font-medium truncate">
                    {p.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {p.uploaded_at
                      ? `📄 ${new Date(p.uploaded_at).toLocaleDateString()} • ${p.chunk_count} chunks`
                      : 'No resume uploaded'
                    }
                  </p>
                </div>
              </div>

              {/* Active badge or actions */}
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {p.active ? (
                  <span className="text-[10px] font-semibold text-[#12d640] bg-[#12d640]/10 px-2 py-0.5 rounded-full border border-[#12d640]/20 whitespace-nowrap">
                    ACTIVE
                  </span>
                ) : (
                  <>
                    {p.uploaded_at && (
                      <button
                        onClick={() => onActivate(p.id)}
                        className="text-[11px] text-[#12d640] hover:text-white px-2 py-1 rounded-lg hover:bg-[#12d640]/20 transition-all whitespace-nowrap"
                      >
                        Activate
                      </button>
                    )}
                  </>
                )}

                {/* Upload button */}
                <button
                  onClick={() => onUpload(p.id)}
                  disabled={uploading === p.id}
                  className={`p-1.5 rounded-lg transition-all ${
                    uploading === p.id
                      ? 'text-gray-600'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  title="Upload PDF resume"
                >
                  {uploading === p.id ? (
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="32" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  )}
                </button>

                {/* Delete button */}
                {p.uploaded_at && (
                  <button
                    onClick={() => onDelete(p.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="Delete resume"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer hint */}
      <div className="mt-4 text-center">
        <p className="text-[10px] text-gray-600">
          Click the avatar <span className="text-[#12d640]">A</span> 5 times to toggle this panel
        </p>
      </div>
    </div>
  )
}
