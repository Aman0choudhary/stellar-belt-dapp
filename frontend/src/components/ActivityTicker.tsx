import { useMemo } from "react";
import { useBounties } from "../hooks/useBounties";
import { useWallet } from "../hooks/useWallet";

export default function ActivityTicker() {
  const { publicKey } = useWallet();
  const { bounties } = useBounties(publicKey);

  const tickerItems = useMemo(() => {
    if (bounties.length > 0) {
      return bounties.slice(0, 10).map((b) => {
        const icon =
          b.status === "OPEN" ? "✨" :
          b.status === "CLAIMED" ? "🎯" :
          b.status === "SUBMITTED" ? "📝" :
          b.status === "APPROVED" ? "✅" :
          b.status === "REJECTED" ? "❌" : "🔔";
        const addr = b.poster ? `${b.poster.slice(0, 6)}...${b.poster.slice(-4)}` : "Unknown";
        return `${icon} Bounty #${b.id} "${b.title}" by ${addr} — ${b.rewardXlm} XLM`;
      });
    }
    return [
      "🚀 Bountix Level 6 is Live on Stellar Testnet!",
      "🎯 Claim your first bounty today to earn XLM.",
      "🏆 Build your on-chain reputation score.",
      "⚡ Gasless transactions powered by fee-bumping.",
      "✅ Fast, trustless payouts via Soroban smart contracts."
    ];
  }, [bounties]);

  return (
    <div style={{
      width: "100%",
      background: "rgba(129, 140, 248, 0.1)",
      borderBottom: "1px solid rgba(129, 140, 248, 0.2)",
      overflow: "hidden",
      position: "relative",
      height: "40px",
      display: "flex",
      alignItems: "center",
      zIndex: 50,
    }}>
      <style>
        {`
          @keyframes scroll-ticker {
            0% { transform: translateX(100vw); }
            100% { transform: translateX(-100%); }
          }
          .ticker-content {
            display: flex;
            white-space: nowrap;
            animation: scroll-ticker 25s linear infinite;
            gap: 50px;
          }
          .ticker-content:hover {
            animation-play-state: paused;
          }
        `}
      </style>
      <div className="ticker-content">
        {tickerItems.map((item, i) => (
          <div key={i} style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "#818cf8",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            letterSpacing: "0.5px"
          }}>
            {item}
            <span style={{ color: "rgba(255,255,255,0.2)", marginLeft: "50px" }}>•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
