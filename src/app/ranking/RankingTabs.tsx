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
  { key: "MVP"     as const, label: "MVP",     color: "#9fe870", emoji: "⚽" },
  { key: "BAGRE"   as const, label: "Bagre",   color: "#EF4444", emoji: "🐟" },
  { key: "RACUDO"  as const, label: "Raçudo",  color: "#F59E0B", emoji: "💪" },
  { key: "RESENHA" as const, label: "Resenha", color: "#60A5FA", emoji: "🎤" },
];

const AVATAR_COLORS = ["#9fe870", "#60A5FA", "#F59E0B", "#EF4444", "#A78BFA", "#34D399", "#F97316", "#EC4899"];
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

/* Primeiro lugar — hero card dramático com cor de fundo */
function FirstPlaceCard({ entry, color, emoji }: { entry: RankingEntry; color: string; emoji: string }) {
  return (
    <div style={{
      position: "relative",
      borderRadius: "var(--radius-lg)",
      background: color + "14",
      boxShadow: `0 0 0 1px ${color}40, inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 24px ${color}15`,
      padding: "20px",
      overflow: "hidden",
      marginBottom: "8px",
    }}>
      {/* Watermark gigante do número 1 */}
      <div aria-hidden style={{
        position: "absolute",
        right: "-8px",
        top: "50%",
        transform: "translateY(-50%)",
        fontFamily: "var(--font-display)",
        fontWeight: 900,
        fontSize: "120px",
        lineHeight: 1,
        color: color,
        opacity: 0.07,
        userSelect: "none",
        letterSpacing: "-0.04em",
      }}>1</div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px", position: "relative" }}>
        <div style={{ position: "relative" }}>
          <AvatarCircle name={entry.apelido} size={64} active accentColor={color} />
          {/* Medal badge */}
          <div style={{
            position: "absolute", bottom: "-2px", right: "-4px",
            fontSize: "18px", lineHeight: 1,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.40))",
          }}>🥇</div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em",
            textTransform: "uppercase", color: color,
            fontFamily: "var(--font-body)", marginBottom: "4px", opacity: 0.8,
          }}>
            {emoji} Líder do {TABS.find(t => t.color === color)?.label ?? "ranking"}
          </p>
          <h3 style={{
            fontFamily: "var(--font-display)", fontWeight: 900,
            fontSize: "clamp(22px, 6vw, 28px)", lineHeight: 0.9,
            letterSpacing: "-0.01em", textTransform: "uppercase",
            color: "var(--color-text-primary)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {entry.apelido}
          </h3>
        </div>

        {/* Contador dominante */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div className="tabular" style={{
            fontFamily: "var(--font-display)", fontWeight: 900,
            fontSize: "clamp(40px, 11vw, 52px)", lineHeight: 0.9,
            color: color,
          }}>
            {entry.count}
          </div>
          <div style={{
            fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "var(--color-text-muted)",
            fontFamily: "var(--font-body)",
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
        fontSize: "22px", lineHeight: 1, color,
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
