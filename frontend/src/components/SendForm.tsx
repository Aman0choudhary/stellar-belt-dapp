import { useState } from "react";
import { sendXLM } from "../lib/transaction";

interface SendFormProps {
  publicKey: string | null;
  onSuccess: () => void;
}

type TxStatus = "idle" | "pending" | "success" | "failed";
const SUCCESS_NOTIFICATION_MS = 15000;

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)",
  color: "#fff", fontSize: 13, fontFamily: "var(--font-family-body)",
  outline: "none", transition: "border-color 0.2s ease", boxSizing: "border-box" as const,
};

export default function SendForm({ publicKey, onSuccess }: SendFormProps) {
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [status, setStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!publicKey) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("pending");
    setError(null);
    const result = await sendXLM(publicKey, toAddress, amount, memo);
    if (result.success) {
      setStatus("success"); setTxHash(result.hash || null);
      setToAddress(""); setAmount(""); setMemo("");
      setTimeout(onSuccess, SUCCESS_NOTIFICATION_MS);
    } else {
      setStatus("failed"); setError(result.error || "Transaction failed");
    }
  };

  return (
    <div style={{ padding: 20, borderRadius: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 16 }}>Send XLM</div>

      {status === "success" && txHash && (
        <div style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 12, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", fontSize: 13 }}>
          <span style={{ color: "#34d399" }}>✓ Transaction submitted!</span><br />
          <a href={`https://stellar.expert/explorer/testnet/tx/${txHash}`} target="_blank" rel="noopener noreferrer" style={{ color: "#999", fontSize: 12 }}>View on Stellar Expert →</a>
        </div>
      )}

      {status === "failed" && (
        <div style={{ marginBottom: 16, padding: "12px 16px", borderRadius: 12, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171", fontSize: 13 }}>✗ {error}</div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ display: "block", fontSize: 11, color: "#555", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Recipient Address</label>
          <input type="text" value={toAddress} onChange={(e) => setToAddress(e.target.value)} placeholder="GXXXX..." disabled={status === "pending"} required
            style={{ ...inputStyle, opacity: status === "pending" ? 0.5 : 1 }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, color: "#555", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Amount (XLM)</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" step="0.01" disabled={status === "pending"} required
            style={{ ...inputStyle, opacity: status === "pending" ? 0.5 : 1 }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, color: "#555", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>Memo (Optional)</label>
          <input type="text" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="Add a note..." disabled={status === "pending"}
            style={{ ...inputStyle, opacity: status === "pending" ? 0.5 : 1 }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }} />
        </div>
        <button type="submit" disabled={status === "pending" || !toAddress || !amount} className="btn-primary"
          style={{ width: "100%", justifyContent: "center", marginTop: 4, opacity: (status === "pending" || !toAddress || !amount) ? 0.5 : 1, cursor: (status === "pending" || !toAddress || !amount) ? "not-allowed" : "pointer" }}>
          {status === "pending" ? "Submitting..." : "Send XLM →"}
        </button>
      </form>
    </div>
  );
}
