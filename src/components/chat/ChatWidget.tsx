"use client"

import { useState, useRef, useEffect } from "react"
import { BUSINESS_INFO } from "@/lib/data/faq"
import { Send, MessageCircle, X, Phone } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content: "Assalam o Alaikum! 👋\n\nMain AL-NOOR Legal Services ka AI assistant hoon.\n\nFees, timing, documents — kuch bhi poochein!",
  timestamp: new Date()
}

const QUICK = ["Fee kya hai?", "Office timing?", "Rent agreement?", "Free consultation?"]

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId] = useState(() => `sess_${Math.random().toString(36).slice(2)}_${Date.now()}`)
  const [isMobile, setIsMobile] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200)
      if (isMobile) document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [isOpen, isMobile])

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
        id: (Date.now()+1).toString(),
        role: "assistant",
        content: res.status === 429 ? (data.error || "Limit ho gayi. Call karein: " + BUSINESS_INFO.phone) : (data.response || "Jawab nahi mila."),
        timestamp: new Date()
      }])
    } catch {
      setMessages(p => [...p, { id: (Date.now()+1).toString(), role: "assistant", content: "Network masla. Call karein: " + BUSINESS_INFO.phone, timestamp: new Date() }])
    } finally {
      setIsTyping(false)
    }
  }

  const ft = (d: Date) => d.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })

  const windowStyle = isMobile ? {
    position: "fixed" as const,
    inset: 0,
    width: "100%",
    height: "100%",
    maxWidth: "100%",
    maxHeight: "100%",
    bottom: 0,
    right: 0,
    borderRadius: 0,
    zIndex: 9999,
  } : {
    position: "fixed" as const,
    bottom: "5.5rem",
    right: "1.25rem",
    width: 370,
    height: 560,
    maxWidth: "calc(100vw - 2rem)",
    maxHeight: "calc(100vh - 8rem)",
    borderRadius: "1rem",
    zIndex: 9999,
  }

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
          style={{ background: "linear-gradient(135deg, #059669, #047857)", zIndex: 9998 }}
        >
          <MessageCircle size={24} color="white" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        </button>
      )}

      {isOpen && (
        <div
          style={{
            ...windowStyle,
            background: "#f9fafb",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{ background: "linear-gradient(135deg, #059669, #047857)" }}
            className="px-4 py-3 flex items-center gap-3 shrink-0"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white/30 shrink-0 bg-white/20">
              <span className="text-white font-bold text-sm">AN</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-tight truncate">{BUSINESS_INFO.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                <p className="text-green-100 text-xs">Online — ابھی جواب دیں گے</p>
              </div>
            </div>
            <a
              href={"tel:" + BUSINESS_INFO.phone}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors shrink-0"
            >
              <Phone size={16} color="white" />
            </a>
            <button
              onClick={() => setIsOpen(false)}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors shrink-0"
            >
              <X size={16} color="white" />
            </button>
          </div>

          <div
            className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {messages.map(msg => (
              <div key={msg.id} className={"flex gap-2 " + (msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                {msg.role === "assistant" && (
                  <div
                    className="w-8 h-8 rounded-full shrink-0 mt-1 flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: "linear-gradient(135deg, #059669, #047857)", minWidth: 32 }}
                  >AN</div>
                )}
                <div className={"flex flex-col gap-1 " + (msg.role === "user" ? "items-end" : "items-start")} style={{ maxWidth: "78%" }}>
                  <div
                    className={"px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line shadow-sm " + (msg.role === "user" ? "text-white" : "bg-white text-gray-800 border border-gray-100")}
                    style={{
                      borderRadius: msg.role === "user" ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
                      ...(msg.role === "user" ? { background: "linear-gradient(135deg, #059669, #047857)" } : {})
                    }}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-gray-400 px-1">{ft(msg.timestamp)}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold" style={{ background: "linear-gradient(135deg, #059669, #047857)", minWidth: 32 }}>AN</div>
                <div className="bg-white border border-gray-100 px-4 py-3 flex gap-1.5 items-center shadow-sm" style={{ borderRadius: "4px 18px 18px 18px" }}>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2 shrink-0">
              {QUICK.map(q => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-xs px-3 py-2 rounded-full border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 transition-colors font-medium"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="px-4 py-1.5 bg-amber-50 border-t border-amber-100 shrink-0">
            <p className="text-[10px] text-amber-600 text-center">
              ⚠️ یہ عام معلومات ہے — قانونی مشورہ نہیں
            </p>
          </div>

          <div className="px-3 py-3 bg-white border-t border-gray-100 flex gap-2 items-center shrink-0">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input) } }}
              placeholder="Apna sawaal likhein..."
              disabled={isTyping}
              className="flex-1 text-sm px-4 py-3 rounded-full border border-gray-200 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-gray-50 disabled:opacity-50"
              style={{ fontSize: 16 }}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || isTyping}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-40 shrink-0"
              style={{ background: "linear-gradient(135deg, #059669, #047857)", minWidth: 44 }}
            >
              <Send size={16} color="white" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
