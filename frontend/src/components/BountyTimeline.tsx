import type { BountyItem } from "../lib/bountyContract";

interface BountyTimelineProps {
  status: BountyItem["status"];
  compact?: boolean;
}

const STEPS: Array<{
  key: BountyItem["status"] | "START";
  label: string;
  icon: string;
}> = [
  { key: "OPEN",      label: "Open",      icon: "📢" },
  { key: "CLAIMED",   label: "Claimed",   icon: "🎯" },
  { key: "SUBMITTED", label: "Submitted", icon: "📋" },
  { key: "APPROVED",  label: "Approved",  icon: "✅" },
];

const STATUS_ORDER: Record<string, number> = {
  OPEN: 0,
  CLAIMED: 1,
  SUBMITTED: 2,
  APPROVED: 3,
  REJECTED: 2,
  CANCELLED: 0,
  EXPIRED: 0,
};

export default function BountyTimeline({ status, compact = false }: BountyTimelineProps) {
  const currentIdx = STATUS_ORDER[status] ?? 0;
  const isTerminal = status === "APPROVED" || status === "REJECTED" || status === "CANCELLED" || status === "EXPIRED";
  const isNegative = status === "REJECTED" || status === "CANCELLED" || status === "EXPIRED";
  const isDisputed = status === "REJECTED";

  if (compact) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
        {STEPS.map((step, i) => {
          const done = i < currentIdx || (i === currentIdx && isTerminal && !isNegative);
          const active = i === currentIdx && !isTerminal;
          const failed = i === currentIdx && isNegative;
          return (
            <div key={step.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span
                style={{
                  fontSize: 10,
                  padding: "2px 7px",
                  borderRadius: 20,
                  fontWeight: 600,
                  background: done ? "rgba(52,211,153,0.12)" : active ? "rgba(99,102,241,0.12)" : failed ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.04)",
                  color: done ? "#34d399" : active ? "#818cf8" : failed ? "#f87171" : "#555",
                  border: `1px solid ${done ? "rgba(52,211,153,0.2)" : active ? "rgba(99,102,241,0.25)" : failed ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)"}`,
                  whiteSpace: "nowrap",
                }}
              >
                {done ? "✓" : active ? "●" : failed ? "✗" : "○"} {step.label}
              </span>
              {i < STEPS.length - 1 && (
                <span style={{ color: "#333", fontSize: 10 }}>→</span>
              )}
            </div>
          );
        })}
        {isNegative && (
          <span style={{ fontSize: 10, color: "#f87171", fontWeight: 600, marginLeft: 4 }}>
            ({status === "REJECTED" ? "Rejected" : status === "CANCELLED" ? "Cancelled" : "Expired"})
          </span>
        )}
      </div>
    );
  }

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>
        Progress
      </div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
        {STEPS.map((step, i) => {
          const done = i < currentIdx || (i === currentIdx && isTerminal && !isNegative);
          const active = i === currentIdx && !isTerminal;
          const failed = i === currentIdx && isNegative;
          const future = i > currentIdx;

          const dotColor = done ? "#34d399" : active ? "#818cf8" : failed ? "#f87171" : "#2a2a2a";
          const dotBorder = done ? "#34d399" : active ? "#818cf8" : failed ? "#f87171" : "#333";
          const lineColor = done ? "#34d399" : "#222";

          return (
            <div key={step.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, position: "relative" }}>
              {/* connector line left */}
              {i > 0 && (
                <div style={{
                  position: "absolute",
                  left: 0,
                  top: 11,
                  width: "50%",
                  height: 2,
                  background: done || active ? lineColor : "#1a1a1a",
                  transition: "background 0.3s",
                }} />
              )}
              {/* connector line right */}
              {i < STEPS.length - 1 && (
                <div style={{
                  position: "absolute",
                  right: 0,
                  top: 11,
                  width: "50%",
                  height: 2,
                  background: done && !active ? "#34d399" : "#1a1a1a",
                  transition: "background 0.3s",
                }} />
              )}
              {/* dot */}
              <div style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                border: `2px solid ${dotBorder}`,
                background: done ? "#34d399" : active ? "rgba(129,140,248,0.15)" : failed ? "rgba(239,68,68,0.15)" : "#111",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                position: "relative",
                zIndex: 1,
                transition: "all 0.3s",
                boxShadow: active ? "0 0 12px rgba(129,140,248,0.4)" : done ? "0 0 8px rgba(52,211,153,0.3)" : "none",
              }}>
                {done ? "✓" : active ? step.icon : failed ? "✗" : ""}
              </div>
              {/* label */}
              <div style={{
                marginTop: 6,
                fontSize: 10,
                fontWeight: active || done ? 600 : 400,
                color: done ? "#34d399" : active ? "#818cf8" : failed ? "#f87171" : "#444",
                textAlign: "center",
                whiteSpace: "nowrap",
              }}>
                {step.label}
              </div>
            </div>
          );
        })}
      </div>
      {isNegative && (
        <div style={{
          marginTop: 10,
          padding: "6px 12px",
          borderRadius: 8,
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.2)",
          fontSize: 12,
          color: "#f87171",
          textAlign: "center",
        }}>
          {status === "REJECTED" ? "❌ Submission was rejected" : status === "CANCELLED" ? "🚫 Bounty was cancelled" : "⏰ Bounty expired"}
        </div>
      )}
    </div>
  );
}
