import { NextRequest, NextResponse } from "next/server"
import { generateAppointmentPdf } from "@/lib/pdf/generateAppointmentPdf"

function getFileName(name: string, interest: string): string {
  const n = name.replace(/\s+/g, "_")
  const s = interest.toLowerCase()
  if (/rent|kiraya|کرایہ/.test(s)) return `Rent_Agreement_${n}.pdf`
  if (/property|zameen|جائیداد|plot/.test(s)) return `Property_Agreement_${n}.pdf`
  if (/sale|deed|فروخت/.test(s)) return `Sale_Deed_${n}.pdf`
  if (/consult|مشاورت/.test(s)) return `Consultation_${n}.pdf`
  return `Contract_${n}.pdf`
}

export async function POST(req: NextRequest) {
  try {
    const { name, phone, interest, time } = await req.json()

    const instance = process.env.GREEN_API_INSTANCE
    const token = process.env.GREEN_API_TOKEN
    const clientPhone = process.env.CLIENT_WHATSAPP

    if (!instance || !token || !clientPhone) return NextResponse.json({ error: "Missing env" }, { status: 500 })

    const chatId = `${clientPhone}@c.us`
    const fileName = getFileName(name, interest)
    const baseUrl = "https://alnoor-legal-chatbot.vercel.app"
    const confirmUrl = `${baseUrl}/api/confirm?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}&interest=${encodeURIComponent(interest)}`
    const cancelUrl = `${baseUrl}/api/cancel?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`

    // Step 1: Generate PDF
    const pdfBuffer = await generateAppointmentPdf({ name, phone, interest, time })

    // Step 2: Send PDF
    const formData = new FormData()
    formData.append("file", new Blob([pdfBuffer as unknown as ArrayBuffer], { type: "application/pdf" }), fileName)
    formData.append("chatId", chatId)
    formData.append("caption",
      `📋 *${fileName.replace(/_/g, " ").replace(".pdf", "")}*\n\n` +
      `👤 *Customer:* ${name}\n` +
      `📞 *Phone:* ${phone}\n` +
      `💼 *Service:* ${interest}\n` +
      `🕐 *Time:* ${time}`
    )

    await fetch(
      `https://7107.api.greenapi.com/waInstance${instance}/sendFileByUpload/${token}`,
      { method: "POST", body: formData }
    )

    // Wait 2 seconds
    await new Promise(r => setTimeout(r, 2000))

    // Step 3: Try buttons — fallback to text
    const btnRes = await fetch(
      `https://7107.api.greenapi.com/waInstance${instance}/sendButtons/${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          message: `*Action Required — ${name}*\n\n👤 ${name}\n📞 ${phone}\n💼 ${interest}`,
          buttons: [
            { buttonId: "confirm", buttonText: "✅ Meeting Confirmed" },
            { buttonId: "cancel",  buttonText: "❌ Meeting Cancel" }
          ],
          footer: "AL-NOOR Legal Services"
        })
      }
    )

    // If buttons fail — send text with links
    if (!btnRes.ok) {
      await fetch(
        `https://7107.api.greenapi.com/waInstance${instance}/sendMessage/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chatId,
            message:
              `┌─────────────────────┐\n` +
              `     *ACTION REQUIRED*\n` +
              `└─────────────────────┘\n\n` +
              `✅ *Meeting Confirm:*\n${confirmUrl}\n\n` +
              `❌ *Meeting Cancel:*\n${cancelUrl}\n\n` +
              `_AL-NOOR Legal Services_`
          })
        }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("send-pdf error:", err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}