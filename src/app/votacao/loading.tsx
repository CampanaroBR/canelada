import { BottomNav } from "@/components/layout/BottomNav";

export default function VotacaoLoading() {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--color-bg)" }}>
      <header style={{
        height: "56px",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        borderBottom: "1px solid var(--color-border-muted)",
      }}>
        <div className="skeleton-pulse" style={{ width: "90px", height: "18px", background: "var(--color-surface-2)", borderRadius: "4px" }} />
      </header>

      <main style={{
        padding: "24px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}>
        {/* Progress bar skeleton */}
        <div style={{ display: "flex", gap: "4px" }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="skeleton-pulse"
              style={{
                flex: 1,
                height: "3px",
                background: "var(--color-surface-2)",
                borderRadius: "9999px",
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>

        {/* Question skeleton */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div className="skeleton-pulse" style={{ width: "80px", height: "24px", background: "var(--color-surface-2)", borderRadius: "12px" }} />
          <div className="skeleton-pulse" style={{ width: "200px", height: "40px", background: "var(--color-surface-2)", borderRadius: "6px" }} />
        </div>

        {/* Player grid skeleton */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="skeleton-pulse"
              style={{
                height: "96px",
                background: "var(--color-surface-1)",
                borderRadius: "var(--radius-md)",
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
