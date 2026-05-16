import { NextRequest, NextResponse } from "next/server"
import { FAQ_DATA, BUSINESS_INFO } from "@/lib/data/faq"

const sessionStore = new Map<string, { count: number; createdAt: number }>()

function checkRateLimit(sessionId: string) {
  const MAX = parseInt(process.env.MAX_MESSAGES_PER_SESSION || "10")
  const now = Date.now()
  const session = sessionStore.get(sessionId)
  if (!session) { sessionStore.set(sessionId, { count: 0, createdAt: now }); return { allowed: true } }
  if ((now - session.createdAt) > 86400000) { sessionStore.delete(sessionId); return { allowed: true } }
  if (session.count >= MAX) return { allowed: false, reason: `Session limit. Call karein: ${BUSINESS_INFO.phone}` }
  return { allowed: true }
}

function getAnswer(query: string): string {
  const q = query.toLowerCase()
  const keywords: [string[], string][] = [
    [["rent","kiraya","kira"], "Rent agreement Rs. 1,500 mein banta hai — 1-2 din mein ready. 📋"],
    [["contract","fee","paisa","price","kharcha","kitne","kitna","charges"], "Basic contract Rs. 2,000 — Property agreement Rs. 5,000 — Rent agreement Rs. 1,500. 💰"],
    [["time","waqt","din","der","kitni dair"], "Simple contract 1-2 din — Complex agreement 3-5 din mein ready. ⏰"],
    [["document","kagaz","cnic","papers","kya chahiye"], "CNIC copy dono parties ki + property papers (agar property case ho) + contact details. 📎"],
    [["timing","office","kab","when","schedule","hours"], "Monday se Saturday, subah 9 baje se shaam 6 baje tak. Sunday band. 🕐"],
    [["online","whatsapp","call","phone"], "Haan! WhatsApp pe consultation possible hai. 0300-1234567 pe message karein. 📱"],
    [["free","consultation","pehli","first"], "Haan, pehli meeting bilkul free hai! Call karein: 0300-1234567 ✅"],
    [["sale deed","deed","sale"], "Agreement ek promise hai — Sale Deed registered legal transfer hai. 🏠"],
    [["property","zameen","plot","ghar"], "Property agreement Rs. 5,000 mein banta hai — 3-5 din mein ready. 🏠"],
  ]
  for (const [keys, answer] of keywords) {
    if (keys.some(k => q.includes(k))) return answer
  }
  for (const faq of FAQ_DATA) {
    const words = faq.question.toLowerCase().split(/\s+/).filter(w => w.length > 3)
    if (words.filter(w => q.includes(w)).length >= 2) return faq.answer
  }
  return `Is sawaal ke liye seedha rabta karein:\n\n📞 ${BUSINESS_INFO.phone}\n🕐 ${BUSINESS_INFO.timing}\n\nHum khushi se madad karein ge!`
}

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json()
    if (!message || !sessionId) return NextResponse.json({ error: "Required fields missing" }, { status: 400 })
    const rateCheck = checkRateLimit(sessionId)
    if (!rateCheck.allowed) return NextResponse.json({ error: rateCheck.reason }, { status: 429 })
    await new Promise(r => setTimeout(r, 600 + Math.random() * 600))
    const session = sessionStore.get(sessionId)
    if (session) session.count++
    return NextResponse.json({ response: getAnswer(message) })
  } catch {
    return NextResponse.json({ response: `Technical masla. Call karein: ${BUSINESS_INFO.phone}` })
  }
}
