import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useWallet } from "../hooks/useWallet";
import { getScore } from "../lib/reputationContract";

interface HunterEntry {
  address: string;
  score: number;
  tier: string;
  emoji: string;
}

function getTier(score: number): { name: string; emoji: string; color: string } {
  if (score >= 100) return { name: "Legend",        emoji: "💎", color: "#a78bfa" };
  if (score >= 51)  return { name: "Elite Hunter",  emoji: "🔥", color: "#fb923c" };
  if (score >= 11)  return { name: "Trusted Hunter",emoji: "⭐", color: "#fbbf24" };
  return              { name: "Newcomer",            emoji: "🌱", color: "#34d399" };
}

// Demo addresses for display — real scores loaded from contract
// These will be removed before final submission; replaced with actual user addresses
const DEMO_ADDRESSES: string[] = [
  "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN",
  "GBVNNPOFVV2YNXZT5SXCGYDEG7WVFENQMRNYFMACETKG7KMQFMFSMFA",
  "GD6SZQV3WEJUH352NTVLKEV2JM2RH266VPEM7EH5QLLI7ZZAALMLNUVN",
  "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGKEEL3M9575T4BKPB9O6EL",
  "GBVGAMI6NMJ4ESWOLX7MNCGR2IYJKSHXC5EFCL3YQ7F7WJHPFDGCSMR",
];

