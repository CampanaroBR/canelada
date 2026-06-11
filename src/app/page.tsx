import { Trophy, Fish, Zap, CircleDot } from "lucide-react";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 20px",
      }}
    >
      <div
        style={{
          maxWidth: 390,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Header card */}
        <div
          style={{
            background: "var(--ink)",
            borderRadius: "var(--r-2xl)",
            padding: "32px 24px",
            boxShadow: "var(--s3)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CircleDot size={28} color="var(--green)" />
            <span
              style={{
                fontFamily: "var(--f-display)",
                fontWeight: 900,
                fontSize: 32,
                color: "var(--green)",
                letterSpacing: "-0.01em",
                lineHeight: 1,
              }}
            >
              CANELADA
            </span>
          </div>
          <p
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 14,
              fontWeight: 500,
              lineHeight: 1.4,
            }}
          >
            O baba virou resenha.
          </p>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
            {[
              { icon: <Trophy size={13} />, label: "MVP" },
              { icon: <Fish size={13} />, label: "Bagre" },
              { icon: <Zap size={13} />, label: "Traits" },
            ].map(({ icon, label }) => (
              <span
                key={label}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: "var(--r-pill)",
                  padding: "5px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                <span style={{ color: "var(--green)" }}>{icon}</span>
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Coming soon card */}
        <div
          style={{
            background: "#141414",
            borderRadius: "var(--r-2xl)",
            padding: "24px",
            boxShadow: "var(--s2)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                background: "var(--green)",
                color: "var(--green-deep)",
                borderRadius: "var(--r-pill)",
                padding: "5px 13px",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                width: "fit-content",
              }}
            >
              Em breve
            </span>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1.2,
              }}
            >
              Feed, votação e ranking chegando aí
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.45)",
                lineHeight: 1.5,
              }}
            >
              Vote no MVP, colecione traits e compartilhe a seleção da rodada com seu grupo.
            </p>
          </div>
        </div>

        {/* CTA */}
        <button
          style={{
            background: "var(--green)",
            color: "var(--green-deep)",
            border: "none",
            borderRadius: "var(--r-xl)",
            padding: "16px",
            fontSize: 16,
            fontWeight: 800,
            fontFamily: "var(--f)",
            width: "100%",
            minHeight: 52,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            cursor: "pointer",
          }}
        >
          <CircleDot size={20} />
          Baba rolou hoje
        </button>
      </div>
    </main>
  );
}
