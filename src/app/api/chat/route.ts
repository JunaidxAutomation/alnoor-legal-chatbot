import { NextRequest, NextResponse } from "next/server"
import { FAQ_DATA, BUSINESS_INFO } from "@/lib/data/faq"
import Groq from "groq-sdk"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// ═══════════════════════════════════════
// TYPES
// ═══════════════════════════════════════
type Lang = "urdu" | "roman" | "english"
type Stage = "normal" | "confirm1" | "collecting_name" | "collecting_phone" | "confirm2" | "done"
type Sentiment = "positive" | "negative" | "frustrated" | "confused" | "neutral"

interface Session {
  count: number
  createdAt: number
  lang: Lang
  stage: Stage
  sentiment: Sentiment
  userName: string
  userPhone: string
  interest: string
  lastMessage: string
  repeatCount: number
  messages: { role: "user" | "assistant"; content: string }[]
}

interface Lead {
  name: string
  phone: string
  interest: string
  time: string
  lang: Lang
}

// ═══════════════════════════════════════
// STORES
// ═══════════════════════════════════════
const sessionStore = new Map<string, Session>()
const leadsStore: Lead[] = []

// ═══════════════════════════════════════
// SESSION
// ═══════════════════════════════════════
function getSession(id: string): Session {
  const now = Date.now()
  const ex = sessionStore.get(id)
  if (ex && now - ex.createdAt < 86400000) return ex
  const s: Session = {
    count: 0, createdAt: now, lang: "roman", stage: "normal",
    sentiment: "neutral", userName: "", userPhone: "",
    interest: "", lastMessage: "", repeatCount: 0, messages: []
  }
  sessionStore.set(id, s)
  return s
}

function checkRate(s: Session): { allowed: boolean; reason?: string } {
  const MAX = parseInt(process.env.MAX_MESSAGES_PER_SESSION || "20")
  if (s.count >= MAX) return {
    allowed: false,
    reason: s.lang === "urdu"
      ? `حد ختم ہو گئی۔ کال کریں: ${BUSINESS_INFO.phone}`
      : `Limit ho gayi. Call karein: ${BUSINESS_INFO.phone}`
  }
  return { allowed: true }
}

// ═══════════════════════════════════════
// NEW: BUSINESS HOURS CHECK
// ═══════════════════════════════════════
function getBusinessHoursResponse(lang: Lang): string | null {
  const now = new Date()
  const pkTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Karachi" }))
  const hour = pkTime.getHours()
  const day = pkTime.getDay() // 0=Sunday

  const isOpen = day !== 0 && hour >= 9 && hour < 18

  if (isOpen) return null // Office khula hai — normal response

  const opensAt = day === 0
    ? "Kal (Monday) subah 9 baje"
    : hour < 9
    ? "Aaj subah 9 baje"
    : "Kal subah 9 baje"

  if (lang === "urdu") {
    return day === 0
      ? `السلام علیکم! 😊\n\nآج اتوار ہے — دفتر بند ہے۔\n\nکل پیر کو صبح 9 بجے سے کھلے گا۔\n\n📞 ابھی میسج چھوڑ دیں — کل جواب ملے گا:\n${BUSINESS_INFO.phone}\n\nمیں آپ کی مدد کر سکتا ہوں — پوچھیں! 😊`
      : hour < 9
      ? `السلام علیکم! 😊\n\nابھی دفتر بند ہے۔\n🕐 آج صبح 9 بجے کھلے گا۔\n\nمیں ابھی آپ کے سوالوں کا جواب دے سکتا ہوں۔ پوچھیں! 😊`
      : `السلام علیکم! 😊\n\nدفتر آج کے لیے بند ہو گیا ہے۔\n🕐 کل صبح 9 بجے کھلے گا۔\n\n📞 ابھی میسج چھوڑ دیں: ${BUSINESS_INFO.phone}\n\nمیں آپ کی مدد کر سکتا ہوں! 😊`
  }

  if (lang === "roman") {
    return day === 0
      ? `Assalam o Alaikum! 😊\n\nAaj Sunday hai — office band hai.\n\nKal Monday subah 9 baje se khulay ga.\n\n📞 Abhi message chhod dein — kal jawab milega:\n${BUSINESS_INFO.phone}\n\nMain aap ki madad kar sakta hoon — poochein! 😊`
      : hour < 9
      ? `Assalam o Alaikum! 😊\n\nAbhi office band hai.\n🕐 Aaj subah 9 baje khulay ga.\n\nMain abhi aap ke sawaalon ka jawab de sakta hoon. Poochein! 😊`
      : `Assalam o Alaikum! 😊\n\nOffice aaj ke liye band ho gaya.\n🕐 Kal subah 9 baje khulay ga.\n\n📞 Abhi message chhod dein: ${BUSINESS_INFO.phone}\n\nMain aap ki madad kar sakta hoon! 😊`
  }

  return day === 0
    ? `Hello! 😊\n\nToday is Sunday — office is closed.\n\nWe reopen Monday at 9:00 AM.\n\n📞 Leave a message: ${BUSINESS_INFO.phone}\n\nI can still answer your questions! 😊`
    : hour < 9
    ? `Hello! 😊\n\nOffice hasn't opened yet.\n🕐 Opens at 9:00 AM today.\n\nI can answer your questions right now! 😊`
    : `Hello! 😊\n\nOffice is closed for today.\n🕐 Reopens tomorrow at 9:00 AM.\n\n📞 Leave a message: ${BUSINESS_INFO.phone}\n\nI can still help you! 😊`
}

