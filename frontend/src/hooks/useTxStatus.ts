import { useState } from "react";
import { parseError } from "../lib/errors";

export type TxStatus = "idle" | "pending" | "success" | "failed";

export const TX_STEP_LABELS = [
  "Building transaction",
  "Awaiting wallet signature",
  "Submitting to network",
  "Confirming on-chain",
] as const;

export type TxStep = 0 | 1 | 2 | 3;

export interface TxExecuteResult {
  ok: boolean;
  hash?: string;
}

export function useTxStatus() {
  const [status, setStatus] = useState<TxStatus>("idle");
  const [hash, setHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<TxStep>(0);

  async function execute(
    fn: () => Promise<{ hash: string }>
  ): Promise<TxExecuteResult> {
    setStatus("pending");
    setError(null);
    setHash(null);
    setStep(0);

    try {
      // Step 0: building (happens inside fn)
      setStep(1); // awaiting signature
      const result = await fn();
      // fn returns after on-chain confirm, so jump through steps
      setStep(3);
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
    setStep(0);
  };

  return { status, hash, error, step, execute, reset };
}
