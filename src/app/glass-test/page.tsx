"use client";

// Página temporária de diagnóstico do liquid glass — DELETAR depois.
export default function GlassTest() {
  return (
    <div style={{ minHeight: "200dvh", background: "#090909", position: "relative" }}>
      {/* conteúdo colorido pra dar o que refratar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, padding: "90px 16px 140px" }}>
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} style={{
            width: 110, height: 110, borderRadius: 16,
            background: `hsl(${i * 37 % 360} 80% 55%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#000", fontWeight: 700, fontFamily: "sans-serif",
          }}>{i}</div>
        ))}
      </div>

      {/* topbar */}
      <div className="glass-bar" style={{ position: "fixed", top: 0, left: 0, right: 0, height: 72, zIndex: 30, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "sans-serif" }}>
        glass-bar
      </div>

      {/* navbar pill */}
      <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 30 }}>
        <nav className="glass-nav" style={{ display: "inline-flex", alignItems: "center", gap: 24, padding: "14px 28px", borderRadius: 28, color: "#fff", fontFamily: "sans-serif" }}>
          <span>Home</span><span>Baba</span><span>Badges</span><span>Ranking</span>
        </nav>
      </div>
    </div>
  );
}
