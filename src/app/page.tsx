import ChatWidget from "@/components/chat/ChatWidget"
import { BUSINESS_INFO } from "@/lib/data/faq"
import { Phone, Clock, MapPin, Scale, Shield, FileText, Home, Star } from "lucide-react"

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-purple-50 font-sans">

      {/* Top Announcement Bar */}
      <div style={{
        height: "38px",
        background: "linear-gradient(90deg, #064e3b 0%, #059669 25%, #0d9488 55%, #047857 80%, #064e3b 100%)",
        backgroundSize: "300% 100%",
        animation: "annGradient 8s linear infinite",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <style>{`
          @keyframes annGradient {
            0%   { background-position: 0% 50%; }
            100% { background-position: 300% 50%; }
          }
          @keyframes annScroll {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
        <div style={{
          display: "flex",
          animation: "annScroll 25s linear infinite",
          whiteSpace: "nowrap",
        }}>
          {[
            "🎯 Pehli consultation bilkul FREE hai!",
            "📋 Rent agreement sirf Rs. 1,500 mein",
            "⚡ Contract 1-2 din mein ready",
            "📞 Call: 0300-1234567",
            "🕐 Mon-Sat: 9am - 6pm",
            "✅ 15+ saal ka tajruba",
            "🏠 Property documents — Gujranwala",
            "🎯 Pehli consultation bilkul FREE hai!",
            "📋 Rent agreement sirf Rs. 1,500 mein",
            "⚡ Contract 1-2 din mein ready",
            "📞 Call: 0300-1234567",
            "🕐 Mon-Sat: 9am - 6pm",
            "✅ 15+ saal ka tajruba",
            "🏠 Property documents — Gujranwala",
          ].map((text, i) => (
            <span key={i} style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "0 28px",
              color: "rgba(255,255,255,0.95)",
              fontSize: "11.5px",
              fontWeight: 600,
              letterSpacing: "0.3px",
            }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.5)", display: "inline-block" }} />
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <section className="pt-16 pb-8 px-5 text-center animate-fade-up">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-emerald-200 animate-float" style={{ width: 88, height: 88 }}>
          <Scale size={40} color="white" />
        </div>
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold mb-4 tracking-wide uppercase">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          Verified Legal Office
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-900 tracking-tight mb-2">
          {BUSINESS_INFO.name}
        </h1>
        <p className="text-sm text-gray-500 mb-5">📍 {BUSINESS_INFO.location} • Professional Legal Services</p>
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-emerald-200">
          <Star size={14} fill="white" color="white" />
          Trusted Legal Partner Since 2010
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-2xl mx-auto px-5 mb-6">
        <div className="grid grid-cols-3 gap-3">
          {[
            { num: "500+", label: "Cases Done" },
            { num: "15+", label: "Years Exp." },
            { num: "24/7", label: "AI Support" },
          ].map((s) => (
            <div key={s.label} className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-4 text-center shadow-lg shadow-emerald-200">
              <div className="text-2xl font-extrabold text-white">{s.num}</div>
              <div className="text-xs text-emerald-100 mt-1 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Info Cards */}
      <section className="max-w-2xl mx-auto px-5 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: <Clock size={20} color="#059669" />, bg: "bg-emerald-50", label: "Timing", value: "Mon–Sat\n9am – 6pm" },
            { icon: <Phone size={20} color="#3b82f6" />, bg: "bg-blue-50", label: "Phone", value: BUSINESS_INFO.phone },
            { icon: <MapPin size={20} color="#a855f7" />, bg: "bg-purple-50", label: "Location", value: "Gujranwala\nPunjab" },
            { icon: <Shield size={20} color="#f97316" />, bg: "bg-orange-50", label: "First Visit", value: "Consultation\nFREE ✅" },
          ].map((c) => (
            <div key={c.label} className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform duration-200">
              <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                {c.icon}
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">{c.label}</div>
              <div className="text-xs font-bold text-gray-800 whitespace-pre-line leading-snug">{c.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="max-w-2xl mx-auto px-5 mb-6">
        <h2 className="text-lg font-bold text-emerald-900 text-center mb-4">⚖️ Our Services</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: <FileText size={22} color="#059669" />, bg: "bg-emerald-50", name: "Rent Agreement", price: "Rs. 1,500" },
            { icon: <FileText size={22} color="#3b82f6" />, bg: "bg-blue-50", name: "Basic Contract", price: "Rs. 2,000" },
            { icon: <Home size={22} color="#a855f7" />, bg: "bg-purple-50", name: "Property Deed", price: "Rs. 5,000" },
            { icon: <Shield size={22} color="#f97316" />, bg: "bg-orange-50", name: "Consultation", price: "FREE" },
          ].map((s) => (
            <div key={s.name} className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform duration-200">
              <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                {s.icon}
              </div>
              <div className="text-xs font-bold text-gray-800 mb-1">{s.name}</div>
              <div className="text-xs font-semibold text-emerald-600">{s.price}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-lg mx-auto px-5 pb-36 text-center">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          <p className="text-base font-bold text-emerald-900 mb-1">💬 AI Chatbot Available 24/7</p>
          <p className="text-xs text-gray-500 mb-5">Neeche right corner mein chat button dabayein — fees, timing, documents ke baare mein foran jawab</p>
          <a
            href="https://wa.me/923001234567"
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg shadow-green-200 hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp Pe Message Karein
          </a>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-gray-400">Ya neeche AI chatbot se baat karein</span>
          </div>
        </div>
      </section>

      {/* Fixed WhatsApp Button — left side above footer */}
      <a
        href="https://wa.me/923001234567"
        target="_blank"
        rel="noopener"
        aria-label="WhatsApp"
        className="fixed left-5 bottom-20 z-[9996] rounded-full flex items-center justify-center shadow-xl animate-pulse-wa no-underline"
        style={{ width: 52, height: 52, background: "linear-gradient(135deg, #25D366, #128C7E)" }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-[9995] bg-white/95 backdrop-blur border-t border-gray-100 shadow-lg px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <div className="text-xs font-bold text-gray-800">AL-NOOR Legal</div>
            <div className="text-[10px] text-gray-400">Mon–Sat • 9am–6pm</div>
          </div>
        </div>
        <a
          href={"tel:" + BUSINESS_INFO.phone}
          className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all"
        >
          📞 Call Now
        </a>
      </div>

      <ChatWidget />
    </main>
  )
}