// ═══════════════════════════════════════
// NEW: SENTIMENT DETECTION
// ═══════════════════════════════════════
function detectSentiment(text: string): Sentiment {
  const t = text.toLowerCase()

  // Frustrated
  if (/gussa|angry|bakwas|bekar|faltu|useless|worst|terrible|horrible|بکواس|بیکار|غصہ/.test(t)) return "frustrated"

  // Confused
  if (/samajh nahi|confused|kya matlab|what do you mean|i don't understand|समझ|سمجھ نہیں/.test(t)) return "confused"

  // Positive
  if (/shukriya|thanks|thank you|bohat acha|bohat badhiya|great|excellent|perfect|شکریہ|بہت اچھا/.test(t)) return "positive"

  // Negative
  if (/nahi|no|wrong|galat|nope|bad|poor|گلط|نہیں/.test(t)) return "negative"

  return "neutral"
}

function getSentimentPrefix(sentiment: Sentiment, lang: Lang): string {
  if (sentiment === "frustrated") {
    return lang === "urdu"
      ? "معاف کریں آپ کو تکلیف ہوئی۔ 🙏 میں پوری کوشش کرتا ہوں مدد کرنے کی۔\n\n"
      : lang === "roman"
      ? "Maafi agar koi takleef hui. 🙏 Main poori koshish karta hoon madad karne ki.\n\n"
      : "I apologize for the inconvenience. 🙏 Let me help you properly.\n\n"
  }
  if (sentiment === "confused") {
    return lang === "urdu"
      ? "آسان الفاظ میں سمجھاتا ہوں۔ 😊\n\n"
      : lang === "roman"
      ? "Aasan alfaaz mein samjhata hoon. 😊\n\n"
      : "Let me explain in simpler terms. 😊\n\n"
  }
  return ""
}

// ═══════════════════════════════════════
// NEW: SPAM / ABUSE DETECTION
// ═══════════════════════════════════════
function detectSpam(message: string, session: Session): string | null {
  const t = message.trim().toLowerCase()

  // Repeated message
  if (t === session.lastMessage.toLowerCase().trim()) {
    session.repeatCount++
    if (session.repeatCount >= 2) {
      return session.lang === "urdu"
        ? `لگتا ہے آپ کو کوئی مسئلہ ہے۔ 😊\n\nبراہ کرم کال کریں:\n📞 ${BUSINESS_INFO.phone}\n🕐 ${BUSINESS_INFO.timing}`
        : session.lang === "roman"
        ? `Lagta hai koi masla hai. 😊\n\nCall karein:\n📞 ${BUSINESS_INFO.phone}\n🕐 ${BUSINESS_INFO.timing}`
        : `Seems like you're having trouble. 😊\n\nPlease call us:\n📞 ${BUSINESS_INFO.phone}\n🕐 ${BUSINESS_INFO.timing}`
    }
  } else {
    session.repeatCount = 0
    session.lastMessage = message
  }

  // Gibberish detection
  const wordCount = message.trim().split(/\s+/).length
  const hasNoMeaning = wordCount <= 3 && /^[^a-zA-Z\u0600-\u06FF0-9\s]+$/.test(message)
  if (hasNoMeaning) {
    return session.lang === "urdu"
      ? "معاف کریں، سمجھ نہیں آیا۔ کوئی سوال پوچھیں۔ 😊"
      : session.lang === "roman"
      ? "Maafi — samajh nahi aaya. Koi sawaal poochein. 😊"
      : "Sorry, I didn't understand. Please ask a question. 😊"
  }

  // Too long message
  if (message.length > 500) {
    return session.lang === "urdu"
      ? "براہ کرم مختصر سوال پوچھیں۔ میں آپ کی مدد کرتا ہوں۔ 😊"
      : session.lang === "roman"
      ? "Please mukhtasar sawaal poochein. Main madad karta hoon. 😊"
      : "Please keep your message short. I'm here to help! 😊"
  }

  return null
}

// ═══════════════════════════════════════
// LANGUAGE DETECTION
// ═══════════════════════════════════════
function detectLang(text: string): Lang {
  if (/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text)) return "urdu"
  const roman = /\b(hai|hain|kya|ka|ki|ko|se|mein|pe|aur|nahi|karo|karein|chahiye|batao|lagta|milega|banta|kitna|kab|kahan|kyun|hoga|tha|thi|woh|yeh|apna|koi|sab|sirf|abhi|phir|agar|lekin|par|toh|bhi|na|mat|bilkul|zaroor|shukriya|assalam|theek|bohat|acha|accha)\b/i
  if (roman.test(text)) return "roman"
  return "english"
}

