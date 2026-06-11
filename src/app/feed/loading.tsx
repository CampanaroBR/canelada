import { BottomNav } from "@/components/layout/BottomNav";

export default function FeedLoading() {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--color-bg)" }}>
      <header style={{
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        borderBottom: "1px solid var(--color-border-muted)",
      }}>
        <div className="skeleton-pulse" style={{ width: "110px", height: "18px", background: "var(--color-surface-2)", borderRadius: "4px" }} />
        <div className="skeleton-pulse" style={{ width: "36px", height: "36px", background: "var(--color-surface-2)", borderRadius: "8px" }} />
      </header>

      <main style={{
        padding: "16px 16px calc(88px + env(safe-area-inset-bottom, 0px))",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="skeleton-pulse"
            style={{
              height: "104px",
              background: "var(--color-surface-1)",
              borderRadius: "var(--radius-lg)",
              borderLeft: "3px solid var(--color-surface-2)",
              animationDelay: `${i * 0.12}s`,
            }}
          />
        ))}
      </main>

      <BottomNav />
    </div>
  );
}
