"use client";

import { useState } from "react";

export type RankingEntry = { apelido: string; count: number };
export type RankingData = {
  MVP: RankingEntry[];
  BAGRE: RankingEntry[];
  RACUDO: RankingEntry[];
  RESENHA: RankingEntry[];
};

const TABS = [
  { key: "MVP"     as const, label: "MVP",     color: "#B5FF4D", emoji: "⚽" },
  { key: "BAGRE"   as const, label: "Bagre",   color: "#EF4444", emoji: "🐟" },
  { key: "RACUDO"  as const, label: "Raçudo",  color: "#F59E0B", emoji: "💪" },
  { key: "RESENHA" as const, label: "Resenha", color: "#60A5FA", emoji: "🎤" },
];

const AVATAR_COLORS = ["#B5FF4D", "#60A5FA", "#F59E0B", "#EF4444", "#A78BFA", "#34D399", "#F97316", "#EC4899"];
function avatarColor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
function getInitials(name: string) {
  const p = name.trim().split(/\s+/);
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

function AvatarCircle({ name, size = 48, active = false, accentColor = "" }: {
  name: string; size?: number; active?: boolean; accentColor?: string;
}) {
  const color = avatarColor(name);
  const ring = active ? accentColor : color;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `radial-gradient(circle at 35% 35%, ${color}35, ${color}12)`,
      boxShadow: [
        `0 0 0 ${active ? 2 : 1}px ${ring}${active ? "90" : "50"}`,
        active ? `0 0 20px ${ring}30` : "",
      ].filter(Boolean).join(", "),
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-display)", fontWeight: 900,
      fontSize: size * 0.30, color, letterSpacing: "0.04em", flexShrink: 0,
    }}>
      {getInitials(name)}
    </div>
  );
}

/* Primeiro lugar — hero card com cor preenchendo como o Login */
function FirstPlaceCard({ entry, color, emoji }: { entry: RankingEntry; color: string; emoji: string }) {
  const tabLabel = TABS.find(t => t.color === color)?.label ?? "ranking";
  return (
    <div style={{
      position: "relative",
      borderRadius: "var(--radius-lg)",
      background: `linear-gradient(135deg, ${color}28 0%, ${color}10 60%, transparent 100%)`,
      boxShadow: `0 0 0 1px ${color}50, inset 0 1px 0 rgba(255,255,255,0.10), 0 8px 40px ${color}25`,
      padding: "24px 20px",
      overflow: "hidden",
      marginBottom: "8px",
    }}>
      {/* Color fill strip on top */}
      <div aria-hidden style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: "3px",
        background: color,
        opacity: 0.9,
      }} />

      {/* Radial glow behind avatar */}
      <div aria-hidden style={{
        position: "absolute",
        left: "10px",
        top: "50%",
        transform: "translateY(-50%)",
        width: "120px",
        height: "120px",
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color}25 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Watermark "1" */}
      <div aria-hidden style={{
        position: "absolute",
        right: "-4px",
        top: "50%",
        transform: "translateY(-50%)",
        fontFamily: "var(--font-display)",
        fontWeight: 900,
        fontSize: "clamp(140px, 38vw, 180px)",
        lineHeight: 1,
        color: color,
        opacity: 0.06,
        userSelect: "none",
        letterSpacing: "-0.04em",
      }}>1</div>

      {/* Label topo */}
      <p style={{
        fontSize: "10px", fontWeight: 700, letterSpacing: "0.16em",
        textTransform: "uppercase", color: color,
        fontFamily: "var(--font-body)", marginBottom: "16px", opacity: 0.9,
        position: "relative",
      }}>
        {emoji} Líder do {tabLabel}
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: "16px", position: "relative" }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <AvatarCircle name={entry.apelido} size={72} active accentColor={color} />
          <div style={{
            position: "absolute", bottom: "-4px", right: "-6px",
            fontSize: "22px", lineHeight: 1,
            filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.50))",
          }}>🥇</div>
        </div>

        <h3 style={{
          flex: 1, minWidth: 0,
          fontFamily: "var(--font-display)", fontWeight: 900,
          fontSize: "clamp(28px, 8vw, 40px)", lineHeight: 0.9,
          letterSpacing: "-0.02em", textTransform: "uppercase",
          color: "var(--color-text-primary)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {entry.apelido}
        </h3>

        {/* Contador dominante */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div className="tabular" style={{
            fontFamily: "var(--font-display)", fontWeight: 900,
            fontSize: "clamp(64px, 18vw, 88px)", lineHeight: 0.85,
            color: color,
            letterSpacing: "-0.03em",
          }}>
            {entry.count}
          </div>
          <div style={{
            fontSize: "9px", fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "var(--color-text-muted)",
            fontFamily: "var(--font-body)", marginTop: "4px",
          }}>
            voto{entry.count !== 1 ? "s" : ""}
          </div>
        </div>
      </div>
    </div>
  );
}

/* 2º e 3º lugar — card compacto */
function PodiumRow({ entry, rank, color }: { entry: RankingEntry; rank: 2 | 3; color: string }) {
  const medals = { 2: "🥈", 3: "🥉" };
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "12px",
      background: "var(--color-surface-1)",
      borderRadius: "var(--radius-md)",
      boxShadow: "var(--shadow-border)",
      padding: "12px 16px",
      position: "relative", overflow: "hidden",
    }}>
      {/* Accent bar */}
      <div aria-hidden style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: "3px",
        background: color, borderRadius: "3px 0 0 3px",
      }} />

      <span style={{ fontSize: "16px", lineHeight: 1 }}>{medals[rank]}</span>
      <AvatarCircle name={entry.apelido} size={40} accentColor={color} />
      <span style={{
        flex: 1, fontSize: "14px", fontWeight: 700,
        fontFamily: "var(--font-body)", color: "var(--color-text-primary)",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {entry.apelido}
      </span>
      <span className="tabular" style={{
        fontFamily: "var(--font-display)", fontWeight: 900,
        fontSize: "32px", lineHeight: 1, color,
        letterSpacing: "-0.02em",
      }}>
        {entry.count}
      </span>
    </div>
  );
}

