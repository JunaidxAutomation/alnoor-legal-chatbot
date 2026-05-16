import { NextRequest, NextResponse } from "next/server"
import { FAQ_DATA, BUSINESS_INFO } from "@/lib/data/faq"

const sessionStore = new Map<string, { count: number; createdAt: number }>()

function checkRateLimit(sessionId: string) {
  const MAX = parseInt(process.env.MAX_MESSAGES_PER_SESSION || "10")
  const now = Date.now()
  const session = sessionStore.get(sessionId)
  if (!session) {
    sessionStore.set(sessionId, { count: 0, createdAt: now })
    return { allowed: true }
  }
  if (now - session.createdAt > 86400000) {
    sessionStore.delete(sessionId)
    return { allowed: true }
  }
  if (session.count >= MAX) {
    return {
      allowed: false,
      reason: `Aap ne ${MAX} messages bhej diye hain. Seedha call karein: ${BUSINESS_INFO.phone}`
    }
  }
  return { allowed: true }
}

// Auto language detection
function detectLanguage(text: string): "urdu" | "roman" | "english" {
  if (/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text)) return "urdu"
  const romanWords = /\b(hai|hain|kya|ka|ki|ko|se|mein|pe|aur|nahi|karo|karein|chahiye|batao|poochna|lagta|lagti|milega|milegi|banta|banti|kitna|kitni|kab|kahan|kyun|kaisa|kaisi|hoga|hogi)\b/i
  if (romanWords.test(text)) return "roman"
  return "english"
}

// Urdu responses
function getUrduAnswer(text: string): string {
  const t = text
  if (/کرایہ|کرائے|rent/.test(t)) return "کرایہ نامہ صرف 1,500 روپے میں بنتا ہے اور 1-2 دن میں تیار ہو جاتا ہے۔ 📋\n\nمزید معلومات کے لیے: " + BUSINESS_INFO.phone
  if (/فیس|قیمت|کتن|چارج|پیسہ|پیسے/.test(t)) return "ہماری فیس:\n• بنیادی معاہدہ: 2,000 روپے\n• جائیداد معاہدہ: 5,000 روپے\n• کرایہ نامہ: 1,500 روپے 💰\n\nپہلی ملاقات مفت ہے!"
  if (/وقت|دیر|کب|دن/.test(t)) return "سادہ معاہدہ 1-2 دن میں تیار ہو جاتا ہے۔\nپیچیدہ معاہدہ 3-5 دن میں تیار ہوتا ہے۔ ⏰"
  if (/دفتر|آفس|اوقات|ٹائم|کھل/.test(t)) return "دفتر کا وقت:\nپیر تا ہفتہ، صبح 9 بجے سے شام 6 بجے تک 🕐\nاتوار کو بند رہتا ہے۔"
  if (/مفت|فری|مشاورت|مشورہ/.test(t)) return "جی ہاں! پہلی ملاقات بالکل مفت ہے۔ ✅\nابھی اپائنٹمنٹ لیں: " + BUSINESS_INFO.phone
  if (/دستاویز|کاغذ|ضرورت|چاہیے/.test(t)) return "درکار دستاویزات:\n• شناختی کارڈ کی کاپی (دونوں فریقین کی)\n• جائیداد کے کاغذات\n• رابطہ نمبر 📎"
  if (/واٹس|وٹس|آن لائن|فون/.test(t)) return "جی ہاں! واٹس ایپ پر مشاورت ممکن ہے۔ 📱\n" + BUSINESS_INFO.phone + " پر میسج کریں۔"
  if (/سیل|بیع|فروخت|ڈیڈ/.test(t)) return "سیل ڈیڈ اور معاہدے میں فرق:\n• معاہدہ: ایک وعدہ ہے\n• سیل ڈیڈ: قانونی ملکیت کی منتقلی ہے 🏠"
  if (/جائیداد|زمین|پلاٹ|گھر|مکان/.test(t)) return "جائیداد کا معاہدہ 5,000 روپے میں بنتا ہے — 3-5 دن میں تیار۔ 🏠\nفون کریں: " + BUSINESS_INFO.phone
  return "آپ کے سوال کے لیے براہ کرم فون کریں:\n📞 " + BUSINESS_INFO.phone + "\n🕐 " + BUSINESS_INFO.timing + "\nہم خوشی سے مدد کریں گے!"
}

