import { BottomNav } from "@/components/layout/BottomNav";

export default function PeladaLoading() {
  return (
    <div style={{ minHeight: "100dvh", background: "#08080a", paddingBottom: 100 }}>
      {/* Header card skeleton */}
      <div style={{ padding: "calc(env(safe-area-inset-top, 0px) + 92px) 8px 0", boxSizing: "border-box" }}>
        <div style={{ background: "#171717", border: "1px solid #2c2c2c", borderRadius: 20, padding: 17, display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="skeleton-pulse" style={{ width: 180, height: 20, background: "#242424", borderRadius: 6 }} />
          <div className="skeleton-pulse" style={{ width: 240, height: 14, background: "#1f1f1f", borderRadius: 4 }} />
        </div>
      </div>

      {/* Form card skeleton */}
      <div style={{ padding: "16px 8px 0", boxSizing: "border-box" }}>
        <div style={{ background: "#171717", border: "1px solid #2c2c2c", borderRadius: 20, padding: 17, display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="skeleton-pulse" style={{ height: 44, background: "#0a0e0e", borderRadius: 12 }} />
          <div className="skeleton-pulse" style={{ width: 120, height: 16, background: "#242424", borderRadius: 4 }} />
          <div style={{ display: "flex", gap: 8 }}>
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton-pulse" style={{ flex: 1, height: 56, background: "#0a0e0e", borderRadius: 12, animationDelay: `${i * 0.06}s` }} />
            ))}
          </div>
          <div className="skeleton-pulse" style={{ height: 120, background: "#0a0e0e", borderRadius: 12 }} />
          <div className="skeleton-pulse" style={{ height: 52, background: "#1f1f1f", borderRadius: 16 }} />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
