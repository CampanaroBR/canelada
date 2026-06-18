import { BottomNav } from "@/components/layout/BottomNav";

export default function MedalhasLoading() {
  return (
    <div style={{ minHeight: "100dvh", background: "#090909" }}>

      {/* Teal header skeleton */}
      <div style={{
        background: "#147787",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 72px)",
        paddingBottom: 36,
        paddingLeft: 16,
        paddingRight: 16,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
      }}>
        <div
          className="skeleton-pulse"
          style={{ height: 80, background: "rgba(0,0,0,0.2)", borderRadius: 18 }}
        />
      </div>

      {/* Dark card skeleton */}
      <div style={{
        background: "#171717",
        border: "1px solid #2e2e2e",
        borderTopLeftRadius: 48,
        borderTopRightRadius: 48,
        paddingTop: 24,
        paddingLeft: 8,
        paddingRight: 8,
        paddingBottom: "calc(104px + env(safe-area-inset-bottom, 0px))",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}>
        {/* Section header skeleton */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, height: 42 }}>
          <div className="skeleton-pulse" style={{ width: 40, height: 40, background: "#2a2a2a", borderRadius: 12 }} />
          <div className="skeleton-pulse" style={{ width: 180, height: 16, background: "#2a2a2a", borderRadius: 4 }} />
        </div>

        {/* Filter tabs skeleton */}
        <div style={{ display: "flex", gap: 8 }}>
          {[80, 130, 140].map((w, i) => (
            <div
              key={i}
              className="skeleton-pulse"
              style={{ width: w, height: 30, background: "#2a2a2a", borderRadius: 9999, animationDelay: `${i * 0.08}s` }}
            />
          ))}
        </div>

        {/* Inner container skeleton */}
        <div style={{
          background: "#090909",
          border: "1px solid #2e2e2e",
          borderRadius: 20,
          padding: "13px 9px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}>
          {[7, 5, 5].map((count, ci) => (
            <div key={ci} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Category header */}
              <div style={{ paddingLeft: 4, display: "flex", flexDirection: "column", gap: 4 }}>
                <div className="skeleton-pulse" style={{ width: 120, height: 16, background: "#2a2a2a", borderRadius: 4, animationDelay: `${ci * 0.1}s` }} />
                <div className="skeleton-pulse" style={{ width: 160, height: 13, background: "#222", borderRadius: 4, animationDelay: `${ci * 0.1 + 0.05}s` }} />
              </div>
              {/* Badge rows */}
              {Array.from({ length: Math.ceil(count / 3) }).map((_, ri) => (
                <div key={ri} style={{ display: "flex", gap: 8 }}>
                  {Array.from({ length: 3 }).map((_, bi) => (
                    <div
                      key={bi}
                      className="skeleton-pulse"
                      style={{
                        flex: "1 0 0",
                        height: 110,
                        background: "#1a1a1a",
                        borderRadius: 12,
                        animationDelay: `${(ci * 0.1) + (ri * 0.06) + (bi * 0.04)}s`,
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