// Roman Urdu responses
function getRomanAnswer(text: string): string {
  const t = text.toLowerCase()
  if (/rent|kiraya|kira|karay/.test(t)) return "Rent agreement Rs. 1,500 mein banta hai — 1-2 din mein ready. 📋\nCall karein: " + BUSINESS_INFO.phone
  if (/fee|paisa|price|kitne|kitna|kharcha|charges|mehnga/.test(t)) return "Hamaari fees:\n• Basic contract: Rs. 2,000\n• Property agreement: Rs. 5,000\n• Rent agreement: Rs. 1,500 💰\n\nPehli consultation free hai!"
  if (/time|waqt|kitna|der|din|jaldi|kab/.test(t)) return "Simple contract 1-2 din mein ready.\nComplex agreement 3-5 din mein. ⏰"
  if (/timing|office|kab|khula|band|hours|schedule/.test(t)) return "Office timing:\nMonday se Saturday\nSubah 9 baje se shaam 6 baje tak 🕐\nSunday band."
  if (/free|mufat|consultation|mashwara|milna/.test(t)) return "Haan! Pehli meeting bilkul free hai. ✅\nAppointment ke liye: " + BUSINESS_INFO.phone
  if (/document|kagaz|cnic|papers|kya chahiye|zaroorat/.test(t)) return "Zaroorat hogi:\n• CNIC copy dono parties ki\n• Property papers\n• Contact details 📎"
  if (/whatsapp|online|message|msg/.test(t)) return "Haan! WhatsApp pe consultation possible hai. 📱\n" + BUSINESS_INFO.phone + " pe message karein."
  if (/sale deed|deed|sale|farokht/.test(t)) return "Farq:\n• Agreement: ek promise hai\n• Sale Deed: registered legal transfer hai 🏠"
  if (/property|zameen|plot|ghar|makan/.test(t)) return "Property agreement Rs. 5,000 mein — 3-5 din mein ready. 🏠\nCall: " + BUSINESS_INFO.phone
  return "Is sawaal ke liye call karein:\n📞 " + BUSINESS_INFO.phone + "\n🕐 " + BUSINESS_INFO.timing + "\nHum khushi se madad karein ge!"
}

// English responses  
function getEnglishAnswer(text: string): string {
  const t = text.toLowerCase()
  if (/rent|lease|tenancy/.test(t)) return "Rent agreement costs Rs. 1,500 and is ready in 1-2 days. 📋\nContact: " + BUSINESS_INFO.phone
  if (/fee|cost|price|charge|how much|expensive/.test(t)) return "Our fees:\n• Basic contract: Rs. 2,000\n• Property agreement: Rs. 5,000\n• Rent agreement: Rs. 1,500 💰\n\nFirst consultation is FREE!"
  if (/time|how long|days|quick|fast|when ready/.test(t)) return "Simple contract: 1-2 days.\nComplex agreement: 3-5 days. ⏰"
  if (/timing|hours|open|closed|schedule|office time/.test(t)) return "Office Hours:\nMonday to Saturday\n9:00 AM to 6:00 PM 🕐\nClosed on Sundays."
  if (/free|consultation|meeting|advice/.test(t)) return "Yes! First consultation is completely FREE. ✅\nBook appointment: " + BUSINESS_INFO.phone
  if (/document|papers|required|need|cnic/.test(t)) return "Required documents:\n• CNIC copy of both parties\n• Property documents\n• Contact details 📎"
  if (/whatsapp|online|message|chat/.test(t)) return "Yes! WhatsApp consultation available. 📱\nMessage us: " + BUSINESS_INFO.phone
  if (/sale deed|deed|transfer|sale/.test(t)) return "Difference:\n• Agreement: a promise/contract\n• Sale Deed: legal property transfer 🏠"
  if (/property|land|plot|house|home/.test(t)) return "Property agreement costs Rs. 5,000 — ready in 3-5 days. 🏠\nCall: " + BUSINESS_INFO.phone
  return "For this query please contact us:\n📞 " + BUSINESS_INFO.phone + "\n🕐 " + BUSINESS_INFO.timing + "\nWe're happy to help!"
}

function getAnswer(query: string): string {
  // Check FAQ_DATA for exact matches first
  const q = query.toLowerCase()
  for (const faq of FAQ_DATA) {
    const words = faq.question.toLowerCase().split(/\s+/).filter(w => w.length > 3)
    if (words.filter(w => q.includes(w)).length >= 2) return faq.answer
  }

  // Auto language routing
  const lang = detectLanguage(query)
  if (lang === "urdu") return getUrduAnswer(query)
  if (lang === "roman") return getRomanAnswer(query)
  return getEnglishAnswer(query)
}

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json()
    if (!message || !sessionId) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 })
    }

    const rateCheck = checkRateLimit(sessionId)
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: rateCheck.reason }, { status: 429 })
    }

    // Simulate natural response delay
    await new Promise(r => setTimeout(r, 600 + Math.random() * 800))

    const session = sessionStore.get(sessionId)
    if (session) session.count++

    return NextResponse.json({ response: getAnswer(message) })

  } catch {
    return NextResponse.json({
      response: `Maafi chahta hoon, technical masla hai.\nCall karein: ${BUSINESS_INFO.phone}`
    })
  }
}