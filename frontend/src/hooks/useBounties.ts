import { useCallback, useEffect, useMemo, useState } from "react";
import {
  approveBounty,
  cancelBounty,
  claimBounty,
  configureBountySigner,
  getAllBounties,
  postBounty,
  rejectBounty,
  submitProof,
  type BountyItem,
  type PostBountyInput,
} from "../lib/bountyContract";
import { parseError } from "../lib/errors";
import { signWithKit } from "../lib/walletsKit";
import { useTxStatus } from "./useTxStatus";
import { getCache, setCache, invalidate } from "../lib/cache";

const CACHE_KEY = "bounties:all";
const CACHE_TTL = 15_000;

export function useBounties(publicKey: string | null) {
  const [bounties, setBounties] = useState<BountyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tx = useTxStatus();

  useEffect(() => {
    configureBountySigner(signWithKit);
  }, []);

  const refresh = useCallback(async () => {
    if (!publicKey) {
      setBounties([]);
      setError(null);
      return;
    }

    // Check cache first
    const cached = getCache<BountyItem[]>(CACHE_KEY);
    if (cached) {
      setBounties(cached);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const items = await getAllBounties(publicKey);
      setBounties(items);
      setCache(CACHE_KEY, items, CACHE_TTL);
    } catch (unknownError: unknown) {
      setError(parseError(unknownError).message);
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      await Promise.resolve();
      if (!cancelled) {
        await refresh();
      }
    };

    void run();

    const timer = window.setInterval(() => {
      void refresh();
    }, 12000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [refresh]);

  const runAction = useCallback(
    async (action: () => Promise<{ hash: string }>) => {
      const result = await tx.execute(action);
      if (result.ok) {
        // Invalidate cache so next refresh re-fetches from chain
        invalidate(CACHE_KEY);
        await refresh();
      }
      return result;
    },
    [refresh, tx]
  );

  const actions = useMemo(
    () => ({
      post: async (input: PostBountyInput) => {
        if (!publicKey) {
          throw new Error("Connect your wallet first.");
        }
        return runAction(() => postBounty(publicKey, input));
      },
      claim: async (bountyId: number) => {
        if (!publicKey) {
          throw new Error("Connect your wallet first.");
        }
        return runAction(() => claimBounty(publicKey, bountyId));
      },
      submit: async (bountyId: number, proofLink: string) => {
        if (!publicKey) {
          throw new Error("Connect your wallet first.");
        }
        return runAction(() => submitProof(publicKey, bountyId, proofLink));
      },
      approve: async (bountyId: number) => {
        if (!publicKey) {
          throw new Error("Connect your wallet first.");
        }
        return runAction(() => approveBounty(publicKey, bountyId));
      },
      reject: async (bountyId: number) => {
        if (!publicKey) {
          throw new Error("Connect your wallet first.");
        }
        return runAction(() => rejectBounty(publicKey, bountyId));
      },
      cancel: async (bountyId: number) => {
        if (!publicKey) {
          throw new Error("Connect your wallet first.");
        }
        return runAction(() => cancelBounty(publicKey, bountyId));
      },
    }),
    [publicKey, runAction]
  );

  return {
    bounties,
    loading,
    error,
    txStatus: tx.status,
    txHash: tx.hash,
    txError: tx.error,
    txStep: tx.step,
    resetTxStatus: tx.reset,
    refresh,
    ...actions,
  };
}
