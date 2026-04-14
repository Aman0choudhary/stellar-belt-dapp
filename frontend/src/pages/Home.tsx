import { useState } from "react";
import { useWallet } from "../hooks/useWallet";
import { useBalance } from "../hooks/useBalance";
import WalletButton from "../components/WalletButton";
import BalanceDisplay from "../components/BalanceDisplay";
import SendForm from "../components/SendForm";

export default function Home() {
  const { publicKey, isConnecting, error, connect, disconnect } = useWallet();
  const { balance, loading } = useBalance(publicKey);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const handleTxSuccess = () => {
    setRefreshCounter((prev) => prev + 1);
  };

  return (
    <div style={{ backgroundColor: '#0a0a0a' }} className="min-h-screen text-white font-mono">
      {/* Header */}
      <div style={{ borderColor: '#444444', backgroundColor: '#0a0a0a' }} className="border-b px-6 py-4 mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-xs text-gray-500 mb-2">STELLAR_WALLET_V1.0</div>
          <h1 style={{ color: '#00ff00' }} className="text-4xl font-bold mb-2">
            STELLAR WALLET
          </h1>
          <div className="text-xs text-gray-500">
            Testnet Operational Status: <span style={{ color: '#00ff00' }}>ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 space-y-6">
        {/* Connection Section */}
        <div style={{ borderColor: '#444444', backgroundColor: '#1a1a1a' }} className="border rounded p-6">
          <div className="text-gray-400 font-mono text-xs uppercase mb-4">
            Account Connection
          </div>
          <WalletButton
            publicKey={publicKey}
            isConnecting={isConnecting}
            error={error}
            onConnect={connect}
            onDisconnect={disconnect}
          />
        </div>

        {/* Balance Section */}
        {publicKey && (
          <BalanceDisplay
            balance={balance}
            loading={loading}
            publicKey={publicKey}
          />
        )}

        {/* Send XLM Section */}
        {publicKey && (
          <SendForm
            publicKey={publicKey}
            onSuccess={handleTxSuccess}
            key={refreshCounter}
          />
        )}

        {/* Footer */}
        <div style={{ borderColor: '#444444' }} className="border-t pt-6 pb-12 text-xs text-gray-500">
          <div>STELLAR WALLET v1.0 — Testnet Edition</div>
          <div className="mt-2">
            <a
              href="https://stellar.expert/explorer/testnet/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#00ff00' }}
              className="hover:underline"
            >
              Stellar Expert Explorer
            </a>
            {" | "}
            <a
              href="https://developers.stellar.org"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#00ff00' }}
              className="hover:underline"
            >
              Stellar Docs
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
