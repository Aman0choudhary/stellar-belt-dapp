import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useWallet } from "../hooks/useWallet";
import { getAllBounties } from "../lib/bountyContract";
import { getScore } from "../lib/reputationContract";

interface HunterEntry {
  address: string;
  score: number;
  bountiesCompleted: number;
  bountiesPosted: number;
  tier: string;
  emoji: string;
  color: string;
}

function getTier(score: number): { name: string; emoji: string; color: string } {
  if (score >= 100) return { name: "Legend",         emoji: "💎", color: "#a78bfa" };
  if (score >= 51)  return { name: "Elite Hunter",   emoji: "🔥", color: "#fb923c" };
  if (score >= 11)  return { name: "Trusted Hunter", emoji: "⭐", color: "#fbbf24" };
  return              { name: "Newcomer",             emoji: "🌱", color: "#34d399" };
}

const rankLabels = ["🥇", "🥈", "🥉", "4th", "5th", "6th", "7th", "8th", "9th", "10th"];
const rankColors = ["#fbbf24", "#9ca3af", "#92400e", "#6b7280", "#6b7280", "#555", "#555", "#555", "#555", "#555"];

export default function Leaderboard() {
  const { publicKey, isConnecting, connect, disconnect } = useWallet();
  const [hunters, setHunters] = useState<HunterEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      try {
        // Step 1: get all real bounties from the contract
        const bounties = await getAllBounties();

        // Step 2: collect unique addresses from posters AND hunters
        const addressMap = new Map<string, { bountiesCompleted: number; bountiesPosted: number }>();

        for (const b of bounties) {
          // Track posters
          if (b.poster && b.poster.startsWith("G")) {
            const existing = addressMap.get(b.poster) ?? { bountiesCompleted: 0, bountiesPosted: 0 };
            existing.bountiesPosted += 1;
            addressMap.set(b.poster, existing);
          }
          // Track hunters (only if they completed the bounty)
          if (b.hunter && b.hunter.startsWith("G")) {
            const existing = addressMap.get(b.hunter) ?? { bountiesCompleted: 0, bountiesPosted: 0 };
            if (b.status === "APPROVED") {
              existing.bountiesCompleted += 1;
            }
            addressMap.set(b.hunter, existing);
          }
        }

        if (addressMap.size === 0) {
          setHunters([]);
          setLoading(false);
          return;
        }

        // Step 3: fetch BNTX score for each address
        const results: HunterEntry[] = [];
        for (const [address, stats] of addressMap.entries()) {
          const score = await getScore(address);
          const tier = getTier(score);
          results.push({
            address,
            score,
            bountiesCompleted: stats.bountiesCompleted,
            bountiesPosted: stats.bountiesPosted,
            tier: tier.name,
            emoji: tier.emoji,
            color: tier.color,
          });
        }

        // Step 4: sort by score desc, then by bountiesCompleted desc
        results.sort((a, b) =>
          b.score !== a.score
            ? b.score - a.score
            : b.bountiesCompleted - a.bountiesCompleted
        );

        setHunters(results);
      } catch (err) {
        console.error("[Leaderboard]", err);
        setError("Failed to load leaderboard. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <>
      <Navbar
        publicKey={publicKey}
        isConnecting={isConnecting}
        onConnect={connect}
        onDisconnect={disconnect}
      />
      <main style={{ minHeight: "100vh", paddingTop: 90 }}>
        <section style={{ maxWidth: 860, margin: "0 auto", padding: "60px 24px" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{
              display: "inline-block",
              fontSize: 11, fontWeight: 600, letterSpacing: "2px",
              textTransform: "uppercase", color: "#555", marginBottom: 12,
            }}>
              Live on Stellar Testnet
            </div>
            <h1 style={{
              fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 700,
              letterSpacing: "-1.5px", color: "#fff",
              fontFamily: "var(--font-family-heading)", marginBottom: 16,
            }}>
              Hunter Leaderboard
            </h1>
            <p style={{ fontSize: 15, color: "#666", lineHeight: 1.7, maxWidth: 520, margin: "0 auto" }}>
              All addresses pulled live from the Bounty contract on Stellar Testnet. Scores are real BNTX reputation points earned on-chain.
            </p>
          </div>

          {/* Tier legend */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 40 }}>
            {[
              { emoji: "🌱", name: "Newcomer",      range: "0–10 BNTX" },
              { emoji: "⭐", name: "Trusted Hunter", range: "11–50 BNTX" },
              { emoji: "🔥", name: "Elite Hunter",   range: "51–99 BNTX" },
              { emoji: "💎", name: "Legend",         range: "100+ BNTX" },
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
              display: "grid",
              gridTemplateColumns: "56px 1fr 90px 90px 110px",
              padding: "14px 24px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              fontSize: 11, fontWeight: 600, letterSpacing: "1px",
              textTransform: "uppercase", color: "#444",
            }}>
              <span>Rank</span>
              <span>Address</span>
              <span style={{ textAlign: "center" }}>Tier</span>
              <span style={{ textAlign: "center" }}>Completed</span>
              <span style={{ textAlign: "right" }}>BNTX Score</span>
            </div>

            {/* Loading skeletons */}
            {loading && (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{
                  display: "grid",
                  gridTemplateColumns: "56px 1fr 90px 90px 110px",
                  padding: "18px 24px", alignItems: "center", gap: 8,
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}>
                  <div className="skeleton" style={{ width: 28, height: 20, borderRadius: 6 }} />
                  <div className="skeleton" style={{ width: "65%", height: 14, borderRadius: 6 }} />
                  <div className="skeleton" style={{ width: 56, height: 22, borderRadius: 20, margin: "0 auto" }} />
                  <div className="skeleton" style={{ width: 30, height: 14, borderRadius: 6, margin: "0 auto" }} />
                  <div className="skeleton" style={{ width: 48, height: 14, borderRadius: 6, marginLeft: "auto" }} />
                </div>
              ))
            )}

            {/* Error state */}
            {!loading && error && (
              <div style={{ padding: "48px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
                <p style={{ color: "#f87171", fontSize: 14 }}>{error}</p>
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && hunters.length === 0 && (
              <div style={{ padding: "64px 24px", textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🏜️</div>
                <h3 style={{ color: "#fff", marginBottom: 8, fontFamily: "var(--font-family-heading)" }}>
                  No hunters yet
                </h3>
                <p style={{ color: "#555", fontSize: 14, maxWidth: 360, margin: "0 auto" }}>
                  Be the first! Post or claim a bounty on the board to appear here.
                </p>
                <button
                  className="btn-primary"
                  onClick={() => navigate("/#bountix-workspace")}
                  style={{ marginTop: 24, cursor: "pointer" }}
                >
                  Go to Bounty Board →
                </button>
              </div>
            )}

            {/* Real data rows */}
            {!loading && !error && hunters.map((h, i) => {
              const isCurrentUser = publicKey === h.address;
              return (
                <div
                  key={h.address}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "56px 1fr 90px 90px 110px",
                    padding: "18px 24px", alignItems: "center",
                    borderBottom: i < hunters.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    background: isCurrentUser
                      ? "rgba(129,140,248,0.05)"
                      : i === 0 ? "rgba(251,191,36,0.02)" : "transparent",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isCurrentUser
                      ? "rgba(129,140,248,0.05)"
                      : i === 0 ? "rgba(251,191,36,0.02)" : "transparent";
                  }}
                >
                  {/* Rank */}
                  <span style={{ fontSize: i < 3 ? 20 : 13, color: rankColors[i] ?? "#555" }}>
                    {rankLabels[i] ?? `${i + 1}th`}
                  </span>

                  {/* Address */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <a
                      href={`https://stellar.expert/explorer/testnet/account/${h.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 13, color: "#aaa", fontFamily: "monospace",
                        textDecoration: "none", overflow: "hidden",
                        textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#aaa"; }}
                    >
                      {h.address.slice(0, 10)}...{h.address.slice(-6)}
                    </a>
                    {isCurrentUser && (
                      <span style={{
                        fontSize: 10, padding: "2px 8px", borderRadius: 10,
                        background: "rgba(129,140,248,0.12)", color: "#818cf8",
                        border: "1px solid rgba(129,140,248,0.2)", fontWeight: 600,
                        flexShrink: 0,
                      }}>
                        You
                      </span>
                    )}
                  </div>

                  {/* Tier */}
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <span style={{
                      fontSize: 11, padding: "4px 10px", borderRadius: 20,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: h.color, fontWeight: 600, whiteSpace: "nowrap",
                    }}>
                      {h.emoji} {h.tier}
                    </span>
                  </div>

                  {/* Completed */}
                  <div style={{
                    textAlign: "center", fontSize: 14, color: "#888",
                    fontFamily: "monospace", fontWeight: 600,
                  }}>
                    {h.bountiesCompleted > 0
                      ? <span style={{ color: "#34d399" }}>{h.bountiesCompleted} ✓</span>
                      : <span style={{ color: "#333" }}>—</span>
                    }
                  </div>

                  {/* Score */}
                  <div style={{
                    textAlign: "right", fontFamily: "monospace",
                    fontSize: 15, color: h.color, fontWeight: 700,
                  }}>
                    {h.score}{" "}
                    <span style={{ fontSize: 10, color: "#555", fontWeight: 400 }}>BNTX</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats footer */}
          {!loading && !error && hunters.length > 0 && (
            <div style={{
              marginTop: 20, display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center",
            }}>
              {[
                { label: "Total Hunters", value: hunters.length },
                { label: "Bounties Completed", value: hunters.reduce((s, h) => s + h.bountiesCompleted, 0) },
                { label: "Top Score", value: `${hunters[0]?.score ?? 0} BNTX` },
              ].map((stat) => (
                <div key={stat.label} style={{
                  padding: "10px 20px", borderRadius: 12,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "monospace" }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          )}

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
