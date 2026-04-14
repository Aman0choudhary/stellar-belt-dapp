import { useState, useCallback } from "react";
import { connectFreighter } from "../lib/freighter";

export function useWallet() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const key = await connectFreighter();
      setPublicKey(key);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setPublicKey(null);
  }, []);

  return { publicKey, isConnecting, error, connect, disconnect };
}
