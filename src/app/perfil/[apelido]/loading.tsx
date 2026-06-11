import { BottomNav } from "@/components/layout/BottomNav";

export default function PerfilLoading() {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
      <header style={{
        height: "56px",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        borderBottom: "1px solid var(--color-border-muted)",
      }}>
        <div className="skeleton-pulse" style={{ width: "100px", height: "18px", background: "var(--color-surface-2)", borderRadius: "4px" }} />
      </header>

      <main style={{
        flex: 1,
        padding: "32px 20px calc(88px + env(safe-area-inset-bottom, 0px))",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
      }}>
        {/* Avatar */}
        <div className="skeleton-pulse" style={{ width: "88px", height: "88px", borderRadius: "50%", background: "var(--color-surface-2)" }} />

        {/* Name */}
        <div className="skeleton-pulse" style={{ width: "140px", height: "32px", background: "var(--color-surface-2)", borderRadius: "6px" }} />

        {/* Trait grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", width: "100%" }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="skeleton-pulse"
              style={{
                height: "80px",
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
