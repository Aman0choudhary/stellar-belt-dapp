import { useState } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal";

const footerLinks = {
  Product: ["Features", "Dashboard", "Pools", "Security", "Pricing"],
  Workflows: ["Wallet Connect", "Send XLM", "Swap Assets", "Bridge Tokens", "Staking"],
  Support: ["Help Center", "Status", "Community", "Contact Us", "Bug Bounty"],
  Documentation: ["Getting Started", "API Reference", "SDK Guide", "Smart Contracts", "Changelog"],
};

const socialLinks = [
  { label: "Twitter", icon: "𝕏" },
  { label: "Discord", icon: "◈" },
  { label: "GitHub", icon: "⬡" },
  { label: "Telegram", icon: "✈" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [ref, visible] = useScrollReveal(0.1);

  return (
    <footer ref={ref} style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "linear-gradient(180deg, rgba(5,5,5,0) 0%, rgba(17,17,17,0.2) 100%)", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s ease" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 24px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr repeat(4, 1fr)", gap: 40, marginBottom: 48 }} className="footer-grid">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#050505", fontFamily: "var(--font-family-heading)" }}>S</div>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "var(--font-family-heading)" }}>Stellar<span style={{ opacity: 0.4 }}>.</span></span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: "#666", marginBottom: 20, maxWidth: 260 }}>Stay Ahead with Stellar insights. Subscribe for the latest updates and features.</p>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter Your Email"
                style={{ flex: 1, padding: "10px 14px", borderRadius: 50, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", color: "#fff", fontSize: 13, fontFamily: "var(--font-family-body)", outline: "none" }} />
              <button className="btn-primary" style={{ padding: "10px 20px", fontSize: 13 }}>Subscribe</button>
            </div>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 16, fontFamily: "var(--font-family-heading)" }}>{title}</h4>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" style={{ fontSize: 13, color: "#555", transition: "color 0.2s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "#555"; }}>{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <p style={{ fontSize: 12, color: "#555" }}>Copyright 2025 All Right Reserved</p>
          <div style={{ display: "flex", gap: 16 }}>
            {socialLinks.map((s) => (
              <a key={s.label} href="#" aria-label={s.label} style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#555", transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#555"; }}>{s.icon}</a>
            ))}
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {["Privacy Policy", "Terms of Service"].map((t) => (
              <a key={t} href="#" style={{ fontSize: 12, color: "#555" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#555"; }}>{t}</a>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) { .footer-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 480px) { .footer-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </footer>
  );
}
