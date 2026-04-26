import { useState, useEffect } from "react";
import { getXLMBalance } from "../lib/balance";

export function useBalance(publicKey: string | null) {
  const [fetchedBalance, setFetchedBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const balance = publicKey ? fetchedBalance : null;

  useEffect(() => {
    if (!publicKey) {
      return;
    }

    let isCancelled = false;

    const fetchBalance = async () => {
      await Promise.resolve();

      if (isCancelled) {
        return;
      }

      setLoading(true);

      getXLMBalance(publicKey)
        .then((value) => {
          if (!isCancelled) {
            setFetchedBalance(value);
          }
        })
        .catch(() => {
          if (!isCancelled) {
            setFetchedBalance("Error");
          }
        })
        .finally(() => {
          if (!isCancelled) {
            setLoading(false);
          }
        });
    };

    void fetchBalance();

    return () => {
      isCancelled = true;
    };
  }, [publicKey]);

  return { balance, loading };
}
