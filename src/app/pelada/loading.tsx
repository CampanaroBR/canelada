import { BottomNav } from "@/components/layout/BottomNav";

export default function PeladaLoading() {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--color-bg)", paddingBottom: 100 }}>
      <div style={{
        padding: "calc(env(safe-area-inset-top, 0px) + 20px) 16px 16px",
        borderBottom: "1px solid #1a1a1a",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}>
        <div className="skeleton-pulse" style={{ width: 100, height: 36, background: "#1e1e1e", borderRadius: 6 }} />
        <div className="skeleton-pulse" style={{ width: 220, height: 14, background: "#1a1a1a", borderRadius: 4 }} />
      </div>

      <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="skeleton-pulse" style={{ height: 52, background: "#1a1a1a", borderRadius: 12 }} />
        <div className="skeleton-pulse" style={{ height: 52, background: "#1a1a1a", borderRadius: 12, animationDelay: "0.08s" }} />
        <div className="skeleton-pulse" style={{ height: 52, background: "#1a1a1a", borderRadius: 12, animationDelay: "0.16s" }} />
      </div>

      <BottomNav />
    </div>
  );
}
