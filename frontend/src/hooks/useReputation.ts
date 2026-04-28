import { useEffect, useState, useCallback } from "react";
import { getScore } from "../lib/reputationContract";
import { getCache, setCache } from "../lib/cache";

export interface ReputationTier {
  name: string;
  emoji: string;
  minScore: number;
}

const TIERS: ReputationTier[] = [
  { name: "Legend", emoji: "💎", minScore: 100 },
  { name: "Elite Hunter", emoji: "🔥", minScore: 51 },
  { name: "Trusted Hunter", emoji: "⭐", minScore: 11 },
  { name: "Newcomer", emoji: "🌱", minScore: 0 },
];

function getTier(score: number): ReputationTier {
  return TIERS.find((t) => score >= t.minScore) ?? TIERS[TIERS.length - 1];
}

export function useReputation(address: string | null) {
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tier, setTier] = useState<ReputationTier>(TIERS[TIERS.length - 1]);

  const fetchScore = useCallback(async () => {
    if (!address) {
      setScore(0);
      setTier(TIERS[TIERS.length - 1]);
      return;
    }

    const cacheKey = `rep:${address}`;
    const cached = getCache<number>(cacheKey);
    if (cached !== null) {
      setScore(cached);
      setTier(getTier(cached));
      return;
    }

    setLoading(true);
    try {
      const s = await getScore(address);
      setScore(s);
      setTier(getTier(s));
      setCache(cacheKey, s, 30_000); // cache for 30s
    } catch {
      console.warn("[Bountix] Failed to fetch reputation for", address);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchScore();
  }, [fetchScore]);

  return {
    score,
    tier,
    tierName: tier.name,
    tierEmoji: tier.emoji,
    loading,
    refetch: fetchScore,
  };
}
