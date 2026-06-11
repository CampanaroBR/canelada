import { BottomNav } from "@/components/layout/BottomNav";

export default function RankingLoading() {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
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
        flex: 1,
        padding: "24px 20px calc(88px + env(safe-area-inset-bottom, 0px))",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="skeleton-pulse"
            style={{
              height: "64px",
              background: "var(--color-surface-1)",
              borderRadius: "var(--radius-md)",
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </main>

      <BottomNav />
    </div>
  );
}
