import { useScrollReveal } from "../hooks/useScrollReveal";

export default function Partners() {
  const [ref, visible] = useScrollReveal(0.2);
  const partners = [
    { name: "Stellar", icon: "✦" },
    { name: "Cosmos", icon: "⊛" },
    { name: "Freighter", icon: "◈" },
    { name: "OKX", icon: "⬡" },
    { name: "Horizon", icon: "◐" },
    { name: "Soroban", icon: "◉" },
  ];

  return (
    <section ref={ref} style={{ padding: "60px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "linear-gradient(180deg, rgba(5,5,5,0) 0%, rgba(17,17,17,0.3) 50%, rgba(5,5,5,0) 100%)", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(40px)", transition: "all 0.7s ease" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", color: "#555", marginBottom: 8 }}>Our Partners</div>
        <p style={{ fontSize: 18, fontWeight: 600, color: "#999", marginBottom: 40, fontFamily: "var(--font-family-heading)" }}>
          Leading the Way in Crypto Trust with Stellar
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          {partners.map((p, i) => (
            <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 28px", borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", cursor: "default", transition: "all 0.3s ease", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transitionDelay: `${i * 0.08}s` }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <span style={{ fontSize: 20, opacity: 0.4 }}>{p.icon}</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: "#999", fontFamily: "var(--font-family-heading)" }}>{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
