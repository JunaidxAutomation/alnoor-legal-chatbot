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
  const ns = {
    count: 0, createdAt: now, lang: "english",
    stage: "normal", name: "", phone: "", interest: "",
    msgs: [] as { role: string; content: string }[]
  }
  sessions.set(id, ns)
  return ns
}

function detectLang(text: string): string {
  if (/[\u0600-\u06FF]/.test(text)) return "urdu"
  if (/\b(hai|hain|kya|ka|ki|ko|se|mein|pe|aur|nahi|chahiye|kitna|kab|hoga|theek|bilkul|zaroor|shukriya|assalam)\b/i.test(text)) return "roman"
  return "english"
}

function isYes(text: string): boolean {
  return /^(h|y|ha|ok|ji|haa)$|haan|han|yes|yep|okay|theek|zaroor|bilkul|sure|ready|confirm|ji\b|agree|done|proceed/i.test(text.trim())
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

function isOfficeOpen(): boolean {
  const pk = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi" }))
  return pk.getDay() !== 0 && pk.getHours() >= 9 && pk.getHours() < 18
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
  const langRule = lang === "urdu"
    ? "CRITICAL: Respond ONLY in Pakistani Urdu script. Do NOT use Hindi words."
    : lang === "roman"
    ? "CRITICAL: Respond ONLY in Roman Urdu."
    : "CRITICAL: Respond ONLY in English. Professional tone."
  return `You are a professional AI assistant for ${BUSINESS_INFO.name}, ${BUSINESS_INFO.location}, Pakistan.
${langRule}
Phone: ${BUSINESS_INFO.phone} | Hours: ${BUSINESS_INFO.timing}
Services: ${BUSINESS_INFO.speciality}

FAQ:
${faqs}

RULES: Only answer about this office. Never give legal advice. Keep answers 2-3 lines. Unknown → give phone: ${BUSINESS_INFO.phone}`
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

async function sendToN8N(data: { name: string; phone: string; interest: string; time: string }) {
  try {
    if (!process.env.N8N_WEBHOOK_URL) return
    await fetch(process.env.N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
  } catch (err) {
    console.error("N8N failed:", err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json()
    if (!message?.trim() || !sessionId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const session = getSession(sessionId)
    if (session.count >= 20) {
      return NextResponse.json({ error: `Limit ho gayi. Call karein: ${BUSINESS_INFO.phone}` }, { status: 429 })
    }
    session.count++

    const lang = detectLang(message)
    if (lang !== "roman") session.lang = lang

    await new Promise(r => setTimeout(r, 400 + Math.random() * 500))

    // Business hours — first message
    if (session.count === 1 && !isOfficeOpen()) {
      return NextResponse.json({
        response: session.lang === "urdu"
          ? `السلام علیکم! 😊\n\nابھی دفتر بند ہے۔\n🕐 ${BUSINESS_INFO.timing}\n\nمیں آپ کے سوالوں کا جواب دے سکتا ہوں!`
          : session.lang === "roman"
          ? `Assalam o Alaikum! 😊\n\nAbhi office band hai.\n🕐 ${BUSINESS_INFO.timing}\n\nMain aap ke sawaalon ka jawab de sakta hoon!`
          : `Hello! 😊\n\nOffice is currently closed.\n🕐 ${BUSINESS_INFO.timing}\n\nI can still answer your questions!`
      })
    }

    // Stage: collecting name
    if (session.stage === "collecting_name") {
      if (message.trim().length < 2) {
        return NextResponse.json({
          response: session.lang === "urdu" ? "براہ کرم اپنا نام لکھیں:" : "Please apna naam likhein:"
        })
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
          ? `آخری تصدیق:\n\n👤 نام: ${session.name}\n📞 نمبر: ${session.phone}\n💼 مطلب: ${session.interest}\n\nکیا یہ درست ہے؟\n\n✅ جی ہاں\n❌ نہیں`
          : session.lang === "roman"
          ? `Last confirmation:\n\n👤 Naam: ${session.name}\n📞 Number: ${session.phone}\n💬 Interest: ${session.interest}\n\nKya yeh sahi hai?\n\n✅ Haan\n❌ Nahi`
          : `Final confirmation:\n\n👤 Name: ${session.name}\n📞 Number: ${session.phone}\n💬 Interest: ${session.interest}\n\nIs this correct?\n\n✅ Yes\n❌ No`
      })
    }

    // Stage: confirm2
    if (session.stage === "confirm2") {
      if (isYes(message)) {
        session.stage = "done"
        const time = new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" })
        leads.push({ name: session.name, phone: session.phone, interest: session.interest, time })
        console.log("🔔 NEW LEAD:", session.name, session.phone)

        // N8N notification
        await sendToN8N({ name: session.name, phone: session.phone, interest: session.interest, time })

        // PDF send — background
        fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-pdf`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: session.name, phone: session.phone, interest: session.interest, time })
        }).catch(err => console.error("PDF failed:", err))

        return NextResponse.json({
          response: session.lang === "urdu"
            ? `⏳ شکریہ ${session.name}!\n\nآپ کی details موصول ہو گئی ہیں۔\n\n📋 Status: *Pending*\n\nہمارا staff جلد آپ سے رابطہ کرے گا۔\n\n📞 ${BUSINESS_INFO.phone}\n🕐 ${BUSINESS_INFO.timing}`
            : session.lang === "roman"
            ? `⏳ Shukriya ${session.name}!\n\nAapki details mil gayi hain.\n\n📋 Status: *Pending*\n\nHamara staff jald rabta karega.\n\n📞 ${BUSINESS_INFO.phone}\n🕐 ${BUSINESS_INFO.timing}`
            : `⏳ Thank you ${session.name}!\n\nYour details received.\n\n📋 Status: *Pending*\n\nOur staff will contact you shortly.\n\n📞 ${BUSINESS_INFO.phone}\n🕐 ${BUSINESS_INFO.timing}`
        })
      }
      if (isNo(message)) {
        session.stage = "normal"
        return NextResponse.json({
          response: session.lang === "urdu" ? "ٹھیک ہے! کوئی اور سوال؟ 😊" : "Theek hai! Koi aur sawaal? 😊"
        })
      }
      return NextResponse.json({
        response: session.lang === "urdu" ? "✅ جی ہاں\n❌ نہیں" : "✅ Haan\n❌ Nahi"
      })
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

    // Normal stage
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

    // FAQ match
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