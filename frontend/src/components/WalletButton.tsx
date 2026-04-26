interface WalletButtonProps {
  publicKey: string | null;
  walletName?: string | null;
  isConnecting: boolean;
  error: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function WalletButton({ publicKey, walletName, isConnecting, error, onConnect, onDisconnect }: WalletButtonProps) {
  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {error && (
        <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171", padding: "12px 16px", borderRadius: 12, fontSize: 13 }}>
          ⚠ {error}
        </div>
      )}
      {publicKey ? (
        <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
          <div style={{ flex: 1, padding: "10px 16px", borderRadius: 12, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", color: "#34d399", fontSize: 13, fontFamily: "monospace", fontWeight: 600 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399", display: "inline-block", boxShadow: "0 0 8px rgba(52,211,153,0.5)" }} />
              {truncateAddress(publicKey)}
            </div>
            {walletName && (
              <div style={{ marginTop: 6, fontSize: 11, color: "#8ad8b8", fontFamily: "var(--font-family-body)", fontWeight: 500 }}>
                Connected with {walletName}
              </div>
            )}
          </div>
          <button onClick={onDisconnect} style={{ padding: "12px 20px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.16)", background: "transparent", color: "#999", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease", fontFamily: "var(--font-family-body)" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#f87171"; e.currentTarget.style.color = "#f87171"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)"; e.currentTarget.style.color = "#999"; }}>
            Disconnect
          </button>
        </div>
      ) : (
        <button onClick={onConnect} disabled={isConnecting} className="btn-primary" style={{ width: "100%", justifyContent: "center", opacity: isConnecting ? 0.6 : 1, cursor: isConnecting ? "not-allowed" : "pointer" }}>
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </button>
      )}
    </div>
  );
}
