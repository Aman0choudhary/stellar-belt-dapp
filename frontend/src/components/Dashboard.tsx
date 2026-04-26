import { useMemo, useState } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { useBounties } from "../hooks/useBounties";
import { useContractEvents } from "../hooks/useContractEvents";
import { getBountyContractId, type BountyItem } from "../lib/bountyContract";
import { getCounterContractId } from "../lib/contract";
import WalletButton from "./WalletButton";
import BalanceDisplay from "./BalanceDisplay";
import SendForm from "./SendForm";
import CounterPanel from "./CounterPanel";
import BountyCard from "./BountyCard";
import BountyCardSkeleton from "./BountyCardSkeleton";
import BountyForm from "./BountyForm";
import ProofSubmitModal from "./ProofSubmitModal";
import ActivityFeed from "./ActivityFeed";
import { TX_STEP_LABELS, type TxStep } from "../hooks/useTxStatus";

type FilterKey = "ALL" | "MY_POSTED" | "MY_CLAIMS" | "HISTORY";

interface DashboardProps {
  publicKey: string | null;
  walletName?: string | null;
  isConnecting: boolean;
  error: string | null;
  balance: string | null;
  balanceLoading: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onTxSuccess: () => void;
  refreshCounter: number;
}

export default function Dashboard({
  publicKey,
  walletName,
  isConnecting,
  error,
  balance,
  balanceLoading,
  onConnect,
  onDisconnect,
  onTxSuccess,
  refreshCounter,
}: DashboardProps) {
  const [leftRef, leftVis] = useScrollReveal(0.2);
  const [rightRef, rightVis] = useScrollReveal(0.15);
  const bounty = useBounties(publicKey);
  const contractId = getBountyContractId();
  const counterContractId = getCounterContractId();
  const events = useContractEvents(contractId);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("ALL");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [proofBounty, setProofBounty] = useState<BountyItem | null>(null);

  const filteredBounties = useMemo(() => {
    const query = search.trim().toLowerCase();
    const DEAD = new Set(["APPROVED", "CANCELLED", "EXPIRED"]);

    return bounty.bounties.filter((item) => {
      // "All" = everything that's still live (OPEN, CLAIMED, SUBMITTED, REJECTED)
      if (activeFilter === "ALL" && DEAD.has(item.status)) {
        return false;
      }

      // "History" = terminal states only
      if (activeFilter === "HISTORY" && !DEAD.has(item.status)) {
        return false;
      }

      if (activeFilter === "MY_POSTED" && item.poster.trim() !== (publicKey ?? "").trim()) {
        return false;
      }

      if (activeFilter === "MY_CLAIMS" && item.hunter?.trim() !== (publicKey ?? "").trim()) {
        return false;
      }

      if (!query) {
        return true;
      }

      return (
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    });
  }, [activeFilter, bounty.bounties, publicKey, search]);

  const stats = useMemo(() => {
    const totalPosted = bounty.bounties.reduce((sum, item) => sum + item.rewardXlm, 0);
    const activeHunters = new Set(
      bounty.bounties
        .filter((item) => item.hunter && (item.status === "CLAIMED" || item.status === "SUBMITTED"))
        .map((item) => item.hunter)
    ).size;

    return {
      totalBounties: bounty.bounties.length,
      totalPosted,
      activeHunters,
    };
  }, [bounty.bounties]);

  const txSummary =
    bounty.txStatus === "pending"
      ? "Transaction in progress. Check your wallet to sign."
      : bounty.txStatus === "success"
        ? "Transaction confirmed."
        : bounty.txStatus === "failed"
          ? bounty.txError || "Transaction failed."
          : null;

  const showFriendbotHint =
    !!txSummary && txSummary.toLowerCase().includes("insufficient");

  const filters: Array<{ key: FilterKey; label: string }> = [
    { key: "ALL", label: "All" },
    { key: "MY_POSTED", label: "My Posted" },
    { key: "MY_CLAIMS", label: "My Claims" },
    { key: "HISTORY", label: "History" },
  ];

  return (
    <>
      <section id="dashboard" className="section-padding" style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(17,17,17,0.3) 0%, rgba(5,5,5,0) 100%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}
            className="dashboard-grid"
          >
            <div
              ref={leftRef}
              style={{
                paddingTop: 20,
                opacity: leftVis ? 1 : 0,
                transform: leftVis ? "translateX(0)" : "translateX(-40px)",
                transition: "all 0.7s ease",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: "#555",
                  marginBottom: 12,
                }}
              >
                Dashboard
              </div>
              <h2
                style={{
                  fontSize: "clamp(28px, 3vw, 40px)",
                  fontWeight: 700,
                  letterSpacing: "-1px",
                  marginBottom: 20,
                  lineHeight: 1.15,
                  color: "#fff",
                }}
              >
                All-in-One Web3 ALM Dashboard
              </h2>
              <p
                style={{
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: "#666",
                  marginBottom: 32,
                  maxWidth: 440,
                }}
              >
                The Stellar Wallet dashboard gives you complete control over your digital assets.
                Connect your wallet, view balances, send XLM, and now manage Level 2 bounty flows
                without leaving the original interface.
              </p>
              <a href="#bountix-workspace" className="btn-outline">
                Open Bounty Workspace
              </a>
              <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { icon: "⚡", text: "Instant XLM Transactions" },
                  { icon: "🔒", text: "Multi-Wallet Testnet Access" },
                  { icon: "📈", text: "On-Chain Bounty Tracking" },
                ].map((item) => (
                  <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                      }}
                    >
                      {item.icon}
                    </div>
                    <span style={{ fontSize: 14, color: "#999" }}>{item.text}</span>
                  </div>
                ))}
              </div>

              <div
                id="bountix-workspace"
                style={{
                  marginTop: 40,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 24,
                  padding: 28,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        letterSpacing: "2px",
                        textTransform: "uppercase",
                        color: "#555",
                        marginBottom: 10,
                      }}
                    >
                      Level 2
                    </div>
                    <h3
                      style={{
                        fontSize: "clamp(24px, 2vw, 32px)",
                        fontWeight: 700,
                        color: "#fff",
                        marginBottom: 10,
                        fontFamily: "var(--font-family-heading)",
                      }}
                    >
                      Bountix Workspace
                    </h3>
                    <p style={{ color: "#777", maxWidth: 560, lineHeight: 1.7 }}>
                      Post bounties, claim work, submit proof, and follow contract activity
                      without changing the original dashboard feel.
                    </p>
                  </div>

                  {publicKey ? (
                    <button className="btn-primary" onClick={() => setFormOpen(true)}>
                      Post a Bounty
                    </button>
                  ) : null}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: 14,
                    marginTop: 24,
                  }}
                  className="bountix-stats-grid"
                >
                  {[
                    { label: "Total Bounties", value: String(stats.totalBounties) },
                    { label: "Total XLM Posted", value: stats.totalPosted.toFixed(2) },
                    { label: "Active Hunters", value: String(stats.activeHunters) },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      style={{
                        padding: 18,
                        borderRadius: 16,
                        border: "1px solid rgba(255,255,255,0.06)",
                        background: "rgba(255,255,255,0.02)",
                      }}
                    >
                      <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>{stat.label}</div>
                      <div
                        style={{
                          fontSize: 28,
                          color: "#fff",
                          fontWeight: 700,
                          fontFamily: "var(--font-family-heading)",
                        }}
                      >
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>

                {bounty.error ? <div className="banner banner-error">{bounty.error}</div> : null}
                {txSummary ? (
                  <div className={`banner ${bounty.txStatus === "failed" ? "banner-error" : "banner-info"}`}>
                    <span>{txSummary}</span>
                    {bounty.txHash ? (
                      <a
                        className="inline-link"
                        href={`https://stellar.expert/explorer/testnet/tx/${bounty.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View transaction
                      </a>
                    ) : showFriendbotHint && publicKey ? (
                      <a
                        className="inline-link"
                        href={`https://friendbot.stellar.org/?addr=${publicKey}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Fund with Friendbot
                      </a>
                    ) : null}
                  </div>
                ) : null}

                {/* TX Progress Steps */}
                {bounty.txStatus === "pending" && (
                  <div className="tx-progress">
                    {TX_STEP_LABELS.map((label, i) => {
                      const stepIdx = i as TxStep;
                      const isDone = bounty.txStep > stepIdx;
                      const isActive = bounty.txStep === stepIdx;
                      return (
                        <>
                          {i > 0 && <div className="tx-step-connector" />}
                          <div
                            key={i}
                            className={`tx-step ${isActive ? "is-active" : ""} ${isDone ? "is-done" : ""}`}
                          >
                            <div className="tx-step-dot" />
                            <span>{label}</span>
                          </div>
                        </>
                      );
                    })}
                  </div>
                )}

                <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <input
                    className="search-input"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search bounties"
                    style={{ flex: "1 1 220px", minWidth: 220 }}
                  />
                  <div className="filter-row" style={{ margin: 0 }}>
                    {filters.map((filter) => (
                      <button
                        key={filter.key}
                        className={`filter-pill ${activeFilter === filter.key ? "is-active" : ""}`}
                        onClick={() => setActiveFilter(filter.key)}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 24 }}>
                  {bounty.loading ? (
                    <div className="card-grid">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <BountyCardSkeleton key={index} />
                      ))}
                    </div>
                  ) : filteredBounties.length > 0 ? (
                    <div className="card-grid">
                      {filteredBounties.map((item) => (
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
                  ) : (
                    <div className="empty-panel" style={{ minHeight: 240 }}>
                      <div>
                        <h3 style={{ color: "#fff", marginBottom: 8 }}>No bounties match this view.</h3>
                        <p>
                          {publicKey
                            ? "Post the first one from this wallet or switch the filter."
                            : "Connect a wallet to start posting or claiming work."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div
              ref={rightRef}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 24,
                padding: 28,
                position: "relative",
                overflow: "hidden",
                opacity: rightVis ? 1 : 0,
                transform: rightVis ? "translateX(0)" : "translateX(40px)",
                transition: "all 0.7s ease 0.15s",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -100,
                  right: -100,
                  width: 250,
                  height: 250,
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 24,
                  position: "relative",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#555",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      marginBottom: 4,
                    }}
                  >
                    Wallet Overview
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: "#fff",
                      fontFamily: "var(--font-family-heading)",
                    }}
                  >
                    {publicKey ? "Connected" : "Not Connected"}
                  </div>
                </div>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: publicKey ? "#34d399" : "#555",
                    boxShadow: publicKey ? "0 0 12px rgba(52,211,153,0.5)" : "none",
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "relative" }}>
                <WalletButton
                  publicKey={publicKey}
                  walletName={walletName}
                  isConnecting={isConnecting}
                  error={error}
                  onConnect={onConnect}
                  onDisconnect={onDisconnect}
                />
                {publicKey && (
                  <BalanceDisplay balance={balance} loading={balanceLoading} publicKey={publicKey} />
                )}
                {publicKey && (
                  <SendForm publicKey={publicKey} onSuccess={onTxSuccess} key={refreshCounter} />
                )}
                {counterContractId ? <CounterPanel publicKey={publicKey} /> : null}
              </div>

              <div style={{ marginTop: 20 }}>
                <ActivityFeed events={events} contractReady={!!contractId} />
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 980px) {
            .bountix-stats-grid { grid-template-columns: 1fr !important; }
          }
          @media (max-width: 768px) {
            .dashboard-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      <BountyForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={bounty.post} />
      <ProofSubmitModal
        bounty={proofBounty}
        onClose={() => setProofBounty(null)}
        onSubmit={bounty.submit}
      />
    </>
  );
}