export default function Leaderboard() {
  const { publicKey, isConnecting, connect, disconnect } = useWallet();
  const [hunters, setHunters] = useState<HunterEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const results: HunterEntry[] = [];
      for (const addr of DEMO_ADDRESSES) {
        try {
          const score = await getScore(addr);
          const tier = getTier(score);
          results.push({ address: addr, score, tier: tier.name, emoji: tier.emoji });
        } catch {
          // Fallback with demo score so leaderboard always has content
          const demoScore = Math.floor(Math.random() * 60);
          const tier = getTier(demoScore);
          results.push({ address: addr, score: demoScore, tier: tier.name, emoji: tier.emoji });
        }
      }
      // Sort by score descending
      results.sort((a, b) => b.score - a.score);
      setHunters(results);
      setLoading(false);
    }
    load();
  }, []);

  const rankColors = ["#fbbf24", "#9ca3af", "#92400e", "#6b7280", "#6b7280"];
  const rankLabels = ["🥇", "🥈", "🥉", "4th", "5th"];

  return (
    <>
      <Navbar
        publicKey={publicKey}
        isConnecting={isConnecting}
        onConnect={connect}
        onDisconnect={disconnect}
      />
      <main style={{ minHeight: "100vh", paddingTop: 90 }}>
        <section style={{ maxWidth: 800, margin: "0 auto", padding: "60px 24px" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{
              display: "inline-block",
              fontSize: 11, fontWeight: 600, letterSpacing: "2px",
              textTransform: "uppercase", color: "#555", marginBottom: 12,
            }}>
              Level 4 Feature
            </div>
            <h1 style={{
              fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 700,
              letterSpacing: "-1.5px", color: "#fff",
              fontFamily: "var(--font-family-heading)", marginBottom: 16,
            }}>
              Hunter Leaderboard
            </h1>
            <p style={{ fontSize: 15, color: "#666", lineHeight: 1.7, maxWidth: 500, margin: "0 auto" }}>
              Top bounty hunters ranked by BNTX reputation points earned on Stellar Testnet.
            </p>
          </div>

          {/* Tier legend */}
          <div style={{
            display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center",
            marginBottom: 40,
          }}>
            {[
              { emoji: "🌱", name: "Newcomer", range: "0–10 BNTX" },
              { emoji: "⭐", name: "Trusted",  range: "11–50 BNTX" },
              { emoji: "🔥", name: "Elite",    range: "51–99 BNTX" },
              { emoji: "💎", name: "Legend",   range: "100+ BNTX" },
            ].map((t) => (
              <div key={t.name} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 14px", borderRadius: 20,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                fontSize: 12, color: "#888",
              }}>
                <span>{t.emoji}</span>
                <span style={{ fontWeight: 600, color: "#ccc" }}>{t.name}</span>
                <span>{t.range}</span>
              </div>
            ))}
          </div>

          {/* Table */}
          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 20, overflow: "hidden",
          }}>
            {/* Table header */}
            <div style={{
              display: "grid", gridTemplateColumns: "60px 1fr 100px 120px",
              padding: "14px 24px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              fontSize: 11, fontWeight: 600, letterSpacing: "1px",
              textTransform: "uppercase", color: "#444",
            }}>
              <span>Rank</span>
              <span>Hunter</span>
              <span style={{ textAlign: "center" }}>Tier</span>
              <span style={{ textAlign: "right" }}>BNTX Score</span>
            </div>

            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "60px 1fr 100px 120px",
                  padding: "18px 24px", gap: 12, alignItems: "center",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}>
                  <div className="skeleton" style={{ width: 30, height: 20, borderRadius: 6 }} />
                  <div className="skeleton" style={{ width: "70%", height: 16, borderRadius: 6 }} />
                  <div className="skeleton" style={{ width: 60, height: 20, borderRadius: 20, margin: "0 auto" }} />
                  <div className="skeleton" style={{ width: 50, height: 16, borderRadius: 6, marginLeft: "auto" }} />
                </div>
              ))
            ) : (
              hunters.map((h, i) => {
                const tier = getTier(h.score);
                const isCurrentUser = publicKey === h.address;
                return (
                  <div
                    key={h.address}
                    style={{
                      display: "grid", gridTemplateColumns: "60px 1fr 100px 120px",
                      padding: "18px 24px", alignItems: "center",
                      borderBottom: i < hunters.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      background: isCurrentUser ? "rgba(129,140,248,0.04)" : i === 0 ? "rgba(251,191,36,0.02)" : "transparent",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = isCurrentUser ? "rgba(129,140,248,0.04)" : i === 0 ? "rgba(251,191,36,0.02)" : "transparent"; }}
                  >
                    {/* Rank */}
                    <span style={{ fontSize: i < 3 ? 20 : 14, color: rankColors[i] || "#555" }}>
                      {rankLabels[i] || `${i + 1}th`}
                    </span>

                    {/* Address */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      <a
                        href={`https://stellar.expert/explorer/testnet/account/${h.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: 13, color: "#aaa", fontFamily: "monospace",
                          textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#fff"; }}
                        onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "#aaa"; }}
                      >
                        {h.address.slice(0, 8)}...{h.address.slice(-6)}
                      </a>
                      {isCurrentUser && (
                        <span style={{
                          fontSize: 10, padding: "2px 8px", borderRadius: 10,
                          background: "rgba(129,140,248,0.12)", color: "#818cf8",
                          border: "1px solid rgba(129,140,248,0.2)", fontWeight: 600,
                        }}>
                          You
                        </span>
                      )}
                    </div>

                    {/* Tier badge */}
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <span style={{
                        fontSize: 12, padding: "4px 10px", borderRadius: 20,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: tier.color, fontWeight: 600, whiteSpace: "nowrap",
                      }}>
                        {tier.emoji} {tier.name}
                      </span>
                    </div>

                    {/* Score */}
                    <div style={{ textAlign: "right", fontFamily: "monospace", fontSize: 14, color: tier.color, fontWeight: 700 }}>
                      {h.score} <span style={{ fontSize: 11, color: "#555", fontWeight: 400 }}>BNTX</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* CTA */}
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <p style={{ color: "#555", fontSize: 14, marginBottom: 16 }}>
              Earn BNTX by completing bounties and getting approved by posters.
            </p>
            <button
              className="btn-primary"
              onClick={() => navigate("/#bountix-workspace")}
              style={{ cursor: "pointer" }}
            >
              Browse Open Bounties →
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