// ═══════════════════════════════════════
// INTENT DETECTION
// ═══════════════════════════════════════
function hasInterest(text: string): boolean {
  const t = text.toLowerCase()
  return (
    /consult|appointment|milna|milein|aana|aayen|banana|banwana|book|schedule|meeting|visit|rabta|contact/i.test(t) ||
    /chahiye|ready|zaroor|bilkul|agree|confirm|send|bhejo|lena hai|leni hai/i.test(t) ||
    /[\u0600-\u06FF]*(ملنا|آنا|چاہیے|مشاورت|اپائنٹمنٹ|ضرور|بالکل|تیار|چاہتا|چاہتی)/.test(text)
  )
}

function isYes(text: string): boolean {
  const t = text.trim().toLowerCase()
  return /^(h|y|k|ha|ok|ji|haa|yep|yup)$/.test(t) ||
    /\b(haan|han|yes|yep|ok|okay|theek|zaroor|bilkul|sure|ready|confirm|ji|please|agree|done|proceed|send|bhejo)\b/i.test(t) ||
    /[\u0600-\u06FF]*(ہاں|جی|ضرور|بالکل|اوکے|ٹھیک|تیار)/.test(text)
}

function isNo(text: string): boolean {
  return /\b(nahi|nhi|naa|no|nope|na|mat|cancel|stop|never|forget|band)\b|[\u0600-\u06FF]*(نہیں|نہ|مت|نا|بند)/.test(text.toLowerCase())
}

function isValidPhone(phone: string): boolean {
  const c = phone.replace(/[\s\-\(\)]/g, "")
  return /^(\+92|0092|0)[3][0-9]{9}$/.test(c) ||
    /^0[0-9]{9,10}$/.test(c) ||
    /^\+[0-9]{10,13}$/.test(c)
}

// ═══════════════════════════════════════
// SCHEDULE GENERATOR
// ═══════════════════════════════════════
function getSchedule(lang: Lang): string {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const days = {
    en: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
    ur: ["اتوار","پیر","منگل","بدھ","جمعرات","جمعہ","ہفتہ"]
  }
  const isSun = tomorrow.getDay() === 0
  const dayEn = isSun ? "Monday" : days.en[tomorrow.getDay()]
  const dayUr = isSun ? "پیر" : days.ur[tomorrow.getDay()]

  if (lang === "urdu") return `دستیاب اوقات:\n\n📅 **${dayUr} صبح 10:00 بجے**\n📅 **${dayUr} شام 4:00 بجے**\n\nکونسا وقت مناسب رہے گا؟`
  if (lang === "roman") return `Available slots:\n\n📅 **${dayEn} subah 10:00 AM**\n📅 **${dayEn} shaam 4:00 PM**\n\nKaunsa time suit karega?`
  return `Available slots:\n\n📅 **${dayEn} 10:00 AM**\n📅 **${dayEn} 4:00 PM**\n\nWhich time works for you?`
}

