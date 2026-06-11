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
  { key: "MVP" as const,     label: "MVP",     color: "#B5FF4D", medal: "🥇" },
  { key: "BAGRE" as const,   label: "Bagre",   color: "#EF4444", medal: "🐟" },
  { key: "RACUDO" as const,  label: "Raçudo",  color: "#F59E0B", medal: "💪" },
  { key: "RESENHA" as const, label: "Resenha", color: "#60A5FA", medal: "🎤" },
];

const AVATAR_COLORS = ["#B5FF4D", "#60A5FA", "#F59E0B", "#EF4444", "#A78BFA", "#34D399", "#F97316", "#EC4899"];
function avatarColor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const color = avatarColor(name);
  const initials = name.trim().slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: color + "22",
      border: `2px solid ${color}55`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-display)",
      fontWeight: 900,
      fontSize: size * 0.32,
      color,
      letterSpacing: "0.04em",
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function PodiumCard({
  entry,
  rank,
  color,
  height,
}: {
  entry: RankingEntry | undefined;
  rank: 1 | 2 | 3;
  color: string;
  height: number;
}) {
  const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };
  const isFirst = rank === 1;

  if (!entry) {
    return (
      <div style={{
        height,
        background: "var(--color-surface-1)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-border)",
        opacity: 0.25,
      }} />
    );
  }

  return (
    <div style={{
      height,
      background: isFirst ? color + "14" : "var(--color-surface-1)",
      borderRadius: "var(--radius-md)",
      border: `1px solid ${isFirst ? color + "44" : "var(--color-border)"}`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: "6px",
      padding: "12px 8px",
    }}>
      <span style={{ fontSize: isFirst ? "22px" : "18px" }}>{medals[rank]}</span>
      <Avatar name={entry.apelido} size={isFirst ? 52 : 40} />
      <span style={{
        fontSize: "11px",
        fontWeight: 700,
        fontFamily: "var(--font-body)",
        color: isFirst ? color : "var(--color-text-secondary)",
        textAlign: "center",
        maxWidth: "68px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}>
        {entry.apelido}
      </span>
      <span style={{
        fontFamily: "var(--font-display)",
        fontWeight: 900,
        fontSize: isFirst ? "24px" : "20px",
        lineHeight: 1,
        color: isFirst ? color : "var(--color-text-secondary)",
      }}>
        {entry.count}
      </span>
      <span style={{
        fontSize: "9px",
        fontWeight: 600,
        color: "var(--color-text-muted)",
        fontFamily: "var(--font-body)",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}>
        voto{entry.count !== 1 ? "s" : ""}
      </span>
    </div>
  );
}

export function RankingTabs({ data }: { data: RankingData }) {
  const [active, setActive] = useState<keyof RankingData>("MVP");
  const tab = TABS.find((t) => t.key === active)!;
  const ranking = data[active];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
      {/* Tab bar */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "6px",
        padding: "16px 16px 20px",
      }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            style={{
              height: "38px",
              borderRadius: "var(--radius-pill)",
              background: active === t.key ? t.color + "20" : "var(--color-surface-1)",
              border: `1px solid ${active === t.key ? t.color + "66" : "var(--color-border)"}`,
              color: active === t.key ? t.color : "var(--color-text-muted)",
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "12px",
              letterSpacing: "0.06em",
              textTransform: "uppercase" as const,
              cursor: "pointer",
              transition: "background 0.15s, border-color 0.15s, color 0.15s",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {ranking.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 24px" }}>
          <div style={{ fontSize: "56px", opacity: 0.1, marginBottom: "16px" }}>📊</div>
          <p style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)", fontSize: "14px" }}>
            Nenhum voto ainda.
          </p>
        </div>
      ) : (
        <>
          {/* Podium */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.15fr 1fr",
            gap: "8px",
            padding: "0 16px 20px",
            alignItems: "flex-end",
          }}>
            <PodiumCard entry={ranking[1]} rank={2} color={tab.color} height={130} />
            <PodiumCard entry={ranking[0]} rank={1} color={tab.color} height={164} />
            <PodiumCard entry={ranking[2]} rank={3} color={tab.color} height={110} />
          </div>

          {/* 4th+ */}
          {ranking.length > 3 && (
            <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {ranking.slice(3).map((entry, i) => (
                <div
                  key={entry.apelido}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    background: "var(--color-surface-1)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                    padding: "12px 16px",
                  }}
                >
                  <span style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 900,
                    fontSize: "16px",
                    color: "var(--color-text-muted)",
                    minWidth: "22px",
                    textAlign: "center",
                  }}>
                    {i + 4}
                  </span>
                  <Avatar name={entry.apelido} size={36} />
                  <span style={{
                    flex: 1,
                    fontSize: "14px",
                    fontWeight: 600,
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-primary)",
                  }}>
                    {entry.apelido}
                  </span>
                  <span style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 900,
                    fontSize: "20px",
                    color: tab.color,
                  }}>
                    {entry.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
