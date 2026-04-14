import { useState, useEffect } from "react";
import { getXLMBalance } from "../lib/balance";

export function useBalance(publicKey: string | null) {
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!publicKey) {
      setBalance(null);
      return;
    }
    setLoading(true);
    getXLMBalance(publicKey)
      .then(setBalance)
      .catch(() => setBalance("Error"))
      .finally(() => setLoading(false));
  }, [publicKey]);

  return { balance, loading };
}
