interface BalanceDisplayProps {
  balance: string | null;
  loading: boolean;
  publicKey: string | null;
}

export default function BalanceDisplay({
  balance,
  loading,
  publicKey,
}: BalanceDisplayProps) {
  if (!publicKey) {
    return (
      <div className="text-gray-500 font-mono text-sm">
        Connect wallet to view balance
      </div>
    );
  }

  return (
    <div style={{ borderColor: '#00ff00', backgroundColor: '#1a1a1a' }} className="border rounded p-4">
      <div className="text-gray-400 font-mono text-xs uppercase mb-2">
        XLM Balance
      </div>
      {loading ? (
        <div className="h-10 bg-gray-700 rounded animate-pulse" />
      ) : (
        <div style={{ color: '#00ff00' }} className="text-4xl font-mono font-bold">
          {balance === "Error" ? "—" : parseFloat(balance || "0").toFixed(2)}
          <span className="text-xl ml-2">XLM</span>
        </div>
      )}
    </div>
  );
}
