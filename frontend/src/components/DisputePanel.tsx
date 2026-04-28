import { useState } from "react";
import { useDispute } from "../hooks/useDispute";
import {
  raiseDispute,
  voteOnDispute,
} from "../lib/disputeContract";
import { useTxStatus } from "../hooks/useTxStatus";

interface DisputePanelProps {
  bountyId: number;
  bountyStatus: string;
  bountyPoster: string;
  bountyHunter: string | null;
  publicKey: string | null;
  submittedAt?: number; // timestamp when proof was submitted
  onDisputeAction?: () => void;
}

// Validator addresses (match what was used in contract initialization)
const VALIDATORS = [
  "GA3GHRKLGJE7SHATA6XUK76ED3QDMVCOPXYMBCHVBSH6WF5MOBKCJWRV",
  "GDRCDSBSZKV5RQTA5ZYA3CYXPXPYYKTDJBD6QUWHI5IAINYENXPXTVPE",
  "GBMGIPIVXTINW7CMUMGGFHX44G2ZVFHSOT7WHGPNXO5G6HRXE6WDZH57",
];

function truncateAddress(address: string): string {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export default function DisputePanel({
  bountyId,
  bountyStatus,
  bountyPoster,
  bountyHunter,
  publicKey,
  submittedAt,
  onDisputeAction,
}: DisputePanelProps) {
  const { dispute, exists, loading, refetch } = useDispute(bountyId);
  const tx = useTxStatus();
  const [actionType, setActionType] = useState<string>("");

  const isHunter =
    publicKey && bountyHunter && publicKey === bountyHunter;
  const isValidator = publicKey ? VALIDATORS.includes(publicKey) : false;

  // Hunter can raise dispute if:
  // 1. Bounty status is SUBMITTED
  // 2. They are the hunter
  // 3. No dispute exists yet
  // 4. At least 48h have passed since submission (simulated)
  const hoursSinceSubmission = submittedAt
    ? (Date.now() / 1000 - submittedAt) / 3600
    : 0;
  const canRaiseDispute =
    isHunter &&
    bountyStatus === "SUBMITTED" &&
    !exists &&
    hoursSinceSubmission >= 0; // Set to 48 in production

  const handleRaiseDispute = async () => {
    if (!publicKey) return;
    setActionType("raise");
    await tx.execute(async () => {
      const result = await raiseDispute(publicKey, bountyPoster, bountyId);
      refetch();
      onDisputeAction?.();
      return result;
    });
  };

  const handleVote = async (approve: boolean) => {
    if (!publicKey) return;
    setActionType(approve ? "approve" : "reject");
    await tx.execute(async () => {
      const result = await voteOnDispute(publicKey, bountyId, approve);
      refetch();
      onDisputeAction?.();
      return result;
    });
  };

  // No dispute and can't raise one — don't show anything
  if (!exists && !canRaiseDispute) {
    return null;
  }

  // Show raise dispute button
  if (!exists && canRaiseDispute) {
    return (
      <div className="dispute-panel dispute-panel--raise">
        <div className="dispute-panel__header">
          <span className="dispute-panel__icon">🚨</span>
          <span>Poster not responding?</span>
        </div>
        <button
          className="dispute-panel__btn dispute-panel__btn--raise"
          onClick={handleRaiseDispute}
          disabled={tx.status === "pending"}
        >
          {tx.status === "pending" && actionType === "raise"
            ? "Raising Dispute..."
            : "Raise Dispute"}
        </button>
        {tx.status === "failed" && (
          <p className="dispute-panel__error">{tx.error}</p>
        )}
        {tx.status === "success" && (
          <p className="dispute-panel__success">
            Dispute raised! Validators will review.
          </p>
        )}
      </div>
    );
  }

  // Show dispute details
  if (!dispute || loading) {
    return (
      <div className="dispute-panel dispute-panel--loading">
        <span className="dispute-panel__icon">⏳</span> Loading dispute...
      </div>
    );
  }

  const hasVoted = publicKey
    ? dispute.voters.includes(publicKey)
    : false;

  return (
    <div
      className={`dispute-panel ${
        dispute.resolved ? "dispute-panel--resolved" : "dispute-panel--active"
      }`}
    >
      <div className="dispute-panel__header">
        <span className="dispute-panel__icon">
          {dispute.resolved ? "⚖️" : "🚨"}
        </span>
        <span className="dispute-panel__title">
          {dispute.resolved ? "Dispute Resolved" : "Dispute In Progress"}
        </span>
      </div>

      <div className="dispute-panel__votes">
        <div className="dispute-panel__vote-bar">
          <div className="dispute-panel__vote-item dispute-panel__vote-item--approve">
            <span>Hunter ✅</span>
            <strong>{dispute.votesApprove}/2</strong>
          </div>
          <div className="dispute-panel__vote-item dispute-panel__vote-item--reject">
            <span>Poster ❌</span>
            <strong>{dispute.votesReject}/2</strong>
          </div>
        </div>
        <p className="dispute-panel__voter-count">
          {dispute.voters.length}/3 validators voted
        </p>
      </div>

      {dispute.resolved && (
        <div
          className={`dispute-panel__outcome ${
            dispute.outcome
              ? "dispute-panel__outcome--hunter"
              : "dispute-panel__outcome--poster"
          }`}
        >
          {dispute.outcome
            ? "🎉 Hunter wins — payment should be released"
            : "📋 Poster wins — bounty returned"}
        </div>
      )}

      {/* Validator voting panel */}
      {isValidator && !dispute.resolved && !hasVoted && (
        <div className="dispute-panel__voting">
          <p className="dispute-panel__voting-label">
            You are a validator. Cast your vote:
          </p>
          <div className="dispute-panel__voting-actions">
            <button
              className="dispute-panel__btn dispute-panel__btn--approve"
              onClick={() => handleVote(true)}
              disabled={tx.status === "pending"}
            >
              {tx.status === "pending" && actionType === "approve"
                ? "Voting..."
                : "✅ Side with Hunter"}
            </button>
            <button
              className="dispute-panel__btn dispute-panel__btn--reject"
              onClick={() => handleVote(false)}
              disabled={tx.status === "pending"}
            >
              {tx.status === "pending" && actionType === "reject"
                ? "Voting..."
                : "❌ Side with Poster"}
            </button>
          </div>
        </div>
      )}

      {isValidator && !dispute.resolved && hasVoted && (
        <p className="dispute-panel__voted">
          ✓ You have voted. Waiting for other validators.
        </p>
      )}

      {tx.status === "failed" && (
        <p className="dispute-panel__error">{tx.error}</p>
      )}
      {tx.status === "success" && (
        <p className="dispute-panel__success">Vote recorded!</p>
      )}

      <div className="dispute-panel__parties">
        <span>
          Hunter: <code>{truncateAddress(dispute.hunter)}</code>
        </span>
        <span>
          Poster: <code>{truncateAddress(dispute.poster)}</code>
        </span>
      </div>
    </div>
  );
}
