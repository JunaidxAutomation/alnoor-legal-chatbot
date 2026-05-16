"use client"

import { useState, useRef, useEffect } from "react"
import { FAQ_DATA, BUSINESS_INFO } from "@/lib/data/faq"
import { Send, MessageCircle, X, Phone } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

function findFaqAnswer(query: string): string | null {
  const q = query.toLowerCase().replace(/[?،۔\.]/g, "").trim()
  
  const keywordMap: Record<string, string> = {
    "rent": "Rent agreement Rs. 1,500 mein banta hai — 1-2 din mein ready ho jata hai. 📋",
    "reny": "Rent agreement Rs. 1,500 mein banta hai — 1-2 din mein ready ho jata hai. 📋",
    "kiraya": "Rent agreement Rs. 1,500 mein banta hai — 1-2 din mein ready ho jata hai. 📋",
    "contract": "Basic contract Rs. 2,000 — Property agreement Rs. 5,000 — Rent agreement Rs. 1,500. 📄",
    "fee": "Basic contract Rs. 2,000 — Property agreement Rs. 5,000 — Rent agreement Rs. 1,500. 💰",
    "faiz": "Basic contract Rs. 2,000 — Property agreement Rs. 5,000 — Rent agreement Rs. 1,500. 💰",
    "paisa": "Basic contract Rs. 2,000 — Property agreement Rs. 5,000 — Rent agreement Rs. 1,500. 💰",
    "price": "Basic contract Rs. 2,000 — Property agreement Rs. 5,000 — Rent agreement Rs. 1,500. 💰",
    "time": "Simple contract 1-2 din — Complex agreement 3-5 din mein ready hota hai. ⏰",
    "waqt": "Simple contract 1-2 din — Complex agreement 3-5 din mein ready hota hai. ⏰",
    "din": "Simple contract 1-2 din — Complex agreement 3-5 din mein ready hota hai. ⏰",
    "document": "CNIC copy dono parties ki, property papers (agar property case hai), aur contact details chahiye. 📎",
    "kagaz": "CNIC copy dono parties ki, property papers (agar property case hai), aur contact details chahiye. 📎",
    "cnic": "CNIC copy dono parties ki, property papers (agar property case hai), aur contact details chahiye. 📎",
    "timing": "Monday se Saturday, subah 9 baje se shaam 6 baje tak. Sunday band. 🕐",
    "time": "Monday se Saturday, subah 9 baje se shaam 6 baje tak. Sunday band. 🕐",
    "office": "Monday se Saturday, subah 9 baje se shaam 6 baje tak. Sunday band. 🕐",
    "kab": "Monday se Saturday, subah 9 baje se shaam 6 baje tak. Sunday band. 🕐",
    "online": "Haan! WhatsApp pe consultation possible hai. 0300-1234567 pe message karein. 📱",
    "whatsapp": "Haan! WhatsApp pe consultation possible hai. 0300-1234567 pe message karein. 📱",
    "call": "Zaroor! Call karein: 0300-1234567 — Monday-Saturday, 9am-6pm. 📞",
    "consult": "Pehli consultation bilkul free hai! Call karein: 0300-1234567 📞",
    "free": "Haan, pehli meeting bilkul free hai! Appointment ke liye call karein: 0300-1234567 ✅",
    "sale": "Agreement ek promise hai — Sale Deed legal property transfer hai. Sale Deed registered hoti hai. 🏠",
    "deed": "Sale Deed property ka legal transfer document hai — registered hoti hai court mein. 🏠",
    "property": "Property agreement Rs. 5,000 mein banta hai — 3-5 din mein ready. 🏠",
    "zameen": "Property agreement Rs. 5,000 mein banta hai — 3-5 din mein ready. 🏠",
  }

  for (const [key, answer] of Object.entries(keywordMap)) {
    if (q.includes(key)) return answer
  }

  for (const faq of FAQ_DATA) {
    const words = faq.question.toLowerCase().split(/[\s,?]+/).filter(w => w.length > 3)
    const matches = words.filter(w => q.includes(w))
    if (matches.length >= 2) return faq.answer
  }

  return null
}

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content: "Assalam o Alaikum! 👋\n\nMain AL-NOOR Legal Services ka AI assistant hoon.\n\nContracts, agreements, aur property documents ke baare mein pooch sakte hain.\n\nKya madad kar sakta hoon?",
  timestamp: new Date()
}

