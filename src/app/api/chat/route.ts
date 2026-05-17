import { NextRequest, NextResponse } from "next/server"
import { FAQ_DATA, BUSINESS_INFO } from "@/lib/data/faq"
import Groq from "groq-sdk"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const sessions = new Map<string, {
  count: number
  createdAt: number
  lang: string
  stage: string
  name: string
  phone: string
  interest: string
  msgs: { role: string; content: string }[]
}>()

const leads: { name: string; phone: string; interest: string; time: string }[] = []

function getSession(id: string) {
  const now = Date.now()
  const s = sessions.get(id)
  if (s && now - s.createdAt < 86400000) return s
  const ns = { count: 0, createdAt: now, lang: "roman", stage: "normal", name: "", phone: "", interest: "", msgs: [] as { role: string; content: string }[] }
  sessions.set(id, ns)
  return ns
}

function detectLang(text: string): string {
  if (/[\u0600-\u06FF]/.test(text)) return "urdu"
  if (/\b(hai|hain|kya|ka|ki|ko|se|mein|pe|aur|nahi|chahiye|kitna|kab|hoga|theek|bilkul|zaroor|shukriya|assalam)\b/i.test(text)) return "roman"
  return "english"
}

function isYes(text: string): boolean {
  return /^(h|y|ha|ok|ji|haa)$|haan|han|yes|yep|okay|theek|zaroor|bilkul|sure|ready|confirm|ji\b|agree|done|proceed|bhejo/i.test(text.trim())
}

function isNo(text: string): boolean {
  return /nahi|nhi|no|nope|na\b|mat|cancel|stop/i.test(text)
}

function isValidPhone(phone: string): boolean {
  return /^[0-9\+\-\s]{10,14}$/.test(phone.trim())
}

function hasAppointmentIntent(text: string): boolean {
  return /consult|appointment|milna|banana|banwana|book|meeting|visit|chahiye|zaroor|bilkul|ready|rabta|contact/i.test(text)
}

function detectSpam(text: string): boolean {
  if (text.length > 500) return true
  if (/^[^a-zA-Z\u0600-\u06FF0-9\s]{3,}$/.test(text)) return true
  return false
}

function isOfficeOpen(): boolean {
  const pk = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi" }))
  const day = pk.getDay()
  const hour = pk.getHours()
  return day !== 0 && hour >= 9 && hour < 18
}

function getSchedule(lang: string): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
  const day = d.getDay() === 0 ? "Monday" : days[d.getDay()]
  if (lang === "urdu") return `📅 **${day} صبح 10 بجے**\n📅 **${day} شام 4 بجے**\n\nکونسا وقت مناسب ہے؟`
  if (lang === "roman") return `📅 **${day} subah 10 AM**\n📅 **${day} shaam 4 PM**\n\nKaunsa time suit karega?`
  return `📅 **${day} 10:00 AM**\n📅 **${day} 4:00 PM**\n\nWhich time works?`
}

function quickFaq(query: string): string | null {
  const q = query.toLowerCase()
  for (const faq of FAQ_DATA) {
    const words = faq.question.toLowerCase().split(/\s+/).filter(w => w.length > 3)
    const matched = words.filter(w => q.includes(w)).length
    if (words.length > 0 && matched / words.length >= 0.6) return faq.answer
  }
  return null
}

function getSystemPrompt(lang: string): string {
  const faqs = FAQ_DATA.map((f, i) => `${i+1}. Q: ${f.question}\n   A: ${f.answer}`).join("\n\n")
  const langRule = lang === "urdu" ? "ALWAYS respond in Urdu script only." : lang === "roman" ? "ALWAYS respond in Roman Urdu only." : "ALWAYS respond in English only."
  return `You are a professional AI assistant for ${BUSINESS_INFO.name}, ${BUSINESS_INFO.location}, Pakistan.
${langRule}
Phone: ${BUSINESS_INFO.phone} | Hours: ${BUSINESS_INFO.timing}
Services: ${BUSINESS_INFO.speciality}

FAQ KNOWLEDGE:
${faqs}

RULES: Only answer about this office. Never give legal advice. Keep answers 2-3 lines. Unknown questions → give phone number: ${BUSINESS_INFO.phone}`
}