// ═══════════════════════════════════════
// LAYER 0 — FAQ QUICK MATCH
// ═══════════════════════════════════════
function quickFaqMatch(query: string): string | null {
  const q = query.toLowerCase().replace(/[?،۔\.،!]/g, "").trim()
  for (const faq of FAQ_DATA) {
    const words = faq.question.toLowerCase().split(/\s+/).filter(w => w.length > 3)
    const matched = words.filter(w => q.includes(w)).length
    if (words.length > 0 && matched / words.length >= 0.6) return faq.answer
  }
  return null
}

// ═══════════════════════════════════════
// LAYER 1 — GROQ AI
// ═══════════════════════════════════════
function buildSystemPrompt(lang: Lang, sentiment: Sentiment): string {
  const faqs = FAQ_DATA.map((f, i) => `${i + 1}. Q: ${f.question}\n   A: ${f.answer}`).join("\n\n")
  const langRule = lang === "urdu"
    ? "CRITICAL: HAMESHA Urdu script mein jawab do. Roman ya English bilkul nahi."
    : lang === "roman"
    ? "CRITICAL: HAMESHA Roman Urdu mein jawab do."
    : "CRITICAL: ALWAYS respond in English only."

  const toneRule = sentiment === "frustrated"
    ? "User frustrated lag raha hai. Extra polite aur apologetic raho."
    : sentiment === "confused"
    ? "User confused lag raha hai. Bohat simple aur clear jawab do."
    : ""

  return `You are a professional AI assistant for ${BUSINESS_INFO.name}, legal office in ${BUSINESS_INFO.location}, Pakistan.

${langRule}
${toneRule}

BUSINESS INFO:
- Phone: ${BUSINESS_INFO.phone}
- Hours: ${BUSINESS_INFO.timing}
- Services: ${BUSINESS_INFO.speciality}

FAQ KNOWLEDGE BASE:
${faqs}

RULES:
1. Only answer about this law office
2. NEVER give specific legal advice
3. NEVER ask personal info (CNIC, case details)
4. Keep answers 2-4 lines only
5. Unknown → give phone: ${BUSINESS_INFO.phone}
6. Always warm, polite, professional
7. End with helpful next step`
}

async function getGroqResponse(message: string, session: Session): Promise<string> {
  try {
    session.messages.push({ role: "user", content: message })
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: buildSystemPrompt(session.lang, session.sentiment) },
        ...session.messages.slice(-8)
      ],
      max_tokens: parseInt(process.env.MAX_TOKENS_PER_MESSAGE || "300"),
      temperature: session.sentiment === "confused" ? 0.5 : 0.7,
    })
    const response = completion.choices[0]?.message?.content || getFallback(session.lang)
    session.messages.push({ role: "assistant", content: response })
    return response
  } catch (err) {
    console.error("Groq error:", err)
    return getFallback(session.lang)
  }
}

// ═══════════════════════════════════════
// LAYER 2 — STATIC FALLBACK
// ═══════════════════════════════════════
function getFallback(lang: Lang): string {
  if (lang === "urdu") return `معاف کریں، ابھی تکنیکی مسئلہ ہے۔\n\nکال کریں:\n📞 ${BUSINESS_INFO.phone}\n🕐 ${BUSINESS_INFO.timing}`
  if (lang === "roman") return `Maafi — technical masla hai.\n\nCall karein:\n📞 ${BUSINESS_INFO.phone}\n🕐 ${BUSINESS_INFO.timing}`
  return `Sorry, technical issue.\n\nCall us:\n📞 ${BUSINESS_INFO.phone}\n🕐 ${BUSINESS_INFO.timing}`
}

