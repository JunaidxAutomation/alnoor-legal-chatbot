import { NextRequest, NextResponse } from "next/server"
import { BUSINESS_INFO } from "@/lib/data/faq"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const name = searchParams.get("name") || ""
    const phone = searchParams.get("phone") || ""
    const interest = searchParams.get("interest") || ""

    if (!phone) return new NextResponse("Invalid", { status: 400 })

    const instance = process.env.GREEN_API_INSTANCE
    const token = process.env.GREEN_API_TOKEN
    if (!instance || !token) return new NextResponse("Config error", { status: 500 })

    const customerPhone = phone.replace(/[\s\-]/g, "").replace(/^0/, "92") + "@c.us"

    await fetch(
      `https://7107.api.greenapi.com/waInstance${instance}/sendMessage/${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: customerPhone,
          message:
            `✅ *Appointment Confirmed!*\n` +
            `━━━━━━━━━━━━━━━━━━━━\n\n` +
            `Assalam o Alaikum *${name}*! 😊\n\n` +
            `Aapki appointment confirm ho gayi hai.\n\n` +
            `📋 *Booking Details:*\n` +
            `👤 Name: ${name}\n` +
            `💼 Service: ${interest}\n` +
            `📍 ${BUSINESS_INFO.location}\n` +
            `🕐 ${BUSINESS_INFO.timing}\n\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `📞 *Contact:* ${BUSINESS_INFO.phone}\n\n` +
            `Koi sawaal ho toh call karein. Shukriya! 🙏\n\n` +
            `_${BUSINESS_INFO.name}_`
        })
      }
    )

    return new NextResponse(`
      <!DOCTYPE html><html><head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmed!</title>
      <style>
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:system-ui,sans-serif;background:#f0fdf4;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px}
        .card{background:white;border-radius:20px;padding:40px 32px;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.1);max-width:420px;width:100%}
        .icon{font-size:64px;margin-bottom:16px}
        h1{color:#059669;font-size:26px;font-weight:800;margin-bottom:8px}
        p{color:#6b7280;font-size:14px;line-height:1.6}
        .badge{background:#ecfdf5;color:#059669;font-weight:700;padding:8px 20px;border-radius:9999px;font-size:13px;margin-top:20px;display:inline-block}
      </style>
      </head><body>
      <div class="card">
        <div class="icon">✅</div>
        <h1>Appointment Confirmed!</h1>
        <p><strong>${name}</strong> ko WhatsApp confirmation bhej di gayi hai.</p>
        <p style="margin-top:12px">📞 ${phone}</p>
        <div class="badge">AL-NOOR Legal Services</div>
      </div>
      </body></html>
    `, { headers: { "Content-Type": "text/html" } })

  } catch (err) {
    console.error("Confirm error:", err)
    return new NextResponse("Error", { status: 500 })
  }
}