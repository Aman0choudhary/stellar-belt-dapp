import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BountyTimeline from "../components/BountyTimeline";
import ReputationBadge from "../components/ReputationBadge";
import { useWallet } from "../hooks/useWallet";
import { useBounties } from "../hooks/useBounties";
import type { BountyItem } from "../lib/bountyContract";

function addr(a: string | null): string {
  if (!a) return "-";
  return `${a.slice(0, 8)}...${a.slice(-6)}`;
}

function timeLeft(deadline: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = deadline - now;
  if (diff <= 0) return "Expired";
  const d = Math.floor(diff / 86400);
  const h = Math.floor((diff % 86400) / 3600);
  if (d > 0) return `${d}d ${h}h left`;
  const m = Math.floor((diff % 3600) / 60);
  return `${h}h ${m}m left`;
}

const STATUS_COLOR: Record<BountyItem["status"], string> = {
  OPEN: "#34d399",
  CLAIMED: "#fbbf24",
  SUBMITTED: "#818cf8",
  APPROVED: "#10b981",
  REJECTED: "#f87171",
  CANCELLED: "#6b7280",
  EXPIRED: "#6b7280",
};

export default function BountyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { publicKey, isConnecting, connect, disconnect } = useWallet();
  const bounty = useBounties(publicKey);
  const [item, setItem] = useState<BountyItem | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!bounty.loading && id) {
      const found = bounty.bounties.find((b) => b.id === parseInt(id));
      setItem(found ?? null);
    }
  }, [bounty.loading, bounty.bounties, id]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  const handleTweet = useCallback(() => {
    if (!item) return;
    const text = encodeURIComponent(
      `🎯 ${item.rewardXlm} XLM bounty on Bountix: "${item.title}"\n\nClaim it on Stellar Testnet 👇`
    );
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  }, [item]);

  const isPoster = item?.poster === publicKey;
  const isHunter = item?.hunter === publicKey;
  const canClaim = item?.status === "OPEN" && publicKey && !isPoster;
  const canApprove = item?.status === "SUBMITTED" && isPoster;

  const statusColor = item ? STATUS_COLOR[item.status] : "#555";

  return (
    <>
      {/* OG meta tags via document.title — real OG tags require SSR */}
      {item && (
        <title>{`${item.title} — ${item.rewardXlm} XLM | Bountix`}</title>
      )}
      <Navbar
        publicKey={publicKey}
        isConnecting={isConnecting}
        onConnect={connect}
        onDisconnect={disconnect}
      />
      <main style={{ minHeight: "100vh", paddingTop: 90 }}>
        <section style={{ maxWidth: 760, margin: "0 auto", padding: "60px 24px" }}>

          {/* Back */}
          <button
            onClick={() => navigate("/#bountix-workspace")}
            style={{
              background: "none", border: "none", color: "#555",
              cursor: "pointer", fontSize: 13, display: "flex",
              alignItems: "center", gap: 6, marginBottom: 32,
              padding: 0, transition: "color 0.2s",
            }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#fff"; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "#555"; }}
          >
            ← Back to Bounties
          </button>

          {bounty.loading ? (
            <div style={{ textAlign: "center", padding: 80 }}>
              <div className="skeleton" style={{ width: "60%", height: 40, borderRadius: 8, margin: "0 auto 16px" }} />
              <div className="skeleton" style={{ width: "40%", height: 20, borderRadius: 6, margin: "0 auto 12px" }} />
              <div className="skeleton" style={{ width: "80%", height: 100, borderRadius: 12, margin: "0 auto" }} />
            </div>
          ) : !item ? (
            <div style={{ textAlign: "center", padding: 80 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <h2 style={{ color: "#fff", marginBottom: 8 }}>Bounty not found</h2>
              <p style={{ color: "#666" }}>This bounty may have been removed or the ID is invalid.</p>
              <button className="btn-primary" style={{ marginTop: 24, cursor: "pointer" }} onClick={() => navigate("/")}>
                Go to Homepage
              </button>
            </div>
          ) : (
            <>
              {/* Header card */}
              <div style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 24, padding: "32px 36px", marginBottom: 24,
              }}>
                {/* Status + Category row */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                  <span style={{
                    fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 700,
                    background: `${statusColor}18`, border: `1px solid ${statusColor}40`,
                    color: statusColor, textTransform: "uppercase", letterSpacing: "1px",
                  }}>
                    {item.status}
                  </span>
                  <span style={{ fontSize: 12, color: "#555" }}>Bounty #{item.id}</span>
                  <span style={{ fontSize: 12, color: "#555" }}>•</span>
                  <span style={{ fontSize: 12, color: "#555" }}>{timeLeft(item.deadline)}</span>
                </div>

                {/* Title */}
                <h1 style={{
                  fontSize: "clamp(22px, 4vw, 34px)", fontWeight: 700,
                  letterSpacing: "-0.5px", color: "#fff",
                  fontFamily: "var(--font-family-heading)", marginBottom: 16, lineHeight: 1.2,
                }}>
                  {item.title}
                </h1>

                {/* Description */}
                <p style={{ fontSize: 15, color: "#888", lineHeight: 1.8, marginBottom: 28 }}>
                  {item.description}
                </p>

                {/* Timeline */}
                <BountyTimeline status={item.status} />

                {/* Meta grid */}
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: 16, marginTop: 28,
                }}>
                  {[
                    { label: "Reward", value: `${item.rewardXlm} XLM`, highlight: true },
                    { label: "Posted by", value: addr(item.poster) },
                    { label: "Hunter", value: item.hunter ? addr(item.hunter) : "—" },
                    { label: "Deadline", value: new Date(item.deadline * 1000).toLocaleDateString() },
                  ].map((m) => (
                    <div key={m.label} style={{
                      padding: "14px 18px", borderRadius: 12,
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}>
                      <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>
                        {m.label}
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: m.highlight ? "#34d399" : "#ccc", fontFamily: m.highlight ? "monospace" : undefined }}>
                        {m.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Hunter reputation */}
                {item.hunter && (
                  <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 12, color: "#555" }}>Hunter reputation:</span>
                    <ReputationBadge address={item.hunter} size="sm" showScore />
                  </div>
                )}

                {/* Proof link */}
                {item.proofLink && (
                  <div style={{
                    marginTop: 20, padding: "12px 16px", borderRadius: 12,
                    background: "rgba(129,140,248,0.06)", border: "1px solid rgba(129,140,248,0.15)",
                  }}>
                    <div style={{ fontSize: 11, color: "#555", marginBottom: 6, textTransform: "uppercase", letterSpacing: "1px" }}>
                      Submitted Proof
                    </div>
                    <a
                      href={item.proofLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 13, color: "#818cf8", wordBreak: "break-all" }}
                    >
                      {item.proofLink}
                    </a>
                  </div>
                )}
              </div>

              {/* Share card */}
              <div style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16, padding: "20px 24px", marginBottom: 24,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                flexWrap: "wrap", gap: 12,
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#ccc", marginBottom: 4 }}>
                    Share this bounty
                  </div>
                  <div style={{ fontSize: 12, color: "#555" }}>
                    {window.location.href.slice(0, 50)}...
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={handleCopy}
                    style={{
                      padding: "8px 18px", borderRadius: 10, cursor: "pointer",
                      background: copied ? "rgba(52,211,153,0.12)" : "rgba(255,255,255,0.05)",
                      border: `1px solid ${copied ? "rgba(52,211,153,0.25)" : "rgba(255,255,255,0.1)"}`,
                      color: copied ? "#34d399" : "#ccc", fontSize: 13, fontWeight: 600,
                      transition: "all 0.2s",
                    }}
                  >
                    {copied ? "✓ Copied!" : "📋 Copy Link"}
                  </button>
                  <button
                    onClick={handleTweet}
                    style={{
                      padding: "8px 18px", borderRadius: 10, cursor: "pointer",
                      background: "rgba(29,161,242,0.08)",
                      border: "1px solid rgba(29,161,242,0.2)",
                      color: "#38bdf8", fontSize: 13, fontWeight: 600,
                    }}
                  >
                    𝕏 Tweet
                  </button>
                </div>
              </div>

              {/* Action card */}
              <div style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16, padding: "24px",
              }}>
                {!publicKey ? (
                  <div style={{ textAlign: "center" }}>
                    <p style={{ color: "#666", marginBottom: 16, fontSize: 14 }}>
                      Connect your wallet to interact with this bounty
                    </p>
                    <button className="btn-primary" onClick={connect} style={{ cursor: "pointer" }}>
                      Connect Wallet
                    </button>
                  </div>
                ) : canClaim ? (
                  <div style={{ textAlign: "center" }}>
                    <p style={{ color: "#888", marginBottom: 16, fontSize: 14 }}>
                      You can claim this bounty and earn {item.rewardXlm} XLM on approval.
                    </p>
                    <button
                      className="btn-primary"
                      onClick={() => bounty.claim(item.id)}
                      disabled={bounty.txStatus === "pending"}
                      style={{ cursor: "pointer" }}
                    >
                      {bounty.txStatus === "pending" ? "Processing..." : "🎯 Claim Bounty"}
                    </button>
                  </div>
                ) : canApprove ? (
                  <div style={{ textAlign: "center", display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                    <button className="btn-primary" onClick={() => bounty.approve(item.id)} style={{ cursor: "pointer" }}>
                      ✅ Approve & Pay Hunter
                    </button>
                    <button
                      style={{
                        padding: "10px 22px", borderRadius: 10, cursor: "pointer",
                        background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                        color: "#f87171", fontSize: 14, fontWeight: 600,
                      }}
                      onClick={() => bounty.reject(item.id)}
                    >
                      ❌ Reject
                    </button>
                  </div>
                ) : isPoster ? (
                  <p style={{ textAlign: "center", color: "#555", fontSize: 14 }}>
                    You posted this bounty. Waiting for a hunter to submit proof.
                  </p>
                ) : isHunter && item.status === "CLAIMED" ? (
                  <div style={{ textAlign: "center" }}>
                    <p style={{ color: "#888", marginBottom: 16, fontSize: 14 }}>You claimed this. Submit your proof to get paid.</p>
                    <button className="btn-primary" onClick={() => navigate("/#bountix-workspace")} style={{ cursor: "pointer" }}>
                      Submit Proof →
                    </button>
                  </div>
                ) : (
                  <p style={{ textAlign: "center", color: "#555", fontSize: 14 }}>
                    This bounty is {item.status.toLowerCase()}.
                  </p>
                )}
              </div>
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