// ═══════════════════════════════════════
// MESSAGES
// ═══════════════════════════════════════
const M: Record<string, Record<Lang, string>> = {
  confirm1: {
    urdu: "آپ کی بات سمجھ آئی۔ 😊\n\nکیا آپ واقعی اپائنٹمنٹ لینا چاہتے ہیں — یا ابھی صرف معلومات لے رہے ہیں؟\n\n✅ جی ہاں — اپائنٹمنٹ چاہیے\n📖 نہیں — صرف معلومات",
    roman: "Aapki baat samajh aa gayi. 😊\n\nKya aap WAQAI appointment lena chahte hain — ya abhi sirf information?\n\n✅ Haan — appointment chahiye\n📖 Nahi — sirf information",
    english: "I understand. 😊\n\nDo you ACTUALLY want to book an appointment — or just browsing?\n\n✅ Yes — book appointment\n📖 No — just need info"
  },
  confirm1_again: {
    urdu: "براہ کرم واضح بتائیں:\n\n✅ جی ہاں — اپائنٹمنٹ چاہیے\n❌ نہیں — صرف معلومات",
    roman: "Please clearly batayein:\n\n✅ Haan — appointment chahiye\n❌ Nahi — sirf information",
    english: "Please clarify:\n\n✅ Yes — I want appointment\n❌ No — just information"
  },
  ask_name: {
    urdu: "بہت اچھا! 😊\n\nپہلے اپنا نام بتائیں:",
    roman: "Bohat acha! 😊\n\nPehle apna naam batayein:",
    english: "Great! 😊\n\nPlease share your name:"
  },
  invalid_name: {
    urdu: "براہ کرم اپنا پورا نام لکھیں:",
    roman: "Please apna poora naam likhein:",
    english: "Please enter your full name:"
  },
  ask_phone: {
    urdu: "شکریہ {name}! 😊\n\nاب اپنا فون نمبر دیجیے:",
    roman: "Shukriya {name}! 😊\n\nAb apna phone number dijiye:",
    english: "Thank you {name}! 😊\n\nPlease share your phone number:"
  },
  invalid_phone: {
    urdu: "درست نمبر لکھیں (مثلاً: 0300-1234567):",
    roman: "Valid number likhein (example: 0300-1234567):",
    english: "Enter a valid number (e.g., 0300-1234567):"
  },
  confirm2: {
    urdu: "آخری تصدیق:\n\n👤 نام: {name}\n📞 نمبر: {phone}\n💬 مطلب: {interest}\n\nکیا یہ درست ہے؟\n\n✅ جی ہاں — confirm\n❌ نہیں — cancel",
    roman: "Last confirmation:\n\n👤 Naam: {name}\n📞 Number: {phone}\n💬 Interest: {interest}\n\nKya yeh sahi hai?\n\n✅ Haan — confirm\n❌ Nahi — cancel",
    english: "Final confirmation:\n\n👤 Name: {name}\n📞 Number: {phone}\n💬 Interest: {interest}\n\nIs this correct?\n\n✅ Yes — confirm\n❌ No — cancel"
  },
  confirm2_unclear: {
    urdu: "✅ جی ہاں — confirm\n❌ نہیں — cancel",
    roman: "✅ Haan — confirm\n❌ Nahi — cancel",
    english: "✅ Yes — confirm\n❌ No — cancel"
  },
  confirmed: {
    urdu: "✅ شکریہ {name}!\n\nآپ کی اپائنٹمنٹ درخواست موصول ہو گئی۔\n\n{schedule}\n\n📞 خود بھی کال کر سکتے ہیں:\n{phone}\n\nجلد رابطہ کیا جائے گا۔ 🙏",
    roman: "✅ Shukriya {name}!\n\nAapki appointment request mil gayi.\n\n{schedule}\n\n📞 Khud bhi call kar sakte hain:\n{phone}\n\nJald rabta hoga. 🙏",
    english: "✅ Thank you {name}!\n\nYour appointment request is received.\n\n{schedule}\n\n📞 You can also call directly:\n{phone}\n\nWe'll contact you soon. 🙏"
  },
  cancelled: {
    urdu: "ٹھیک ہے! کوئی بات نہیں۔ 😊\n\nجب بھی ضرورت ہو — حاضر ہیں۔ کوئی اور سوال؟",
    roman: "Theek hai! Koi baat nahi. 😊\n\nJab bhi zaroorat ho — haazir hain. Koi aur sawaal?",
    english: "No problem! 😊\n\nWe're here whenever you need. Any other questions?"
  },
  just_info: {
    urdu: "ٹھیک ہے! صرف معلومات — بالکل درست۔ 😊\n\nکوئی بھی سوال پوچھیں۔",
    roman: "Theek hai! Sirf info — bilkul theek. 😊\n\nKoi bhi sawaal poochh sakte hain.",
    english: "No problem! Just browsing — totally fine. 😊\n\nAsk me anything."
  }
}

function t(lang: Lang, key: string, vars: Record<string, string> = {}): string {
  let text = M[key]?.[lang] || M[key]?.roman || ""
  Object.entries(vars).forEach(([k, v]) => { text = text.replaceAll(`{${k}}`, v) })
  return text
}