const QUICK = ["Fee kya hai?", "Kitna time lagega?", "Office timing?", "Free consultation?"]

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 150)
  }, [isOpen])

  async function send(text: string) {
    const t = text.trim()
    if (!t || isTyping) return
    setMessages(p => [...p, { id: Date.now().toString(), role: "user", content: t, timestamp: new Date() }])
    setInput("")
    setIsTyping(true)
    await new Promise(r => setTimeout(r, 800 + Math.random() * 700))
    const answer = findFaqAnswer(t) ?? `Is sawaal ke liye seedha rabta karein:\n\n📞 ${BUSINESS_INFO.phone}\n🕐 ${BUSINESS_INFO.timing}\n\nHum khushi se madad karein ge!`
    setIsTyping(false)
    setMessages(p => [...p, { id: (Date.now()+1).toString(), role: "assistant", content: answer, timestamp: new Date() }])
  }

  const ft = (d: Date) => d.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        style={{ background: "linear-gradient(135deg, #059669, #047857)" }}
      >
        <div className="transition-transform duration-300" style={{ transform: isOpen ? "rotate(0deg)" : "rotate(0deg)" }}>
          {isOpen ? <X size={22} color="white" /> : <MessageCircle size={22} color="white" />}
        </div>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {/* Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-5 z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-gray-200"
          style={{ width: 360, maxWidth: "calc(100vw - 2rem)", height: 540, maxHeight: "calc(100vh - 7rem)", background: "#f9fafb" }}
        >
          {/* Header */}
          <div style={{ background: "linear-gradient(135deg, #059669, #047857)" }} className="px-4 py-3 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30 shrink-0">
              <span className="text-white font-bold text-sm">AN</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-tight">{BUSINESS_INFO.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                <p className="text-emerald-100 text-xs">Online — ابھی جواب دیں گے</p>
              </div>
            </div>
            <a href={"tel:" + BUSINESS_INFO.phone} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors shrink-0">
              <Phone size={15} color="white" />
            </a>
            <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors shrink-0">
              <X size={15} color="white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3" style={{ scrollBehavior: "smooth" }}>
            {messages.map(msg => (
              <div key={msg.id} className={"flex gap-2 " + (msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full shrink-0 mt-1 flex items-center justify-center text-white text-xs font-bold" style={{ background: "linear-gradient(135deg, #059669, #047857)" }}>
                    AN
                  </div>
                )}
                <div className={"flex flex-col gap-1 max-w-[78%] " + (msg.role === "user" ? "items-end" : "items-start")}>
                  <div
                    className={"px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-sm " + (
                      msg.role === "user"
                        ? "text-white rounded-tr-sm"
                        : "bg-white text-gray-800 rounded-tl-sm border border-gray-100"
                    )}
                    style={msg.role === "user" ? { background: "linear-gradient(135deg, #059669, #047857)" } : {}}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-gray-400 px-1">{ft(msg.timestamp)}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold" style={{ background: "linear-gradient(135deg, #059669, #047857)" }}>
                  AN
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center shadow-sm">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
              {QUICK.map(q => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-xs px-3 py-1.5 rounded-full border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors font-medium"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Disclaimer */}
          <div className="px-4 py-1.5 bg-amber-50 border-t border-amber-100 shrink-0">
            <p className="text-[10px] text-amber-600 text-center">⚠️ یہ عام معلومات ہے — قانونی مشورہ نہیں۔ اپنے کیس کے لیے دفتر میں ملیں۔</p>
          </div>

          {/* Input */}
          <div className="px-3 py-3 bg-white border-t border-gray-100 flex gap-2 items-center shrink-0">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input) } }}
              placeholder="Apna sawaal likhein..."
              disabled={isTyping}
              className="flex-1 text-sm px-4 py-2.5 rounded-full border border-gray-200 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all bg-gray-50 disabled:opacity-50"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || isTyping}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              style={{ background: "linear-gradient(135deg, #059669, #047857)" }}
            >
              <Send size={15} color="white" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
