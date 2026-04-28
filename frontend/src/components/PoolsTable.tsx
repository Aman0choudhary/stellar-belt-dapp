import { useScrollReveal } from "../hooks/useScrollReveal";

interface PoolRow {
  pool: string;
  active: string;
  totalRewards: string;
  avgReward: string;
  trend: "Rising" | "Stable" | "Cooling";
}

export default function PoolsTable() {
  const [tableRef] = useScrollReveal(0.15);
  const [infoRef] = useScrollReveal(0.2);

  const pools: PoolRow[] = [
    { pool: "Social Growth", active: "14 bounties", totalRewards: "335 XLM", avgReward: "23.9 XLM", trend: "Rising" },
    { pool: "Code and Dev", active: "9 bounties", totalRewards: "610 XLM", avgReward: "67.8 XLM", trend: "Stable" },
    { pool: "Design Sprint", active: "7 bounties", totalRewards: "280 XLM", avgReward: "40.0 XLM", trend: "Rising" },
    { pool: "Testing and QA", active: "6 bounties", totalRewards: "190 XLM", avgReward: "31.7 XLM", trend: "Cooling" },
    { pool: "Content and Docs", active: "11 bounties", totalRewards: "255 XLM", avgReward: "23.2 XLM", trend: "Stable" },
  ];

  return (
    <section id="pools" className="section-padding" style={{ position: "relative" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 64, alignItems: "start" }}
          className="pools-grid"
        >
          <div ref={tableRef} className="scroll-reveal">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--font-family-heading)", color: "#fff" }}>
                Bounty Pools
              </h3>
              <div style={{ display: "flex", gap: 8 }}>
                {["Active", "Reward Flow"].map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 12,
                      padding: "4px 12px",
                      borderRadius: 6,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      color: "#666",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="pools-table-scroll" style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
              {pools.map((pool, i) => {
                const isPositive = pool.trend !== "Cooling";
                return (
                  <div
                    key={pool.pool}
                    className={`scroll-reveal scroll-reveal--left scroll-reveal--delay-${Math.min(i + 1, 5)}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr",
                      minWidth: 760,
                      alignItems: "center",
                      padding: "16px 20px",
                      borderBottom: i < pools.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                      background: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent";
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#fff" }}>{pool.pool}</div>
                    <div style={{ fontSize: 14, color: "#999", fontFamily: "monospace" }}>{pool.active}</div>
                    <div style={{ fontSize: 14, color: "#999", fontFamily: "monospace" }}>{pool.totalRewards}</div>
                    <div style={{ fontSize: 14, color: "#999", fontFamily: "monospace" }}>{pool.avgReward}</div>
                    <div style={{ fontSize: 14, color: isPositive ? "#34d399" : "#f87171", fontFamily: "monospace" }}>
                      {pool.trend}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div ref={infoRef} className="scroll-reveal scroll-reveal--delay-slow" style={{ paddingTop: 20 }}>
            <h2
              style={{
                fontSize: "clamp(24px, 3vw, 36px)",
                fontWeight: 700,
                letterSpacing: "-0.5px",
                marginBottom: 16,
                lineHeight: 1.2,
                color: "#fff",
              }}
            >
              Track where rewards are moving.
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: "#666", marginBottom: 28 }}>
              These pools summarize live Bountix activity so hunters can find high-yield tasks and posters can publish where
              engagement is strongest.
            </p>
            <button className="btn-primary">Open Live Bounties</button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .pools-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 767px) {
          .pools-table-scroll {
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>
    </section>
  );
}
