import { useScrollReveal } from "../hooks/useScrollReveal";
import WalletButton from "./WalletButton";
import BalanceDisplay from "./BalanceDisplay";
import SendForm from "./SendForm";

interface DashboardProps {
  publicKey: string | null;
  isConnecting: boolean;
  error: string | null;
  balance: string | null;
  balanceLoading: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onTxSuccess: () => void;
  refreshCounter: number;
}

export default function Dashboard({ publicKey, isConnecting, error, balance, balanceLoading, onConnect, onDisconnect, onTxSuccess, refreshCounter }: DashboardProps) {
  const [leftRef, leftVis] = useScrollReveal(0.2);
  const [rightRef, rightVis] = useScrollReveal(0.15);

  return (
    <section id="dashboard" className="section-padding" style={{ position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(17,17,17,0.3) 0%, rgba(5,5,5,0) 100%)", pointerEvents: "none" }} />
      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }} className="dashboard-grid">
          {/* Left */}
          <div ref={leftRef} style={{ paddingTop: 20, opacity: leftVis ? 1 : 0, transform: leftVis ? "translateX(0)" : "translateX(-40px)", transition: "all 0.7s ease" }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", color: "#555", marginBottom: 12 }}>Dashboard</div>
            <h2 style={{ fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 700, letterSpacing: "-1px", marginBottom: 20, lineHeight: 1.15, color: "#fff" }}>
              All-in-One Web3 ALM Dashboard
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: "#666", marginBottom: 32, maxWidth: 440 }}>
              The Stellar Wallet dashboard gives you complete control over your digital assets. Connect your Freighter wallet, view balances, and send XLM — all in one place.
            </p>
            <a href="#dashboard" className="btn-outline">Manage Your Portfolio</a>
            <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { icon: "⚡", text: "Instant XLM Transactions" },
                { icon: "🔒", text: "Freighter Wallet Security" },
                { icon: "📈", text: "Real-time Balance Updates" },
              ].map((item) => (
                <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{item.icon}</div>
                  <span style={{ fontSize: 14, color: "#999" }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div ref={rightRef} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 24, padding: 28, position: "relative", overflow: "hidden", opacity: rightVis ? 1 : 0, transform: rightVis ? "translateX(0)" : "translateX(40px)", transition: "all 0.7s ease 0.15s" }}>
            <div style={{ position: "absolute", top: -100, right: -100, width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)", pointerEvents: "none" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, position: "relative" }}>
              <div>
                <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>Wallet Overview</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", fontFamily: "var(--font-family-heading)" }}>{publicKey ? "Connected" : "Not Connected"}</div>
              </div>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: publicKey ? "#34d399" : "#555", boxShadow: publicKey ? "0 0 12px rgba(52,211,153,0.5)" : "none" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "relative" }}>
              <WalletButton publicKey={publicKey} isConnecting={isConnecting} error={error} onConnect={onConnect} onDisconnect={onDisconnect} />
              {publicKey && <BalanceDisplay balance={balance} loading={balanceLoading} publicKey={publicKey} />}
              {publicKey && <SendForm publicKey={publicKey} onSuccess={onTxSuccess} key={refreshCounter} />}
            </div>
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 768px) { .dashboard-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}
