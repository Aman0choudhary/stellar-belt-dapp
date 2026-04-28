import { useEffect, useState, useCallback } from "react";
import {
  getDispute,
  hasDispute,
  type DisputeData,
} from "../lib/disputeContract";
import { getCache, setCache } from "../lib/cache";

export function useDispute(bountyId: number | null) {
  const [dispute, setDispute] = useState<DisputeData | null>(null);
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchDispute = useCallback(async () => {
    if (bountyId === null) {
      setDispute(null);
      setExists(false);
      return;
    }

    const cacheKey = `dispute:${bountyId}`;
    const cached = getCache<DisputeData | null>(cacheKey);
    if (cached !== undefined && cached !== null) {
      setDispute(cached);
      setExists(true);
      return;
    }

    setLoading(true);
    try {
      const has = await hasDispute(bountyId);
      setExists(has);

      if (has) {
        const data = await getDispute(bountyId);
        setDispute(data);
        setCache(cacheKey, data, 15_000); // cache for 15s
      }
    } catch {
      console.warn("[Bountix] Failed to fetch dispute for bounty", bountyId);
    } finally {
      setLoading(false);
    }
  }, [bountyId]);

  useEffect(() => {
    fetchDispute();
  }, [fetchDispute]);

  return {
    dispute,
    exists,
    loading,
    refetch: fetchDispute,
  };
}
