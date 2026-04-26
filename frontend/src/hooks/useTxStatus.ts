import { useState } from "react";
import { parseError } from "../lib/errors";

export type TxStatus = "idle" | "pending" | "success" | "failed";

export interface TxExecuteResult {
  ok: boolean;
  hash?: string;
}

export function useTxStatus() {
  const [status, setStatus] = useState<TxStatus>("idle");
  const [hash, setHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function execute(
    fn: () => Promise<{ hash: string }>
  ): Promise<TxExecuteResult> {
    setStatus("pending");
    setError(null);
    setHash(null);

    try {
      const result = await fn();
      setHash(result.hash);
      setStatus("success");
      return { ok: true, hash: result.hash };
    } catch (unknownError: unknown) {
      const parsed = parseError(unknownError);
      setError(parsed.message);
      setStatus("failed");
      return { ok: false };
    }
  }

  const reset = () => {
    setStatus("idle");
    setHash(null);
    setError(null);
  };

  return { status, hash, error, execute, reset };
}
