"use client"

import { useState, useRef, useEffect } from "react"
import { BUSINESS_INFO } from "@/lib/data/faq"
import { Send, MessageCircle, X, Phone, Scale } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content: "Assalam o Alaikum! 👋\n\nMain AL-NOOR Legal Services ka AI chatbot hoon.\n\nFee, timing, documents — kuch bhi poochein!",
  timestamp: new Date()
}

const QUICK = ["Fee kya hai?", "Office timing?", "Rent agreement?", "Free consultation?"]

const ANNOUNCEMENTS = [
  "🎯 Pehli consultation bilkul FREE hai!",
  "📋 Rent agreement sirf Rs. 1,500 mein",
  "⚡ Contract 1-2 din mein ready",
  "📞 Call: 0300-1234567",
  "🕐 Mon-Sat: 9am - 6pm",
]

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId] = useState(() => `sess_${Math.random().toString(36).slice(2)}_${Date.now()}`)
  const [announcementIndex, setAnnouncementIndex] = useState(0)
  const [announcementVisible, setAnnouncementVisible] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setAnnouncementVisible(false)
      setTimeout(() => {
        setAnnouncementIndex(i => (i + 1) % ANNOUNCEMENTS.length)
        setAnnouncementVisible(true)
      }, 400)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
      document.body.style.overflow = "hidden"
      document.body.style.position = "fixed"
      document.body.style.width = "100%"
    } else {
      document.body.style.overflow = ""
      document.body.style.position = ""
      document.body.style.width = ""
    }
    return () => {
      document.body.style.overflow = ""
      document.body.style.position = ""
      document.body.style.width = ""
    }
  }, [isOpen])

  async function send(text: string) {
    const t = text.trim()
    if (!t || isTyping) return
    setMessages(p => [...p, { id: Date.now().toString(), role: "user", content: t, timestamp: new Date() }])
    setInput("")
    setIsTyping(true)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: t, sessionId })
      })
      const data = await res.json()
      setMessages(p => [...p, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: res.status === 429 ? (data.error || "Limit ho gayi. Call karein: " + BUSINESS_INFO.phone) : (data.response || "Jawab nahi mila."),
        timestamp: new Date()
      }])
    } catch {
      setMessages(p => [...p, { id: (Date.now() + 1).toString(), role: "assistant", content: "Network masla. Call karein: " + BUSINESS_INFO.phone, timestamp: new Date() }])
    } finally {
      setIsTyping(false)
    }
  }

  const ft = (d: Date) => d.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })

  return (
    <>
      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(5,150,105,0.6); }
          70% { transform: scale(1); box-shadow: 0 0 0 12px rgba(5,150,105,0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(5,150,105,0); }
        }
        @keyframes bounce-dot {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes ticker {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .chat-launcher {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9997;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%);
          box-shadow: 0 8px 32px rgba(5,150,105,0.5), 0 2px 8px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: none;
          outline: none;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          animation: pulse-ring 2.5s infinite;
          transition: transform 0.2s;
        }
        .chat-launcher:active { transform: scale(0.92); }

        .chat-badge {
          position: absolute;
          top: -3px;
          right: -3px;
          width: 18px;
          height: 18px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border-radius: 50%;
          border: 2.5px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          color: white;
          font-weight: bold;
        }

        .chat-window {
          position: fixed;
          bottom: 100px;
          right: 24px;
          width: 380px;
          height: 580px;
          max-width: calc(100vw - 32px);
          max-height: calc(100vh - 120px);
          border-radius: 20px;
          z-index: 9998;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: #f8fafc;
          box-shadow: 0 32px 64px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.12);
          border: 1px solid rgba(255,255,255,0.8);
          animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @media (max-width: 640px) {
          .chat-window {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            height: 100%;
            max-width: 100%;
            max-height: 100%;
            border-radius: 0;
            animation: fadeIn 0.25s ease;
          }
          .chat-launcher {
            bottom: 20px;
            right: 20px;
          }
        }

        .chat-header {
          background: linear-gradient(135deg, #059669 0%, #047857 60%, #065f46 100%);
          padding: 14px 16px 10px;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
        }
        .chat-header::before {
          content: '';
          position: absolute;
          top: -30px;
          right: -30px;
          width: 120px;
          height: 120px;
          background: rgba(255,255,255,0.06);
          border-radius: 50%;
        }
        .chat-header::after {
          content: '';
          position: absolute;
          bottom: -20px;
          left: 40px;
          width: 80px;
          height: 80px;
          background: rgba(255,255,255,0.04);
          border-radius: 50%;
        }

        .announcement-bar {
          background: linear-gradient(90deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 100%);
          padding: 5px 14px;
          font-size: 11px;
          color: #d1fae5;
          text-align: center;
          letter-spacing: 0.2px;
          transition: opacity 0.3s;
        }

        .messages-area {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 16px 14px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
          background: linear-gradient(180deg, #f0fdf4 0%, #f8fafc 100%);
        }
        .messages-area::-webkit-scrollbar { width: 3px; }
        .messages-area::-webkit-scrollbar-track { background: transparent; }
        .messages-area::-webkit-scrollbar-thumb { background: #d1fae5; border-radius: 3px; }

        .msg-row { display: flex; gap: 8px; animation: fadeIn 0.25s ease; }
        .msg-row-user { flex-direction: row-reverse; }

        .msg-avatar {
          width: 32px;
          height: 32px;
          min-width: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #059669, #047857);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 4px;
          box-shadow: 0 2px 8px rgba(5,150,105,0.3);
        }

        .msg-bubble-bot {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 4px 18px 18px 18px;
          padding: 10px 14px;
          font-size: 13.5px;
          line-height: 1.55;
          white-space: pre-line;
          color: #1e293b;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          max-width: 78%;
          position: relative;
        }
        .msg-bubble-user {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          border-radius: 18px 4px 18px 18px;
          padding: 10px 14px;
          font-size: 13.5px;
          line-height: 1.55;
          white-space: pre-line;
          color: white;
          box-shadow: 0 4px 12px rgba(5,150,105,0.35);
          max-width: 78%;
        }

        .typing-bubble {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 4px 18px 18px 18px;
          padding: 12px 16px;
          display: flex;
          gap: 5px;
          align-items: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: linear-gradient(135deg, #059669, #047857);
          animation: bounce-dot 1.2s infinite;
        }

        .quick-btn {
          font-size: 12px;
          padding: 7px 13px;
          border-radius: 9999px;
          border: 1.5px solid #a7f3d0;
          color: #065f46;
          background: linear-gradient(135deg, #ecfdf5, #f0fdf4);
          cursor: pointer;
          font-weight: 600;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          transition: all 0.15s;
          white-space: nowrap;
          box-shadow: 0 1px 4px rgba(5,150,105,0.1);
        }
        .quick-btn:active {
          background: #d1fae5;
          transform: scale(0.96);
        }

        .disclaimer {
          padding: 6px 16px;
          background: linear-gradient(90deg, #fffbeb, #fef9c3);
          border-top: 1px solid #fde68a;
          flex-shrink: 0;
          text-align: center;
          font-size: 10px;
          color: #92400e;
        }

        .input-area {
          padding: 10px 12px;
          background: white;
          border-top: 1px solid #f1f5f9;
          display: flex;
          gap: 8px;
          align-items: center;
          flex-shrink: 0;
          box-shadow: 0 -4px 12px rgba(0,0,0,0.04);
        }
        .chat-input {
          font-size: 16px !important;
          padding: 11px 16px;
          border-radius: 9999px;
          border: 1.5px solid #e2e8f0;
          outline: none;
          background: #f8fafc;
          flex: 1;
          -webkit-appearance: none;
          color: #1e293b;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: inherit;
        }
        .chat-input:focus {
          border-color: #059669;
          box-shadow: 0 0 0 3px rgba(5,150,105,0.12);
          background: white;
        }
        .chat-input::placeholder { color: #94a3b8; }
        .send-btn {
          width: 44px;
          height: 44px;
          min-width: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #059669, #047857);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(5,150,105,0.4);
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          transition: all 0.2s;
        }
        .send-btn:active { transform: scale(0.9); }
        .send-btn:disabled { opacity: 0.35; cursor: not-allowed; box-shadow: none; }

        .timestamp { font-size: 10px; color: #94a3b8; padding: 0 4px; margin-top: 3px; }

        .bg-pattern {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle at 20% 80%, rgba(5,150,105,0.08) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, rgba(4,120,87,0.08) 0%, transparent 50%);
          pointer-events: none;
        }
      `}</style>

      {/* Launcher */}
      {!isOpen && (
        <button className="chat-launcher" onClick={() => setIsOpen(true)} aria-label="Chat kholein">
          <Scale size={26} color="white" />
          <div className="chat-badge">1</div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">

          {/* Header */}
          <div className="chat-header">
            <div className="bg-pattern" />
            <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative", zIndex: 1 }}>
              <div style={{ position: "relative" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)" }}>
                  <Scale size={20} color="white" />
                </div>
                <div style={{ position: "absolute", bottom: 1, right: 1, width: 11, height: 11, background: "#4ade80", borderRadius: "50%", border: "2px solid white" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: "white", fontWeight: 700, fontSize: 14, margin: 0, lineHeight: 1.3, letterSpacing: "-0.2px" }}>{BUSINESS_INFO.name}</p>
                <p style={{ color: "#a7f3d0", fontSize: 11, margin: "2px 0 0", fontWeight: 500 }}>⚖️ Legal Services • Gujranwala</p>
              </div>
              <a href={"tel:" + BUSINESS_INFO.phone} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}>
                <Phone size={15} color="white" />
              </a>
              <button onClick={() => setIsOpen(false)} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer", backdropFilter: "blur(10px)", WebkitTapHighlightColor: "transparent" }}>
                <X size={15} color="white" />
              </button>
            </div>
          </div>

          {/* Announcement Ticker */}
          <div
            className={`px-4 py-2 text-center text-xs font-semibold text-white tracking-wide transition-opacity duration-400 ${announcementVisible ? "opacity-100" : "opacity-0"}`}
            style={{
              background: "linear-gradient(90deg, #ec4899, #8b5cf6, #06b6d4, #3b82f6, #a855f7, #ec4899)",
              backgroundSize: "300% 100%",
              animation: "gradient-x 5s linear infinite",
              textShadow: "0 1px 3px rgba(0,0,0,0.25)",
            }}
          >
            {ANNOUNCEMENTS[announcementIndex]}
          </div>

          {/* Messages */}
          <div className="messages-area">
            {messages.map(msg => (
              <div key={msg.id} className={"msg-row " + (msg.role === "user" ? "msg-row-user" : "")}>
                {msg.role === "assistant" && (
                  <div className="msg-avatar">
                    <Scale size={14} color="white" />
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  <div className={msg.role === "user" ? "msg-bubble-user" : "msg-bubble-bot"}>
                    {msg.content}
                  </div>
                  <span className="timestamp">{ft(msg.timestamp)}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="msg-row">
                <div className="msg-avatar"><Scale size={14} color="white" /></div>
                <div className="typing-bubble">
                  <div className="dot" style={{ animationDelay: "0ms" }} />
                  <div className="dot" style={{ animationDelay: "150ms" }} />
                  <div className="dot" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Replies */}
          {messages.length <= 1 && (
            <div style={{ padding: "8px 14px 10px", display: "flex", flexWrap: "wrap", gap: 7, flexShrink: 0, background: "linear-gradient(180deg, #f0fdf4, #f8fafc)", borderTop: "1px solid #e2e8f0" }}>
              <p style={{ width: "100%", fontSize: 10, color: "#64748b", margin: "0 0 4px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Common Questions</p>
              {QUICK.map(q => (
                <button key={q} className="quick-btn" onClick={() => send(q)}>{q}</button>
              ))}
            </div>
          )}

          {/* Disclaimer */}
          <div className="disclaimer">
            ⚠️ یہ عام معلومات ہے — قانونی مشورہ نہیں۔ اپنے کیس کے لیے دفتر میں ملیں۔
          </div>

          {/* Input */}
          <div className="input-area">
            <input
              ref={inputRef}
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input) } }}
              placeholder="Apna sawaal likhein..."
              disabled={isTyping}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <button className="send-btn" onClick={() => send(input)} disabled={!input.trim() || isTyping}>
              <Send size={17} color="white" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