export function RankingTabs({ data }: { data: RankingData }) {
  const [active, setActive] = useState<keyof RankingData>("MVP");
  const tab = TABS.find((t) => t.key === active)!;
  const ranking = data[active];

  return (
    <>
      <style>{`
        .rank-tab {
          transition-property: background, box-shadow, color, transform;
          transition-duration: 150ms;
          transition-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
        }
        .rank-tab:active { transform: scale(0.96); }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column" }}>

        {/* ── Tab bar — pills com shadow-as-border ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "6px",
          padding: "16px 16px 24px",
        }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className="rank-tab"
              style={{
                height: "40px",
                borderRadius: "var(--radius-pill)",
                background: active === t.key ? t.color + "22" : "var(--color-surface-1)",
                boxShadow: active === t.key
                  ? `0 0 0 1px ${t.color}70, 0 0 12px ${t.color}20`
                  : "var(--shadow-border)",
                border: "none",
                color: active === t.key ? t.color : "var(--color-text-muted)",
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: "12px",
                letterSpacing: "0.06em",
                textTransform: "uppercase" as const,
                cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Conteúdo ── */}
        {ranking.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ fontSize: "64px", opacity: 0.06, marginBottom: "16px" }}>📊</div>
            <p style={{
              fontFamily: "var(--font-display)", fontWeight: 900,
              fontSize: "clamp(32px, 9vw, 48px)", lineHeight: 0.9,
              textTransform: "uppercase", color: "var(--color-text-muted)",
              letterSpacing: "-0.01em", marginBottom: "8px",
            }}>
              NENHUM<br />VOTO AINDA.
            </p>
          </div>
        ) : (
          <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {/* 1º lugar — hero card */}
            {ranking[0] && (
              <FirstPlaceCard entry={ranking[0]} color={tab.color} emoji={tab.emoji} />
            )}

            {/* 2º lugar */}
            {ranking[1] && <PodiumRow entry={ranking[1]} rank={2} color={tab.color} />}

            {/* 3º lugar */}
            {ranking[2] && <PodiumRow entry={ranking[2]} rank={3} color={tab.color} />}

            {/* 4º+ */}
            {ranking.length > 3 && (
              <>
                {/* Divisor */}
                <div style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "8px 0",
                }}>
                  <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
                  <span style={{
                    fontSize: "9px", fontWeight: 700, letterSpacing: "0.14em",
                    color: "var(--color-text-muted)", fontFamily: "var(--font-body)",
                    textTransform: "uppercase",
                  }}>
                    os demais
                  </span>
                  <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
                </div>

                {ranking.slice(3).map((entry, i) => (
                  <div
                    key={entry.apelido}
                    style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      background: "var(--color-surface-1)",
                      borderRadius: "var(--radius-md)",
                      boxShadow: "var(--shadow-border)",
                      padding: "10px 16px",
                    }}
                  >
                    <span className="tabular" style={{
                      fontFamily: "var(--font-display)", fontWeight: 900,
                      fontSize: "14px", color: "var(--color-text-muted)",
                      minWidth: "20px", textAlign: "center",
                    }}>
                      {i + 4}
                    </span>
                    <AvatarCircle name={entry.apelido} size={32} accentColor={tab.color} />
                    <span style={{
                      flex: 1, fontSize: "14px", fontWeight: 600,
                      fontFamily: "var(--font-body)", color: "var(--color-text-primary)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {entry.apelido}
                    </span>
                    <span className="tabular" style={{
                      fontFamily: "var(--font-display)", fontWeight: 900,
                      fontSize: "18px", color: tab.color,
                    }}>
                      {entry.count}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
