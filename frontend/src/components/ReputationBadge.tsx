import { useReputation } from "../hooks/useReputation";

interface ReputationBadgeProps {
  address: string | null;
  showScore?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function ReputationBadge({
  address,
  showScore = true,
  size = "sm",
}: ReputationBadgeProps) {
  const { score, tierName, tierEmoji, loading } = useReputation(address);

  if (!address || loading) {
    return null;
  }

  const sizeClasses = {
    sm: "reputation-badge--sm",
    md: "reputation-badge--md",
    lg: "reputation-badge--lg",
  };

  return (
    <span
      className={`reputation-badge ${sizeClasses[size]}`}
      title={`${tierName} — ${score} BNTX points`}
    >
      <span className="reputation-badge__emoji">{tierEmoji}</span>
      <span className="reputation-badge__tier">{tierName}</span>
      {showScore && (
        <span className="reputation-badge__score">{score} BNTX</span>
      )}
    </span>
  );
}
