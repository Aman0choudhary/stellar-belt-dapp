export default function BountyCardSkeleton() {
  return (
    <article
      className="bountix-card"
      style={{
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* Row 1: status + title + reward */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div className="skeleton-shimmer" style={{ width: 56, height: 22, borderRadius: 6 }} />
        <div className="skeleton-shimmer" style={{ flex: 1, height: 16, borderRadius: 4 }} />
        <div className="skeleton-shimmer" style={{ width: 60, height: 16, borderRadius: 4 }} />
        <div className="skeleton-shimmer" style={{ width: 50, height: 14, borderRadius: 4 }} />
      </div>

      {/* Row 2: next-step banner */}
      <div className="skeleton-shimmer" style={{ height: 32, borderRadius: 6 }} />

      {/* Row 3: action button */}
      <div style={{ display: "flex", gap: 8 }}>
        <div className="skeleton-shimmer" style={{ width: 100, height: 34, borderRadius: 8 }} />
      </div>
    </article>
  );
}
