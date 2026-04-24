interface BalanceDisplayProps {
  balance: string | null;
  loading: boolean;
  publicKey: string | null;
}

export default function BalanceDisplay({ balance, loading, publicKey }: BalanceDisplayProps) {
  if (!publicKey) {
    return <div style={{ fontSize: 13, color: "#666" }}>Connect wallet to view balance</div>;
  }

  return (
    <div style={{ padding: 20, borderRadius: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>XLM Balance</div>
      {loading ? (
        <div style={{ height: 40, borderRadius: 8, background: "linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
      ) : (
        <div style={{ fontSize: 32, fontWeight: 700, fontFamily: "var(--font-family-heading)", letterSpacing: "-1px", color: "#fff" }}>
          {balance === "Error" ? "—" : parseFloat(balance || "0").toFixed(2)}
          <span style={{ fontSize: 16, fontWeight: 500, color: "#555", marginLeft: 8 }}>XLM</span>
        </div>
      )}
    </div>
  );
}