async function getAI(message: string, session: ReturnType<typeof getSession>): Promise<string> {
  try {
    session.msgs.push({ role: "user", content: message })
    const res = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: getSystemPrompt(session.lang) },
        ...session.msgs.slice(-6).map(m => ({ role: m.role as "user" | "assistant", content: m.content }))
      ],
      max_tokens: 300,
      temperature: 0.7
    })
    const reply = res.choices[0]?.message?.content || `Call karein: ${BUSINESS_INFO.phone}`
    session.msgs.push({ role: "assistant", content: reply })
    return reply
  } catch {
    return `Maafi — technical masla. Call karein: ${BUSINESS_INFO.phone}`
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json()
    if (!message?.trim() || !sessionId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const session = getSession(sessionId)
    const MAX = 20
    if (session.count >= MAX) {
      return NextResponse.json({ error: `Limit ho gayi. Call karein: ${BUSINESS_INFO.phone}` }, { status: 429 })
    }
    session.count++

    const lang = detectLang(message)
    if (lang !== "roman") session.lang = lang

    await new Promise(r => setTimeout(r, 400 + Math.random() * 500))

    // Spam check
    if (detectSpam(message)) {
      return NextResponse.json({ response: `Maafi — samajh nahi aaya. Call karein: ${BUSINESS_INFO.phone}` })
    }

    // Business hours — first message only
    if (session.count === 1 && false) {
      const closed = session.lang === "urdu"
        ? `السلام علیکم! 😊\n\nابھی دفتر بند ہے۔\n🕐 ${BUSINESS_INFO.timing}\n\nمیں آپ کے سوالوں کا جواب دے سکتا ہوں — پوچھیں!`
        : session.lang === "roman"
        ? `Assalam o Alaikum! 😊\n\nAbhi office band hai.\n🕐 ${BUSINESS_INFO.timing}\n\nMain aap ke sawaalon ka jawab de sakta hoon — poochein!`
        : `Hello! 😊\n\nOffice is currently closed.\n🕐 ${BUSINESS_INFO.timing}\n\nI can still answer your questions!`
      return NextResponse.json({ response: closed })
    }

    // Stage: collecting name
    if (session.stage === "collecting_name") {
      if (message.trim().length < 2) {
        return NextResponse.json({ response: session.lang === "urdu" ? "براہ کرم اپنا نام لکھیں:" : "Please apna naam likhein:" })
      }
      session.name = message.trim()
      session.stage = "collecting_phone"
      return NextResponse.json({
        response: session.lang === "urdu"
          ? `شکریہ ${session.name}! 😊\n\nاب اپنا فون نمبر دیجیے:`
          : session.lang === "roman"
          ? `Shukriya ${session.name}! 😊\n\nAb apna phone number dijiye:`
          : `Thank you ${session.name}! 😊\n\nPlease share your phone number:`
      })
    }

    // Stage: collecting phone
    if (session.stage === "collecting_phone") {
      if (!isValidPhone(message)) {
        return NextResponse.json({
          response: session.lang === "urdu"
            ? "درست نمبر لکھیں (مثلاً: 0300-1234567):"
            : "Valid number likhein (example: 0300-1234567):"
        })
      }
      session.phone = message.trim()
      session.stage = "confirm2"
      return NextResponse.json({
        response: session.lang === "urdu"
          ? `آخری تصدیق:\n\n👤 نام: ${session.name}\n📞 نمبر: ${session.phone}\n💬 مطلب: ${session.interest}\n\nکیا یہ درست ہے؟\n\n✅ جی ہاں\n❌ نہیں`
          : session.lang === "roman"
          ? `Last confirmation:\n\n👤 Naam: ${session.name}\n📞 Number: ${session.phone}\n💬 Interest: ${session.interest}\n\nKya yeh sahi hai?\n\n✅ Haan\n❌ Nahi`
          : `Final confirmation:\n\n👤 Name: ${session.name}\n📞 Number: ${session.phone}\n💬 Interest: ${session.interest}\n\nIs this correct?\n\n✅ Yes\n❌ No`
      })
    }

    // Stage: confirm2
    if (session.stage === "confirm2") {
      if (isYes(message)) {
        session.stage = "done"
        leads.push({ name: session.name, phone: session.phone, interest: session.interest, time: new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" }) })
        console.log("🔔 NEW LEAD:", session.name, session.phone)
        return NextResponse.json({
          response: session.lang === "urdu"
            ? `✅ شکریہ ${session.name}!\n\nآپ کی درخواست موصول ہو گئی۔\n\n${getSchedule(session.lang)}\n\n📞 ${BUSINESS_INFO.phone}\n\nجلد رابطہ ہوگا۔ 🙏`
            : session.lang === "roman"
            ? `✅ Shukriya ${session.name}!\n\nAapki request mil gayi.\n\n${getSchedule(session.lang)}\n\n📞 ${BUSINESS_INFO.phone}\n\nJald rabta hoga. 🙏`
            : `✅ Thank you ${session.name}!\n\nRequest received.\n\n${getSchedule(session.lang)}\n\n📞 ${BUSINESS_INFO.phone}\n\nWe'll contact you soon. 🙏`
        })
      }
      if (isNo(message)) {
        session.stage = "normal"
        return NextResponse.json({ response: session.lang === "urdu" ? "ٹھیک ہے! کوئی اور سوال؟ 😊" : "Theek hai! Koi aur sawaal? 😊" })
      }
      return NextResponse.json({ response: session.lang === "urdu" ? "✅ جی ہاں\n❌ نہیں" : "✅ Haan\n❌ Nahi" })
    }

    // Stage: confirm1
    if (session.stage === "confirm1") {
      if (isYes(message)) {
        session.stage = "collecting_name"
        return NextResponse.json({
          response: session.lang === "urdu" ? "بہت اچھا! 😊\n\nآپ کا نام کیا ہے؟"
            : session.lang === "roman" ? "Bohat acha! 😊\n\nAapka naam kya hai?"
            : "Great! 😊\n\nWhat is your name?"
        })
      }
      if (isNo(message)) {
        session.stage = "normal"
        return NextResponse.json({
          response: session.lang === "urdu" ? "ٹھیک ہے! کوئی بھی سوال پوچھیں۔ 😊"
            : session.lang === "roman" ? "Theek hai! Koi bhi sawaal poochh sakte hain. 😊"
            : "No problem! Ask me anything. 😊"
        })
      }
      return NextResponse.json({
        response: session.lang === "urdu"
          ? "✅ جی ہاں — اپائنٹمنٹ چاہیے\n❌ نہیں — صرف معلومات"
          : "✅ Haan — appointment chahiye\n❌ Nahi — sirf information"
      })
    }

    // Normal stage — check appointment intent FIRST
    if (session.stage === "normal" && hasAppointmentIntent(message)) {
      session.stage = "confirm1"
      session.interest = message.slice(0, 100)
      return NextResponse.json({
        response: session.lang === "urdu"
          ? "آپ کی بات سمجھ آئی۔ 😊\n\nکیا آپ واقعی اپائنٹمنٹ لینا چاہتے ہیں — یا ابھی صرف معلومات؟\n\n✅ جی ہاں — اپائنٹمنٹ\n📖 نہیں — صرف معلومات"
          : session.lang === "roman"
          ? "Aapki baat samajh aa gayi. 😊\n\nKya aap WAQAI appointment lena chahte hain — ya sirf information?\n\n✅ Haan — appointment chahiye\n📖 Nahi — sirf information"
          : "I understand. 😊\n\nDo you ACTUALLY want to book — or just browsing?\n\n✅ Yes — book appointment\n📖 No — just information"
      })
    }

    // FAQ quick match
    const faqAnswer = quickFaq(message)
    if (faqAnswer) return NextResponse.json({ response: faqAnswer })

    // Groq AI
    const aiResponse = await getAI(message, session)
    return NextResponse.json({ response: aiResponse })

  } catch (err) {
    console.error("Error:", err)
    return NextResponse.json({ response: `Maafi — masla aa gaya. Call karein: ${BUSINESS_INFO.phone}` })
  }
}

export async function GET() {
  return NextResponse.json({ total: leads.length, leads })
}