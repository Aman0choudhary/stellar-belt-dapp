import { useEffect, useMemo, useState } from "react";
import {
  getCounterContractId,
  invokeIncrement,
  readCount,
} from "../lib/contract";
import { useContractEvents } from "../hooks/useContractEvents";

type CounterTxStatus = "idle" | "pending" | "success" | "failed";

interface CounterPanelProps {
  publicKey: string | null;
}

function formatTimestamp(raw: string): string {
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return raw;
  }
  return date.toLocaleString();
}

export default function CounterPanel({ publicKey }: CounterPanelProps) {
  const contractId = getCounterContractId();
  const [count, setCount] = useState<number | null>(null);
  const [isLoadingCount, setIsLoadingCount] = useState(false);
  const [status, setStatus] = useState<CounterTxStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const events = useContractEvents(contractId);

  useEffect(() => {
    if (!publicKey || !contractId) {
      return;
    }

    let isCancelled = false;

    const refreshCount = async () => {
      await Promise.resolve();

      if (isCancelled) {
        return;
      }

      setIsLoadingCount(true);
      setError(null);

      readCount(publicKey)
        .then((value) => {
          if (!isCancelled) {
            setCount(value);
          }
        })
        .catch((readError: unknown) => {
          if (!isCancelled) {
            setError(
              readError instanceof Error
                ? readError.message
                : "Could not load contract counter."
            );
          }
        })
        .finally(() => {
          if (!isCancelled) {
            setIsLoadingCount(false);
          }
        });
    };

    void refreshCount();

    return () => {
      isCancelled = true;
    };
  }, [publicKey, contractId, txHash]);

  const displayCount = publicKey && contractId ? count : null;
  const latestEvents = useMemo(() => events.slice(-5).reverse(), [events]);

  if (!contractId) {
    return null;
  }

  const handleIncrement = async () => {
    if (!publicKey || !contractId || status === "pending") {
      return;
    }

    setStatus("pending");
    setError(null);

    try {
      const result = await invokeIncrement(publicKey);
      setCount(result.count);
      setTxHash(result.hash);
      setStatus("success");
    } catch (incrementError: unknown) {
      setStatus("failed");
      setError(
        incrementError instanceof Error
          ? incrementError.message
          : "Counter increment failed."
      );
    }
  };

  return (
    <div
      style={{
        padding: 20,
        borderRadius: 16,
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "#555",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          Soroban Counter
        </div>
        <span
          style={{
            fontSize: 11,
            color: "#999",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 99,
            padding: "2px 8px",
          }}
        >
          Level 2
        </span>
      </div>

      {(
        <div style={{ marginBottom: 14 }}>
          <a
            href={`https://stellar.expert/explorer/testnet/contract/${contractId}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 12, color: "#999" }}
          >
            View contract on Stellar Expert →
          </a>
        </div>
      )}

      {!publicKey && (
        <div style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>
          Connect a wallet to read and increment the counter.
        </div>
      )}

      {publicKey && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 14,
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
                Current Count
              </div>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 700,
                  color: "#fff",
                  lineHeight: 1,
                  fontFamily: "var(--font-family-heading)",
                }}
              >
                  {isLoadingCount ? "..." : displayCount ?? 0}
              </div>
            </div>

            <button
              type="button"
              onClick={handleIncrement}
              disabled={status === "pending"}
              className="btn-primary"
              style={{
                padding: "10px 18px",
                fontSize: 13,
                opacity: status === "pending" ? 0.6 : 1,
                cursor: status === "pending" ? "not-allowed" : "pointer",
              }}
            >
              {status === "pending" ? "Submitting..." : "Increment"}
            </button>
          </div>

          {status === "success" && txHash && (
            <div
              style={{
                marginBottom: 12,
                padding: "10px 12px",
                borderRadius: 10,
                background: "rgba(52,211,153,0.08)",
                border: "1px solid rgba(52,211,153,0.2)",
                fontSize: 13,
                color: "#34d399",
              }}
            >
              Counter incremented successfully.
              <br />
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#9ca3af", fontSize: 12 }}
              >
                View transaction hash →
              </a>
            </div>
          )}

          {(status === "failed" || error) && (
            <div
              style={{
                marginBottom: 12,
                padding: "10px 12px",
                borderRadius: 10,
                background: "rgba(248,113,113,0.08)",
                border: "1px solid rgba(248,113,113,0.2)",
                color: "#f87171",
                fontSize: 13,
              }}
            >
              {error || "Counter transaction failed."}
            </div>
          )}

          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
              paddingTop: 12,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ fontSize: 12, color: "#666" }}>Recent Contract Events</div>
            {latestEvents.length === 0 && (
              <div style={{ fontSize: 12, color: "#555" }}>No events yet.</div>
            )}
            {latestEvents.map((event) => (
              <div
                key={event.id}
                style={{
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 10,
                  padding: "8px 10px",
                  background: "rgba(255,255,255,0.01)",
                }}
              >
                <div style={{ fontSize: 12, color: "#fff" }}>
                  {event.topic || "event"}: {event.value}
                </div>
                <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>
                  {formatTimestamp(event.ledgerClosedAt)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