// ═══════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════
export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json()

    if (!message?.trim() || !sessionId) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 })
    }

    const session = getSession(sessionId)
    const rateCheck = checkRate(session)
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: rateCheck.reason }, { status: 429 })
    }

    session.count++

    // Language detection — persistent
    const detected = detectLang(message)
    if (detected !== "roman") session.lang = detected
    const lang = session.lang

    // Sentiment detection
    session.sentiment = detectSentiment(message)

    // Natural delay
    await new Promise(r => setTimeout(r, 400 + Math.random() * 500))

    // ── SPAM CHECK ──
    const spamResponse = detectSpam(message, session)
    if (spamResponse) return NextResponse.json({ response: spamResponse })

    // ── BUSINESS HOURS (only on first message) ──
    if (session.count === 1) {
      const hoursMsg = getBusinessHoursResponse(lang)
      if (hoursMsg) {
        return NextResponse.json({ response: hoursMsg })
      }
    }

    // ── STAGE: Collecting name ──
    if (session.stage === "collecting_name") {
      const name = message.trim()
      if (name.length < 2 || /^\d+$/.test(name)) {
        return NextResponse.json({ response: t(lang, "invalid_name") })
      }
      session.userName = name
      session.stage = "collecting_phone"
      return NextResponse.json({ response: t(lang, "ask_phone", { name }) })
    }

    // ── STAGE: Collecting phone ──
    if (session.stage === "collecting_phone") {
      if (!isValidPhone(message.trim())) {
        return NextResponse.json({ response: t(lang, "invalid_phone") })
      }
      session.userPhone = message.trim()
      session.stage = "confirm2"
      return NextResponse.json({
        response: t(lang, "confirm2", {
          name: session.userName,
          phone: session.userPhone,
          interest: session.interest.slice(0, 80)
        })
      })
    }

    // ── STAGE: Final confirmation ──
    if (session.stage === "confirm2") {
      if (isYes(message)) {
        session.stage = "done"
        const lead: Lead = {
          name: session.userName,
          phone: session.userPhone,
          interest: session.interest,
          time: new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" }),
          lang
        }
        leadsStore.push(lead)
        console.log("\n🔔 ═══════════════════════════")
        console.log("NEW LEAD CAPTURED!")
        console.log(`Name:     ${lead.name}`)
        console.log(`Phone:    ${lead.phone}`)
        console.log(`Interest: ${lead.interest}`)
        console.log(`Lang:     ${lead.lang}`)
        console.log(`Time:     ${lead.time}`)
        console.log("═══════════════════════════\n")
        return NextResponse.json({
          response: t(lang, "confirmed", {
            name: session.userName,
            schedule: getSchedule(lang),
            phone: BUSINESS_INFO.phone
          })
        })
      }
      if (isNo(message)) {
        session.stage = "normal"
        return NextResponse.json({ response: t(lang, "cancelled") })
      }
      return NextResponse.json({ response: t(lang, "confirm2_unclear") })
    }

    // ── STAGE: First confirmation ──
    if (session.stage === "confirm1") {
      if (isYes(message)) {
        session.stage = "collecting_name"
        return NextResponse.json({ response: t(lang, "ask_name") })
      }
      if (isNo(message)) {
        session.stage = "normal"
        return NextResponse.json({ response: t(lang, "just_info") })
      }
      return NextResponse.json({ response: t(lang, "confirm1_again") })
    }

    // ── STAGE: Normal ──

    // Interest → Lead capture
    if (session.stage === "normal" && hasInterest(message)) {
      session.stage = "confirm1"
      session.interest = message.slice(0, 150)
      return NextResponse.json({ response: t(lang, "confirm1") })
    }

    // Sentiment prefix
    const prefix = getSentimentPrefix(session.sentiment, lang)

    
    // Layer 0: FAQ quick match
    const faqAnswer = quickFaqMatch(message)
    if (faqAnswer) {
      return NextResponse.json({ response: prefix + faqAnswer })
    }

    // Layer 1: Groq AI
    const aiResponse = await getGroqResponse(message, session)
    return NextResponse.json({ response: prefix + aiResponse })

  } catch (error) {
    console.error("Route error:", error)
    return NextResponse.json({
      response: `Maafi — kuch masla aa gaya.\nCall karein: ${BUSINESS_INFO.phone}`
    })
  }
}

// ═══════════════════════════════════════
// ADMIN ENDPOINT
// ═══════════════════════════════════════
export async function GET() {
  return NextResponse.json({
    total_leads: leadsStore.length,
    leads: leadsStore,
    active_sessions: sessionStore.size,
    server_time: new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" })
  })
}