import { useState, useEffect } from "react";

interface CountdownProps {
  deadlineTs: number;
}

export default function Countdown({ deadlineTs }: CountdownProps) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    const tick = () => {
      const diff = deadlineTs * 1000 - Date.now();
      if (diff <= 0) {
        setRemaining("Expired");
        return;
      }
      const d = Math.floor(diff / 86_400_000);
      const h = Math.floor((diff % 86_400_000) / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      setRemaining(`${d}d ${h}h ${m}m`);
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [deadlineTs]);

  const isExpired = remaining === "Expired";
  const isUrgent =
    !isExpired && deadlineTs * 1000 - Date.now() < 86_400_000;

  return (
    <span
      style={{
        color: isExpired ? "#f87171" : isUrgent ? "#fbbf24" : "#888",
        fontSize: 12,
        fontWeight: isUrgent || isExpired ? 600 : 400,
      }}
    >
      {isExpired ? "⏰ Expired" : `⏰ ${remaining}`}
    </span>
  );
}
