import { useEffect, useState } from "react";
import { useContractEvents } from "../hooks/useContractEvents";

export default function ActivityTicker() {
  const { events } = useContractEvents();
  const [tickerItems, setTickerItems] = useState<string[]>([]);

  useEffect(() => {
    // Generate ticker items from recent events or use fallbacks if empty
    if (events.length > 0) {
      const items = events.slice(0, 10).map((e) => {
        const typeIcon =
          e.type === "BountyCreated" ? "✨" :
          e.type === "BountyClaimed" ? "🎯" :
          e.type === "ProofSubmitted" ? "📝" :
          e.type === "BountyApproved" ? "✅" :
          e.type === "ReputationAwarded" ? "🏆" : "🔔";
        
        return `${typeIcon} Bounty #${e.bountyId}: ${e.type} at ${new Date(e.timestamp).toLocaleTimeString()}`;
      });
      setTickerItems(items);
    } else {
      setTickerItems([
        "🚀 Bountix Level 6 is Live on Stellar Testnet!",
        "🎯 Claim your first bounty today to earn XLM.",
        "🏆 Build your on-chain reputation score.",
        "⚡ Gasless transactions powered by fee-bumping.",
        "✅ Fast, trustless payouts via Soroban smart contracts."
      ]);
    }
  }, [events]);

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
