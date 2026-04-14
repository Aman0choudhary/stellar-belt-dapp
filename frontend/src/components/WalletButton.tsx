interface WalletButtonProps {
  publicKey: string | null;
  isConnecting: boolean;
  error: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function WalletButton({
  publicKey,
  isConnecting,
  error,
  onConnect,
  onDisconnect,
}: WalletButtonProps) {
  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <div className="bg-red-900 border border-red-500 text-red-100 px-4 py-3 rounded font-mono text-sm">
          ⚠ {error}
        </div>
      )}
      {publicKey ? (
        <div className="flex gap-2">
          <button
            disabled
            style={{ borderColor: '#00ff00', color: '#00ff00', backgroundColor: '#1a1a1a' }}
            className="flex-1 border px-6 py-3 rounded font-mono font-bold hover:bg-opacity-80 transition disabled:opacity-50 cursor-default"
          >
            ✓ {truncateAddress(publicKey)}
          </button>
          <button
            onClick={onDisconnect}
            style={{ borderColor: '#00ff00', color: '#00ff00', backgroundColor: '#1a1a1a' }}
            className="border px-6 py-3 rounded font-mono font-bold transition hover:text-black"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#00ff00';
              e.currentTarget.style.color = '#0a0a0a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#1a1a1a';
              e.currentTarget.style.color = '#00ff00';
            }}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={onConnect}
          disabled={isConnecting}
          style={{ backgroundColor: '#00ff00', color: '#0a0a0a' }}
          className="w-full px-6 py-3 rounded font-mono font-bold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </button>
      )}
    </div>
  );
}
