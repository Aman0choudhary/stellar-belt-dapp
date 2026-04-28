import { useScrollReveal } from "../hooks/useScrollReveal";

const features = [
  { icon: "📊", title: "Real-Time Analytics", desc: "Track portfolio performance and market trends with live dashboards.", metrics: [{ label: "USP", value: "Live Data" }, { label: "UXP", value: "Instant" }] },
  { icon: "🛡️", title: "Advanced Security", desc: "Enterprise-grade security with multi-layer encryption and Freighter integration." },
  { icon: "🌐", title: "Ecosystem & Partnerships", desc: "Seamlessly connect with Stellar ecosystem — Soroban, cross-border payments, and DEXes." },
  { icon: "💱", title: "Multi-Currency Support", desc: "Send XLM, manage multiple Stellar assets, and convert currencies with built-in swap." },
];

function Card({ f, i }: { f: typeof features[0]; i: number }) {
  const [cardRef] = useScrollReveal(0.12);

  return (
    <div ref={cardRef} className={`feature-card scroll-reveal scroll-reveal--delay-${i + 1}`}>
      <div style={{ position: "absolute", top: -80, right: -80, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 20 }}>{f.icon}</div>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 12, fontFamily: "var(--font-family-heading)" }}>{f.title}</h3>
      <p style={{ fontSize: 14, lineHeight: 1.7, color: "#666" }}>{f.desc}</p>
      {f.metrics && (
        <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
          {f.metrics.map((m) => (
            <div key={m.label} style={{ padding: "8px 16px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 11, color: "#555", marginBottom: 2 }}>{m.label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{m.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Features() {
  const [headerRef] = useScrollReveal(0.3);

  return (
    <section id="features" className="section-padding" style={{ position: "relative" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 800, height: 800, background: "radial-gradient(circle, rgba(255,255,255,0.015) 0%, transparent 60%)", pointerEvents: "none" }} />
      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div ref={headerRef} className="scroll-reveal scroll-reveal--up" style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", color: "#555", marginBottom: 12 }}>Our Platform</div>
          <h2 style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 700, letterSpacing: "-1px", marginBottom: 16, color: "#fff" }}>
            Innovative Features of Stellar Wallet
          </h2>
          <p style={{ fontSize: 16, color: "#666", maxWidth: 560, margin: "0 auto" }}>
            Advanced security, real-time analytics, and seamless multi-currency support for the ultimate Web3 experience.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))", gap: 24 }}>
          {features.map((f, i) => <Card key={f.title} f={f} i={i} />)}
        </div>
      </div>
    </section>
  );
}
