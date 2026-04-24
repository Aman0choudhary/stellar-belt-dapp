import { useScrollReveal } from "../hooks/useScrollReveal";

export default function PoolsTable() {
  const [tableRef, tableVis] = useScrollReveal(0.15);
  const [infoRef, infoVis] = useScrollReveal(0.2);

  const pools = [
    { pair: "XLM / USDC", apr24h: "+2.15%", aprWeek: "+15.23%", tvl: "$24.5M", apy: "12.4%", positive: true },
    { pair: "XLM / ETH", apr24h: "+1.87%", aprWeek: "+9.22%", tvl: "$18.2M", apy: "9.8%", positive: true },
    { pair: "XLM / BTC", apr24h: "-0.34%", aprWeek: "+12.45%", tvl: "$31.8M", apy: "15.2%", positive: false },
    { pair: "USDC / yXLM", apr24h: "+0.92%", aprWeek: "+6.25%", tvl: "$8.4M", apy: "7.6%", positive: true },
    { pair: "SHX / XLM", apr24h: "+3.41%", aprWeek: "+24.12%", tvl: "$3.2M", apy: "22.1%", positive: true },
  ];

  return (
    <section id="pools" className="section-padding" style={{ position: "relative" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 64, alignItems: "start" }} className="pools-grid">
          <div ref={tableRef} style={{ opacity: tableVis ? 1 : 0, transform: tableVis ? "translateY(0)" : "translateY(40px)", transition: "all 0.7s ease" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--font-family-heading)", color: "#fff" }}>Pool</h3>
              <div style={{ display: "flex", gap: 8 }}>
                {["APR/24h", "TVL"].map((t) => (
                  <span key={t} style={{ fontSize: 12, padding: "4px 12px", borderRadius: 6, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "#666" }}>{t}</span>
                ))}
              </div>
            </div>
            <div style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
              {pools.map((pool, i) => (
                <div key={pool.pair} style={{
                  display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", alignItems: "center",
                  padding: "16px 20px", borderBottom: i < pools.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                  background: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent", transition: "all 0.3s ease", cursor: "pointer",
                  opacity: tableVis ? 1 : 0, transform: tableVis ? "translateX(0)" : "translateX(-20px)",
                  transitionDelay: tableVis ? `${i * 0.08}s` : "0s",
                }} onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent"; }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#fff" }}>{pool.pair}</div>
                  <div style={{ fontSize: 14, color: pool.positive ? "#34d399" : "#f87171", fontFamily: "monospace" }}>{pool.apr24h}</div>
                  <div style={{ fontSize: 14, color: "#999", fontFamily: "monospace" }}>{pool.tvl}</div>
                  <div style={{ fontSize: 14, color: "#999", fontFamily: "monospace" }}>{pool.apy}</div>
                </div>
              ))}
            </div>
          </div>
          <div ref={infoRef} style={{ paddingTop: 20, opacity: infoVis ? 1 : 0, transform: infoVis ? "translateY(0)" : "translateY(40px)", transition: "all 0.7s ease 0.2s" }}>
            <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 700, letterSpacing: "-0.5px", marginBottom: 16, lineHeight: 1.2, color: "#fff" }}>
              Supply liquidity to leading pools.
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: "#666", marginBottom: 28 }}>
              Earn passive income by providing liquidity to Stellar-based pools. Track APR, TVL, and performance in real-time.
            </p>
            <button className="btn-primary">Explore Pools →</button>
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 768px) { .pools-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}
