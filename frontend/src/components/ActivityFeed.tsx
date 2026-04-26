import type { ContractEventItem } from "../hooks/useContractEvents";

interface ActivityFeedProps {
  events: ContractEventItem[];
  contractReady: boolean;
}

const EVENT_META = [
  { match: "POSTED", symbol: "+", label: "Bounty posted" },
  { match: "CLAIMED", symbol: ">", label: "Bounty claimed" },
  { match: "SUBMITTED", symbol: "~", label: "Proof submitted" },
  { match: "APPROVED", symbol: "*", label: "Bounty approved" },
  { match: "REJECTED", symbol: "!", label: "Bounty rejected" },
  { match: "CANCELLED", symbol: "-", label: "Bounty cancelled" },
];

function truncateAddress(value: string): string {
  if (value.length < 12) {
    return value;
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function getEventDisplay(event: ContractEventItem): { symbol: string; label: string } {
  const match = EVENT_META.find((item) => event.topic.toUpperCase().includes(item.match));
  if (match) {
    return { symbol: match.symbol, label: match.label };
  }

  return { symbol: ".", label: event.topic || "Contract event" };
}

function formatTimeAgo(timestamp: string): string {
  const value = Date.parse(timestamp);
  if (Number.isNaN(value)) {
    return "just now";
  }

  const deltaSeconds = Math.max(0, Math.floor((Date.now() - value) / 1000));
  if (deltaSeconds < 60) {
    return `${deltaSeconds}s ago`;
  }

  const minutes = Math.floor(deltaSeconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  return `${Math.floor(hours / 24)}d ago`;
}

export default function ActivityFeed({ events, contractReady }: ActivityFeedProps) {
  const items = events.slice(-20).reverse();

  return (
    <aside className="feed-panel">
      <div className="feed-header">
        <div>
          <p className="eyebrow">Activity feed</p>
          <h2>Live contract stream</h2>
        </div>
        <span className={`live-pill ${contractReady ? "is-live" : ""}`}>
          {contractReady ? "Polling" : "Missing contract"}
        </span>
      </div>

      {!contractReady ? (
        <p className="empty-state">
          Add `VITE_BOUNTY_CONTRACT_ID` in `frontend/.env` to load on-chain activity.
        </p>
      ) : null}

      {contractReady && items.length === 0 ? (
        <p className="empty-state">No events yet. The feed will update automatically.</p>
      ) : null}

      <div className="feed-list">
        {items.map((event) => {
          const display = getEventDisplay(event);
          return (
            <div key={event.id} className="feed-item">
              <span className="feed-symbol">{display.symbol}</span>
              <div>
                <p className="feed-title">{display.label}</p>
                <p className="feed-meta">
                  {truncateAddress(event.actor || event.txHash)} · {formatTimeAgo(event.ledgerClosedAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
