import { BottomNav } from "@/components/layout/BottomNav";

export default function MedalhasLoading() {
  return (
    <div style={{ minHeight: "100dvh", background: "#090909", paddingBottom: "calc(104px + env(safe-area-inset-bottom, 0px))" }}>
      {/* Header compacto "Suas Badges" */}
      <div style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 96px)", paddingBottom: 20, paddingLeft: 16, paddingRight: 16, boxSizing: "border-box" }}>
        <div style={{ background: "#090909", border: "1px solid #2c2c2c", borderRadius: 20, padding: "13px 9px 13px 17px", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            <div className="skeleton-pulse" style={{ width: 120, height: 20, background: "#242424", borderRadius: 6 }} />
            <div className="skeleton-pulse" style={{ width: 50, height: 18, background: "#1f1f1f", borderRadius: 4 }} />
          </div>
          <div className="skeleton-pulse" style={{ width: 48, height: 48, background: "#1f1f1f", borderRadius: "50%" }} />
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{ padding: "0 8px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Section header BADGES */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, height: 42, paddingLeft: 8 }}>
          <div className="skeleton-pulse" style={{ width: 40, height: 40, background: "#1f1f1f", borderRadius: 12 }} />
          <div className="skeleton-pulse" style={{ width: 90, height: 16, background: "#242424", borderRadius: 4 }} />
        </div>

        {/* Filtros */}
        <div style={{ display: "flex", gap: 8 }}>
          {[80, 130, 140].map((w, i) => (
            <div key={i} className="skeleton-pulse" style={{ width: w, height: 30, background: "#1f1f1f", borderRadius: 9999, animationDelay: `${i * 0.08}s` }} />
          ))}
        </div>

        {/* Categorias + grid de cards (uniforme 118) */}
        {[7, 5].map((count, ci) => (
          <div key={ci} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ paddingLeft: 8, display: "flex", flexDirection: "column", gap: 4 }}>
              <div className="skeleton-pulse" style={{ width: 120, height: 16, background: "#242424", borderRadius: 4, animationDelay: `${ci * 0.1}s` }} />
              <div className="skeleton-pulse" style={{ width: 160, height: 14, background: "#1c1c1c", borderRadius: 4, animationDelay: `${ci * 0.1 + 0.05}s` }} />
            </div>
            {Array.from({ length: Math.ceil(count / 3) }).map((_, ri) => (
              <div key={ri} style={{ display: "flex", gap: 8 }}>
                {Array.from({ length: 3 }).map((_, bi) => (
                  <div
                    key={bi}
                    className="skeleton-pulse"
                    style={{
                      flex: "1 0 0",
                      height: 118,
                      background: "#171717",
                      border: "1px solid #2c2c2c",
                      borderRadius: 12,
                      boxSizing: "border-box",
                      animationDelay: `${(ci * 0.1) + (ri * 0.06) + (bi * 0.04)}s`,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
