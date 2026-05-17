import { NextRequest, NextResponse } from "next/server"

function getFileName(interest: string): string {
  const s = interest.toLowerCase()
  if (/rent|kiraya/.test(s)) return "Rent Agreement"
  if (/property|zameen|plot/.test(s)) return "Property Agreement"
  if (/sale|deed/.test(s)) return "Sale Deed"
  if (/consult/.test(s)) return "Consultation"
  return "Contract"
}

export async function POST(req: NextRequest) {
  try {
    const { name, phone, interest, time } = await req.json()

    const instance = process.env.GREEN_API_INSTANCE
    const token = process.env.GREEN_API_TOKEN
    const clientPhone = process.env.CLIENT_WHATSAPP

    if (!instance || !token || !clientPhone) {
      return NextResponse.json({ error: "Missing env" }, { status: 500 })
    }

    const chatId = `${clientPhone}@c.us`
    const service = getFileName(interest)
    const baseUrl = "https://alnoor-legal-chatbot.vercel.app"
    const confirmUrl = `${baseUrl}/api/confirm?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}&interest=${encodeURIComponent(interest)}`
    const cancelUrl = `${baseUrl}/api/cancel?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`

    // Professional WhatsApp message to client
    const message =
      `🔔 *AL-NOOR Legal Services*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📋 *${service} Request*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `👤 *Customer:* ${name}\n` +
      `📞 *Phone:* ${phone}\n` +
      `💼 *Service:* ${interest}\n` +
      `🕐 *Time:* ${time}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `✅ *MEETING CONFIRM:*\n${confirmUrl}\n\n` +
      `❌ *MEETING CANCEL:*\n${cancelUrl}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `_AL-NOOR AI Chatbot System_`

    await fetch(
      `https://7107.api.greenapi.com/waInstance${instance}/sendMessage/${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, message })
      }
    )

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error("send-pdf error:", err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}