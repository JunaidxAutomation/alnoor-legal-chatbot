import ChatWidget from "@/components/chat/ChatWidget"
import { BUSINESS_INFO } from "@/lib/data/faq"
import { Phone, Clock, MapPin, Scale, Shield, FileText, Home, Star } from "lucide-react"

export default function Page() {
  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 30%, #f0f9ff 60%, #faf5ff 100%)", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes slideText {
          from { opacity: 0; transform: translateX(12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulse-wa {
          0% { box-shadow: 0 0 0 0 rgba(37,211,102,0.5); }
          70% { box-shadow: 0 0 0 14px rgba(37,211,102,0); }
          100% { box-shadow: 0 0 0 0 rgba(37,211,102,0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .hero-section {
          padding: 60px 20px 40px;
          text-align: center;
          animation: fadeUp 0.6s ease;
        }
        .hero-icon {
          width: 88px;
          height: 88px;
          border-radius: 28px;
          background: linear-gradient(135deg, #059669, #047857);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          box-shadow: 0 20px 40px rgba(5,150,105,0.35);
          animation: float 4s ease-in-out infinite;
        }
        .hero-title {
          font-size: clamp(24px, 6vw, 36px);
          font-weight: 800;
          color: #064e3b;
          letter-spacing: -0.5px;
          line-height: 1.2;
          margin-bottom: 8px;
        }
        .hero-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 24px;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #059669, #047857);
          color: white;
          padding: 8px 18px;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(5,150,105,0.3);
          margin-bottom: 8px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
          max-width: 700px;
          margin: 32px auto;
          padding: 0 20px;
          animation: fadeUp 0.6s ease 0.1s both;
        }
        .info-card {
          background: white;
          border-radius: 16px;
          padding: 16px 14px;
          text-align: center;
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
          border: 1px solid rgba(5,150,105,0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .info-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(5,150,105,0.12);
        }
        .info-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 10px;
        }
        .info-label { font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 4px; }
        .info-value { font-size: 13px; color: #1e293b; font-weight: 600; line-height: 1.4; }

        .services-section {
          max-width: 700px;
          margin: 0 auto;
          padding: 0 20px 40px;
          animation: fadeUp 0.6s ease 0.2s both;
        }
        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: #064e3b;
          margin-bottom: 16px;
          text-align: center;
        }
        .service-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 10px;
        }
        .service-card {
          background: white;
          border-radius: 14px;
          padding: 16px 12px;
          text-align: center;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
          border: 1px solid #f1f5f9;
        }
        .service-icon {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 10px;
        }
        .service-name { font-size: 12px; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
        .service-price { font-size: 11px; color: #059669; font-weight: 600; }

        .stats-bar {
          max-width: 700px;
          margin: 0 auto 32px;
          padding: 0 20px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          animation: fadeUp 0.6s ease 0.3s both;
        }
        .stat-item {
          background: linear-gradient(135deg, #059669, #047857);
          border-radius: 14px;
          padding: 16px 10px;
          text-align: center;
          color: white;
          box-shadow: 0 4px 16px rgba(5,150,105,0.25);
        }
        .stat-num { font-size: 22px; font-weight: 800; }
        .stat-label { font-size: 10px; opacity: 0.85; margin-top: 2px; font-weight: 500; }

        .cta-section {
          padding: 0 20px 120px;
          text-align: center;
          animation: fadeUp 0.6s ease 0.4s both;
        }
        .cta-box {
          max-width: 500px;
          margin: 0 auto;
          background: white;
          border-radius: 20px;
          padding: 24px 20px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.08);
          border: 1px solid #e2e8f0;
        }
        .cta-title { font-size: 16px; font-weight: 700; color: #064e3b; margin-bottom: 6px; }
        .cta-sub { font-size: 13px; color: #6b7280; margin-bottom: 18px; }
        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #25D366, #128C7E);
          color: white;
          padding: 13px 28px;
          border-radius: 9999px;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 6px 20px rgba(37,211,102,0.4);
          margin-bottom: 10px;
          display: inline-flex;
        }
        .chat-hint {
          font-size: 12px;
          color: #9ca3af;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 12px;
        }

        .wa-fixed {
          position: fixed;
          bottom: 100px;
          left: 20px;
          z-index: 9996;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: linear-gradient(135deg, #25D366, #128C7E);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 20px rgba(37,211,102,0.5);
          text-decoration: none;
          animation: pulse-wa 2s infinite;
          -webkit-tap-highlight-color: transparent;
        }

        .footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-top: 1px solid #e2e8f0;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 9995;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.06);
        }
        .footer-info { display: flex; align-items: center; gap: 8px; }
        .footer-dot { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; flex-shrink: 0; }
        .footer-text { font-size: 12px; color: #374151; font-weight: 600; }
        .footer-sub { font-size: 10px; color: #9ca3af; }
        .footer-call {
          background: linear-gradient(135deg, #059669, #047857);
          color: white;
          padding: 9px 18px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 4px 12px rgba(5,150,105,0.3);
          white-space: nowrap;
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>

      {/* Hero */}
      <div className="hero-section">
        <div className="hero-icon">
          <Scale size={40} color="white" />
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#dcfce7", color: "#065f46", padding: "4px 12px", borderRadius: 9999, fontSize: 11, fontWeight: 700, marginBottom: 14, letterSpacing: "0.3px" }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80" }} />
          VERIFIED LEGAL OFFICE
        </div>
        <h1 className="hero-title">{BUSINESS_INFO.name}</h1>
        <p className="hero-subtitle">📍 {BUSINESS_INFO.location} • Professional Legal Services</p>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div className="hero-badge">
            <Star size={13} fill="white" color="white" />
            Trusted Legal Partner Since 2010
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-num">500+</div>
          <div className="stat-label">Cases Done</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">15+</div>
          <div className="stat-label">Years Exp.</div>
        </div>
        <div className="stat-item">
          <div className="stat-num">24/7</div>
          <div className="stat-label">AI Support</div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="info-grid">
        <div className="info-card">
          <div className="info-icon" style={{ background: "#f0fdf4" }}>
            <Clock size={20} color="#059669" />
          </div>
          <div className="info-label">Timing</div>
          <div className="info-value">Mon–Sat<br />9am – 6pm</div>
        </div>
        <div className="info-card">
          <div className="info-icon" style={{ background: "#eff6ff" }}>
            <Phone size={20} color="#3b82f6" />
          </div>
          <div className="info-label">Phone</div>
          <div className="info-value">{BUSINESS_INFO.phone}</div>
        </div>
        <div className="info-card">
          <div className="info-icon" style={{ background: "#fdf4ff" }}>
            <MapPin size={20} color="#a855f7" />
          </div>
          <div className="info-label">Location</div>
          <div className="info-value">Gujranwala<br />Punjab</div>
        </div>
        <div className="info-card">
          <div className="info-icon" style={{ background: "#fff7ed" }}>
            <Shield size={20} color="#f97316" />
          </div>
          <div className="info-label">First Visit</div>
          <div className="info-value">Consultation<br />FREE ✅</div>
        </div>
      </div>

      {/* Services */}
      <div className="services-section">
        <p className="section-title">⚖️ Our Services</p>
        <div className="service-grid">
          <div className="service-card">
            <div className="service-icon" style={{ background: "#f0fdf4" }}>
              <FileText size={22} color="#059669" />
            </div>
            <div className="service-name">Rent Agreement</div>
            <div className="service-price">Rs. 1,500</div>
          </div>
          <div className="service-card">
            <div className="service-icon" style={{ background: "#eff6ff" }}>
              <FileText size={22} color="#3b82f6" />
            </div>
            <div className="service-name">Basic Contract</div>
            <div className="service-price">Rs. 2,000</div>
          </div>
          <div className="service-card">
            <div className="service-icon" style={{ background: "#fdf4ff" }}>
              <Home size={22} color="#a855f7" />
            </div>
            <div className="service-name">Property Deed</div>
            <div className="service-price">Rs. 5,000</div>
          </div>
          <div className="service-card">
            <div className="service-icon" style={{ background: "#fff7ed" }}>
              <Shield size={22} color="#f97316" />
            </div>
            <div className="service-name">Consultation</div>
            <div className="service-price">FREE</div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="cta-section">
        <div className="cta-box">
          <p className="cta-title">💬 AI Chatbot Available 24/7</p>
          <p className="cta-sub">Neeche right corner mein chat button dabayein — fees, timing, aur documents ke baare mein foran jawab milega</p>
          <a href={"https://wa.me/923001234567"} className="cta-btn" target="_blank" rel="noopener">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp Pe Message Karein
          </a>
          <div className="chat-hint">
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80" }} />
            Ya neeche AI chatbot se baat karein — instant jawab
          </div>
        </div>
      </div>

      {/* Fixed WhatsApp Button */}
      <a href={"https://wa.me/923001234567"} className="wa-fixed" target="_blank" rel="noopener" aria-label="WhatsApp">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>

      {/* Fixed Footer Bar */}
      <div className="footer">
        <div className="footer-info">
          <div className="footer-dot" />
          <div>
            <div className="footer-text">AL-NOOR Legal</div>
            <div className="footer-sub">Mon–Sat • 9am–6pm</div>
          </div>
        </div>
        <a href={"tel:" + BUSINESS_INFO.phone} className="footer-call">
          📞 Call Now
        </a>
      </div>

      <ChatWidget />
    </main>
  )
}
