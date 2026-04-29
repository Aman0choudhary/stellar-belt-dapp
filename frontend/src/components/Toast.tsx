import { useEffect, useState, useCallback, useRef } from "react";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
  icon?: string;
}

// Global toast state (singleton outside React)
type Listener = (toasts: Toast[]) => void;
let toasts: Toast[] = [];
const listeners: Set<Listener> = new Set();

function notify() {
  listeners.forEach((l) => l([...toasts]));
}

export function addToast(
  message: string,
  type: Toast["type"] = "info",
  icon?: string
) {
  const id = `${Date.now()}-${Math.random()}`;
  toasts = [{ id, message, type, icon }, ...toasts].slice(0, 5);
  notify();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  }, 4500);
}

export function useToasts(): Toast[] {
  const [state, setState] = useState<Toast[]>([...toasts]);
  useEffect(() => {
    listeners.add(setState);
    return () => { listeners.delete(setState); };
  }, []);
  return state;
}

// Hook to fire toasts from contract events
export function useEventToasts(
  events: Array<{ type: string; bountyId?: number; timestamp?: number }>,
  publicKey: string | null
) {
  const seenRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    events.forEach((ev) => {
      const key = `${ev.type}-${ev.bountyId}-${ev.timestamp}`;
      if (seenRef.current.has(key)) return;
      seenRef.current.add(key);

      if (ev.type === "BountyClaimed") {
        addToast(`Bounty #${ev.bountyId} was claimed!`, "info", "🎯");
      } else if (ev.type === "ProofSubmitted") {
        addToast(`Proof submitted for bounty #${ev.bountyId}`, "info", "📋");
      } else if (ev.type === "BountyApproved") {
        addToast(`Bounty #${ev.bountyId} approved! BNTX awarded 🏆`, "success", "✅");
      } else if (ev.type === "DisputeRaised") {
        addToast(`Dispute raised on bounty #${ev.bountyId}`, "warning", "⚠️");
      } else if (ev.type === "BountyPosted") {
        addToast(`New bounty #${ev.bountyId} posted!`, "info", "📢");
      }
    });
  }, [events, publicKey]);
}

// Toast UI component
export function ToastContainer() {
  const toasts = useToasts();
  const [exiting, setExiting] = useState<Set<string>>(new Set());

  const dismiss = useCallback((id: string) => {
    setExiting((prev) => new Set([...prev, id]));
    setTimeout(() => {
      toasts; // trigger re-render
    }, 300);
  }, [toasts]);

  if (toasts.length === 0) return null;

  const colorMap: Record<Toast["type"], { bg: string; border: string; accent: string }> = {
    success: { bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.25)", accent: "#10b981" },
    info:    { bg: "rgba(99,102,241,0.08)",  border: "rgba(99,102,241,0.25)",  accent: "#818cf8" },
    warning: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", accent: "#fbbf24" },
    error:   { bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.25)",   accent: "#f87171" },
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column-reverse",
        gap: 10,
        maxWidth: 340,
      }}
    >
      {toasts.map((t) => {
        const c = colorMap[t.type];
        return (
          <div
            key={t.id}
            className={`toast-item ${exiting.has(t.id) ? "toast-exit" : "toast-enter"}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              borderRadius: 12,
              background: c.bg,
              border: `1px solid ${c.border}`,
              backdropFilter: "blur(12px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              cursor: "pointer",
            }}
            onClick={() => dismiss(t.id)}
          >
            {t.icon && (
              <span style={{ fontSize: 18, flexShrink: 0 }}>{t.icon}</span>
            )}
            <span style={{ fontSize: 13, color: "#e5e7eb", lineHeight: 1.4, flex: 1 }}>
              {t.message}
            </span>
            <span style={{ fontSize: 16, color: "#555", flexShrink: 0 }}>×</span>
          </div>
        );
      })}
    </div>
  );
}
