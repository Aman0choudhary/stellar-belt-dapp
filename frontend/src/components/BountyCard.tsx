import { useState } from "react";
import type { BountyItem } from "../lib/bountyContract";
import Countdown from "./Countdown";

interface BountyCardProps {
  bounty: BountyItem;
  publicKey: string | null;
  busy?: boolean;
  onClaim: (bountyId: number) => Promise<unknown> | void;
  onOpenProof: (bounty: BountyItem) => void;
  onApprove: (bountyId: number) => Promise<unknown> | void;
  onReject: (bountyId: number) => Promise<unknown> | void;
  onCancel: (bountyId: number) => Promise<unknown> | void;
}

const STATUS_LABELS: Record<BountyItem["status"], string> = {
  OPEN: "Open",
  CLAIMED: "Claimed",
  SUBMITTED: "Submitted",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

function addr(a: string | null): string {
  if (!a) return "—";
  return `${a.slice(0, 4)}…${a.slice(-4)}`;
}

// deadlineStr removed — using <Countdown> component instead

/* ------------------------------------------------------------------ */
/* Figure out the "next step" message and who needs to act             */
/* ------------------------------------------------------------------ */
function getNextStep(
  bounty: BountyItem,
  isPoster: boolean,
  isHunter: boolean
): { text: string; color: string; bg: string; border: string } | null {
  switch (bounty.status) {
    case "OPEN":
      if (isPoster) return { text: "⏳ Waiting for a hunter to claim", color: "#fde68a", bg: "rgba(250,204,21,0.06)", border: "rgba(250,204,21,0.15)" };
      return { text: "Available to claim", color: "#86efac", bg: "rgba(74,222,128,0.06)", border: "rgba(74,222,128,0.15)" };
    case "CLAIMED":
      if (isHunter) return { text: "🔒 You claimed this — submit your proof below", color: "#fbbf24", bg: "rgba(250,204,21,0.08)", border: "rgba(250,204,21,0.2)" };
      if (isPoster) return { text: `🔒 Claimed by ${addr(bounty.hunter)} — waiting for proof submission`, color: "#fde68a", bg: "rgba(250,204,21,0.06)", border: "rgba(250,204,21,0.15)" };
      return { text: `🔒 Claimed by ${addr(bounty.hunter)}`, color: "#fde68a", bg: "rgba(250,204,21,0.06)", border: "rgba(250,204,21,0.15)" };
    case "SUBMITTED":
      if (isPoster) return { text: "📋 Proof submitted — review and approve or reject below", color: "#93c5fd", bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.2)" };
      if (isHunter) return { text: "📋 Proof submitted — waiting for poster review", color: "#93c5fd", bg: "rgba(96,165,250,0.06)", border: "rgba(96,165,250,0.15)" };
      return { text: "📋 Proof under review", color: "#93c5fd", bg: "rgba(96,165,250,0.06)", border: "rgba(96,165,250,0.15)" };
    case "APPROVED":
      return { text: "✅ Completed — reward paid to hunter", color: "#86efac", bg: "rgba(74,222,128,0.06)", border: "rgba(74,222,128,0.15)" };
    case "REJECTED":
      return { text: "❌ Submission rejected — bounty re-opened", color: "#fca5a5", bg: "rgba(248,113,113,0.06)", border: "rgba(248,113,113,0.15)" };
    case "CANCELLED":
      return { text: "🚫 Cancelled by poster", color: "#fca5a5", bg: "rgba(248,113,113,0.06)", border: "rgba(248,113,113,0.15)" };
    default:
      return null;
  }
}

export default function BountyCard({
  bounty,
  publicKey,
  busy = false,
  onClaim,
  onOpenProof,
  onApprove,
  onReject,
  onCancel,
}: BountyCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const pk = (publicKey ?? "").trim();
  const isPoster = !!pk && pk === bounty.poster.trim();
  const isHunter = !!pk && bounty.hunter !== null && pk === bounty.hunter.trim();

  const nextStep = getNextStep(bounty, isPoster, isHunter);

  // Actions that should be visible
  const canClaim = bounty.status === "OPEN" && !!pk && !isPoster;
  const canCancel = bounty.status === "OPEN" && isPoster;
  const canSubmitProof = bounty.status === "CLAIMED" && isHunter;
  const canApproveReject = bounty.status === "SUBMITTED" && isPoster;
  const hasActions = canClaim || canCancel || canSubmitProof || canApproveReject;

  return (
    <article className="bountix-card" style={{ padding: 16, gap: 0 }}>

      {/* ── ROW 1: Status + Title + Reward + Deadline ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          cursor: "pointer",
        }}
        onClick={() => setDetailsOpen((v) => !v)}
      >
        <span
          className={`status-badge status-${bounty.status.toLowerCase()}`}
          style={{ fontSize: 11, padding: "3px 8px", flexShrink: 0 }}
        >
          {STATUS_LABELS[bounty.status]}
        </span>

        {/* Role tag */}
        {isPoster && (
          <span style={{ fontSize: 10, color: "#7dd3a9", background: "rgba(125,211,169,0.1)", padding: "2px 6px", borderRadius: 4, flexShrink: 0 }}>
            You posted
          </span>
        )}
        {isHunter && (
          <span style={{ fontSize: 10, color: "#fbbf24", background: "rgba(250,204,21,0.1)", padding: "2px 6px", borderRadius: 4, flexShrink: 0 }}>
            You claimed
          </span>
        )}

        <span
          style={{
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {bounty.title}
        </span>

        <span style={{ flexShrink: 0, color: "#7dd3a9", fontWeight: 700, fontSize: 14, fontFamily: "var(--font-family-heading)" }}>
          {bounty.rewardXlm.toFixed(1)} XLM
        </span>

        <Countdown deadlineTs={bounty.deadline} />

        <span style={{ flexShrink: 0, fontSize: 10, color: "#555", transition: "transform 0.2s", transform: detailsOpen ? "rotate(180deg)" : "rotate(0)" }}>
          ▼
        </span>
      </div>

      {/* ── ROW 2: Next-step banner (ALWAYS visible) ── */}
      {nextStep && (
        <div
          style={{
            marginTop: 10,
            fontSize: 12,
            padding: "7px 12px",
            borderRadius: 6,
            background: nextStep.bg,
            border: `1px solid ${nextStep.border}`,
            color: nextStep.color,
            lineHeight: 1.5,
          }}
        >
          {nextStep.text}
        </div>
      )}

      {/* ── ROW 3: Action buttons (ALWAYS visible when user has actions) ── */}
      {hasActions && (
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          {canClaim && (
            <button className="btn-solid" disabled={busy} onClick={() => void onClaim(bounty.id)}>
              Claim Bounty
            </button>
          )}

          {canCancel && (
            <button className="btn-ghost" disabled={busy} onClick={() => void onCancel(bounty.id)}>
              Cancel Bounty
            </button>
          )}

          {canSubmitProof && (
            <button
              className="btn-solid"
              disabled={busy}
              onClick={() => onOpenProof(bounty)}
              style={{ background: "#fbbf24", color: "#1c1207" }}
            >
              Submit Proof
            </button>
          )}

          {canApproveReject && (
            <>
              <button
                className="btn-solid"
                disabled={busy}
                onClick={() => void onApprove(bounty.id)}
                style={{ background: "#34d399", color: "#052012" }}
              >
                ✓ Approve &amp; Pay
              </button>
              <button
                className="btn-ghost"
                disabled={busy}
                onClick={() => void onReject(bounty.id)}
                style={{ borderColor: "rgba(248,113,113,0.4)", color: "#fca5a5" }}
              >
                ✕ Reject
              </button>
            </>
          )}
        </div>
      )}

      {/* ── Proof link (always visible when exists) ── */}
      {bounty.proofLink && (
        <a
          className="inline-link"
          href={bounty.proofLink}
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: 12, marginTop: 8, display: "inline-block" }}
        >
          📎 View submitted proof →
        </a>
      )}

      {/* ── EXPANDABLE: description + meta (click header to toggle) ── */}
      {detailsOpen && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: "1px solid rgba(125,211,169,0.1)",
            display: "grid",
            gap: 10,
          }}
        >
          <p className="card-description" style={{ fontSize: 13, lineHeight: 1.6 }}>
            {bounty.description}
          </p>

          <div style={{ display: "flex", gap: 20, fontSize: 12, flexWrap: "wrap" }}>
            <span>
              <span style={{ color: "#888" }}>Poster </span>
              <span style={{ color: "#fff", fontFamily: "monospace" }} title={bounty.poster}>{addr(bounty.poster)}</span>
            </span>
            <span>
              <span style={{ color: "#888" }}>Hunter </span>
              <span style={{ color: "#fff", fontFamily: "monospace" }} title={bounty.hunter ?? ""}>{addr(bounty.hunter)}</span>
            </span>
            <span>
              <span style={{ color: "#888" }}>Reward </span>
              <span style={{ color: "#7dd3a9" }}>{bounty.rewardXlm.toFixed(2)} XLM</span>
            </span>
            <span>
              <span style={{ color: "#888" }}>Deadline </span>
              <Countdown deadlineTs={bounty.deadline} />
            </span>
          </div>
        </div>
      )}
    </article>
  );
}
