import { useMemo, useState } from "react";
import { useBounties } from "../hooks/useBounties";
import { useWallet } from "../hooks/useWallet";
import { useBalance } from "../hooks/useBalance";
import BountyCard from "../components/BountyCard";
import BountyCardSkeleton from "../components/BountyCardSkeleton";
import ProofSubmitModal from "../components/ProofSubmitModal";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import type { BountyItem } from "../lib/bountyContract";

type DashTab = "hunter" | "poster";

export default function MyDashboard() {
  const { publicKey, isConnecting, connect, disconnect } = useWallet();
  const { balance } = useBalance(publicKey);
  const bounty = useBounties(publicKey);
  const [tab, setTab] = useState<DashTab>("hunter");
  const [proofBounty, setProofBounty] = useState<BountyItem | null>(null);

  const pk = (publicKey ?? "").trim();

  /* ── Computed data ────────────────────────── */
  const hunterBounties = useMemo(
    () => bounty.bounties.filter((b) => b.hunter?.trim() === pk),
    [bounty.bounties, pk]
  );

  const posterBounties = useMemo(
    () => bounty.bounties.filter((b) => b.poster.trim() === pk),
    [bounty.bounties, pk]
  );

  // Hunter stats
  const hunterActiveClaims = hunterBounties.filter(
    (b) => b.status === "CLAIMED" || b.status === "SUBMITTED"
  );
  const hunterCompleted = hunterBounties.filter((b) => b.status === "APPROVED");
  const hunterSubmissions = hunterBounties.filter((b) => b.status === "SUBMITTED");
  const totalEarned = hunterCompleted.reduce((sum, b) => sum + b.rewardXlm, 0);

  // Poster stats
  const posterNeedsReview = posterBounties.filter((b) => b.status === "SUBMITTED");
  const posterActive = posterBounties.filter(
    (b) => b.status === "OPEN" || b.status === "CLAIMED"
  );
  const posterHistory = posterBounties.filter(
    (b) => b.status === "APPROVED" || b.status === "CANCELLED"
  );
  const totalPaidOut = posterBounties
    .filter((b) => b.status === "APPROVED")
    .reduce((sum, b) => sum + b.rewardXlm, 0);
  const totalPosted = posterBounties.reduce((sum, b) => sum + b.rewardXlm, 0);

  function renderCards(items: BountyItem[], emptyMsg: string) {
    if (bounty.loading) {
      return (
        <div className="card-grid">
          {Array.from({ length: 3 }).map((_, i) => (
            <BountyCardSkeleton key={i} />
          ))}
        </div>
      );
    }
    if (items.length === 0) {
      return (
        <div className="empty-panel" style={{ minHeight: 120 }}>
          <p>{emptyMsg}</p>
        </div>
      );
    }
    return (
      <div className="card-grid">
        {items.map((item) => (
          <BountyCard
            key={item.id}
            bounty={item}
            publicKey={publicKey}
            busy={bounty.txStatus === "pending"}
            onClaim={bounty.claim}
            onOpenProof={setProofBounty}
            onApprove={bounty.approve}
            onReject={bounty.reject}
            onCancel={bounty.cancel}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <Navbar
        publicKey={publicKey}
        isConnecting={isConnecting}
        onConnect={connect}
        onDisconnect={disconnect}
      />
      <main className="dashboard-page">
        <div className="dashboard-page-inner">
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "#555",
              marginBottom: 8,
            }}
          >
            My Dashboard
          </div>
          <h1
            style={{
              fontSize: "clamp(28px, 3vw, 40px)",
              fontWeight: 700,
              letterSpacing: "-1px",
              color: "#fff",
              marginBottom: 8,
              fontFamily: "var(--font-family-heading)",
            }}
          >
            {tab === "hunter" ? "Hunter Dashboard" : "Poster Dashboard"}
          </h1>
          {publicKey && (
            <p style={{ fontSize: 13, color: "#666", marginBottom: 24, fontFamily: "monospace" }}>
              {publicKey.slice(0, 6)}...{publicKey.slice(-4)}
              {balance ? ` · ${parseFloat(balance).toFixed(2)} XLM` : ""}
            </p>
          )}

          {!publicKey ? (
            <div className="empty-panel" style={{ minHeight: 300 }}>
              <div>
                <h3 style={{ color: "#fff", marginBottom: 8 }}>Connect your wallet</h3>
                <p>Connect a Stellar wallet to see your hunter and poster activity.</p>
                <button className="btn-primary" style={{ marginTop: 16 }} onClick={connect}>
                  Connect Wallet
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="dashboard-tabs">
                <button
                  className={`dashboard-tab ${tab === "hunter" ? "is-active" : ""}`}
                  onClick={() => setTab("hunter")}
                >
                  🏹 Hunter View
                </button>
                <button
                  className={`dashboard-tab ${tab === "poster" ? "is-active" : ""}`}
                  onClick={() => setTab("poster")}
                >
                  📋 Poster View
                </button>
              </div>

              {tab === "hunter" ? (
                <>
                  {/* Hunter Stats */}
                  <div className="dashboard-stat-grid">
                    <div className="dashboard-stat-card">
                      <div className="label">Total Earned</div>
                      <div className="value" style={{ color: "#7dd3a9" }}>
                        {totalEarned.toFixed(2)} <span style={{ fontSize: 16 }}>XLM</span>
                      </div>
                    </div>
                    <div className="dashboard-stat-card">
                      <div className="label">Active Claims</div>
                      <div className="value">{hunterActiveClaims.length}</div>
                    </div>
                    <div className="dashboard-stat-card">
                      <div className="label">Completed</div>
                      <div className="value">{hunterCompleted.length}</div>
                    </div>
                  </div>

                  {/* Active Claims */}
                  <div className="dashboard-section-title">
                    🔒 My Active Claims
                    <span className="count">{hunterActiveClaims.length}</span>
                  </div>
                  {renderCards(hunterActiveClaims, "No active claims. Claim a bounty from the board.")}

                  {/* Submissions */}
                  <div className="dashboard-section-title" style={{ marginTop: 32 }}>
                    📋 My Submissions
                    <span className="count">{hunterSubmissions.length}</span>
                  </div>
                  {renderCards(hunterSubmissions, "No pending submissions.")}

                  {/* Completed */}
                  <div className="dashboard-section-title" style={{ marginTop: 32 }}>
                    ✅ Completed & Paid
                    <span className="count">{hunterCompleted.length}</span>
                  </div>
                  {renderCards(hunterCompleted, "No completed bounties yet.")}
                </>
              ) : (
                <>
                  {/* Poster Stats */}
                  <div className="dashboard-stat-grid">
                    <div className="dashboard-stat-card">
                      <div className="label">Total Posted</div>
                      <div className="value">{totalPosted.toFixed(2)} <span style={{ fontSize: 16 }}>XLM</span></div>
                    </div>
                    <div className="dashboard-stat-card">
                      <div className="label">Total Paid Out</div>
                      <div className="value" style={{ color: "#7dd3a9" }}>
                        {totalPaidOut.toFixed(2)} <span style={{ fontSize: 16 }}>XLM</span>
                      </div>
                    </div>
                    <div className="dashboard-stat-card">
                      <div className="label">Pending Reviews</div>
                      <div className="value" style={{ color: posterNeedsReview.length > 0 ? "#fbbf24" : "#fff" }}>
                        {posterNeedsReview.length}
                      </div>
                    </div>
                  </div>

                  {/* Needs Review */}
                  <div className="dashboard-section-title">
                    ⚠️ Needs Review
                    <span className="count">{posterNeedsReview.length}</span>
                  </div>
                  {renderCards(posterNeedsReview, "No submissions to review.")}

                  {/* Active Bounties */}
                  <div className="dashboard-section-title" style={{ marginTop: 32 }}>
                    📌 Active Bounties
                    <span className="count">{posterActive.length}</span>
                  </div>
                  {renderCards(posterActive, "No active bounties. Post one from the board!")}

                  {/* History */}
                  <div className="dashboard-section-title" style={{ marginTop: 32 }}>
                    📁 History
                    <span className="count">{posterHistory.length}</span>
                  </div>
                  {renderCards(posterHistory, "No completed or cancelled bounties.")}
                </>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />

      <ProofSubmitModal
        bounty={proofBounty}
        onClose={() => setProofBounty(null)}
        onSubmit={bounty.submit}
      />
    </>
  );
}
