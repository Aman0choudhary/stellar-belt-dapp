import { useState } from "react";
import { sendXLM } from "../lib/transaction";

interface SendFormProps {
  publicKey: string | null;
  onSuccess: () => void;
}

type TxStatus = "idle" | "pending" | "success" | "failed";

export default function SendForm({ publicKey, onSuccess }: SendFormProps) {
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [status, setStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!publicKey) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("pending");
    setError(null);

    const result = await sendXLM(publicKey, toAddress, amount, memo);

    if (result.success) {
      setStatus("success");
      setTxHash(result.hash || null);
      setToAddress("");
      setAmount("");
      setMemo("");
      setTimeout(onSuccess, 2000);
    } else {
      setStatus("failed");
      setError(result.error || "Transaction failed");
    }
  };

  return (
    <div style={{ borderColor: '#666666', backgroundColor: '#1a1a1a' }} className="border rounded p-6">
      <div className="text-gray-400 font-mono text-xs uppercase mb-4">
        Send XLM
      </div>

      {status === "success" && txHash && (
        <div style={{ borderColor: '#00ff00' }} className="mb-4 p-3 bg-green-900 border rounded font-mono text-sm">
          ✓ Transaction submitted!
          <br />
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#00ff00' }}
            className="hover:underline"
          >
            View on Stellar Expert →
          </a>
        </div>
      )}

      {status === "failed" && (
        <div className="mb-4 p-3 bg-red-900 border border-red-500 rounded font-mono text-sm text-red-100">
          ✗ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-400 font-mono text-xs mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            placeholder="GXXXX..."
            disabled={status === "pending"}
            className="w-full bg-black border border-gray-600 text-white font-mono px-3 py-2 rounded disabled:opacity-50"
            required
          />
        </div>

        <div>
          <label className="block text-gray-400 font-mono text-xs mb-2">
            Amount (XLM)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            disabled={status === "pending"}
            className="w-full bg-black border border-gray-600 text-white font-mono px-3 py-2 rounded disabled:opacity-50"
            required
          />
        </div>

        <div>
          <label className="block text-gray-400 font-mono text-xs mb-2">
            Memo (Optional)
          </label>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Add a note..."
            disabled={status === "pending"}
            className="w-full bg-black border border-gray-600 text-white font-mono px-3 py-2 rounded disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={status === "pending" || !toAddress || !amount}
          style={{ backgroundColor: '#00ff00', color: '#0a0a0a' }}
          className="w-full px-6 py-3 rounded font-mono font-bold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === "pending" ? "Submitting..." : "Send XLM"}
        </button>
      </form>
    </div>
  );
}
