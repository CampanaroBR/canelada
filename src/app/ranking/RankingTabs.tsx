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
  { key: "MVP"     as const, emoji: "⚽", label: "MVP",     tagline: "melhor do baba",   emptyMsg: "Nenhum MVP ainda." },
  { key: "BAGRE"   as const, emoji: "🐟", label: "Bagre",   tagline: "pior do baba",     emptyMsg: "Nenhum bagre eleito ainda." },
  { key: "RACUDO"  as const, emoji: "💪", label: "Raçudo",  tagline: "mais raçudo",      emptyMsg: "Nenhum raçudo votado ainda." },
  { key: "RESENHA" as const, emoji: "🎤", label: "Resenha", tagline: "rei da resenha",   emptyMsg: "Ninguém levou a resenha ainda." },
];

function getInitials(name: string) {
  const p = name.trim().split(/\s+/);
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

function Avatar({ name, size = 48 }: { name: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "#1a1a1a",
      border: "1px solid #2e2e2e",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-display)", fontWeight: 900,
      fontSize: size * 0.30, color: "rgba(255,255,255,0.7)",
      flexShrink: 0, letterSpacing: "-0.01em",
    }}>
      {getInitials(name)}
    </div>
  );
}

function FirstCard({ entry, tab }: { entry: RankingEntry; tab: typeof TABS[number] }) {
  return (
    <div style={{
      position: "relative",
      background: "#111",
      border: "1px solid #2a2a2a",
      borderRadius: 20,
      padding: "22px 20px 20px",
      overflow: "hidden",
    }}>
      {/* Barra acento verde no topo */}
      <div aria-hidden style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: "#9fe870",
      }} />

      {/* Watermark "1" */}
      <div aria-hidden style={{
        position: "absolute", right: -8, bottom: -24,
        fontFamily: "var(--font-display)", fontWeight: 900,
        fontSize: 180, lineHeight: 1,
        color: "#9fe870", opacity: 0.05,
        letterSpacing: "-0.04em", userSelect: "none", pointerEvents: "none",
      }}>
        1
      </div>

      {/* Rótulo da categoria */}
      <div style={{
        fontFamily: "var(--font-body)", fontWeight: 700,
        fontSize: 11, letterSpacing: "0.16em",
        textTransform: "uppercase" as const,
        color: "#9fe870", marginBottom: 20, opacity: 0.9,
        position: "relative",
      }}>
        {tab.emoji} {tab.tagline}
      </div>

      {/* Linha principal */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <Avatar name={entry.apelido} size={64} />
          <div style={{
            position: "absolute", bottom: -4, right: -8,
            fontSize: 20, lineHeight: 1,
            filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.7))",
          }}>🥇</div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "var(--font-display)", fontWeight: 900,
            fontSize: "clamp(30px, 8.5vw, 44px)", lineHeight: 0.9,
            letterSpacing: "-0.02em", textTransform: "uppercase" as const,
            color: "#fff",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {entry.apelido}
          </div>
          <div style={{
            fontFamily: "var(--font-body)", fontWeight: 500,
            fontSize: 13, color: "rgba(255,255,255,0.30)",
            marginTop: 6,
          }}>
            {entry.count} voto{entry.count !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Número grande de votos */}
        <div style={{
          fontFamily: "var(--font-display)", fontWeight: 900,
          fontSize: "clamp(52px, 14vw, 72px)", lineHeight: 1,
          letterSpacing: "-0.04em", color: "#9fe870",
          flexShrink: 0,
        }}>
          {entry.count}
        </div>
      </div>
    </div>
  );
}

function PodiumRow({ entry, rank }: { entry: RankingEntry; rank: 2 | 3 }) {
  const medals = { 2: "🥈", 3: "🥉" };
  return (
    <div style={{
      flex: 1,
      background: "#111",
      border: "1px solid #1e1e1e",
      borderRadius: 16,
      padding: "16px 14px",
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 10,
    }}>
      <span style={{ fontSize: 18 }}>{medals[rank]}</span>
      <Avatar name={entry.apelido} size={44} />
      <div style={{
        fontFamily: "var(--font-display)", fontWeight: 900,
        fontSize: 17, letterSpacing: "-0.01em",
        textTransform: "uppercase" as const,
        color: "rgba(255,255,255,0.85)", textAlign: "center",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        width: "100%",
      }}>
        {entry.apelido}
      </div>
      <div style={{
        fontFamily: "var(--font-display)", fontWeight: 900,
        fontSize: 30, letterSpacing: "-0.03em",
        color: "rgba(255,255,255,0.35)",
      }}>
        {entry.count}
      </div>
    </div>
  );
}

function ListRow({ entry, rank, isLast }: { entry: RankingEntry; rank: number; isLast: boolean }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "11px 0",
      borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.04)",
    }}>
      <span style={{
        fontFamily: "var(--font-display)", fontWeight: 900,
        fontSize: 14, color: "rgba(255,255,255,0.18)",
        width: 22, textAlign: "center", flexShrink: 0,
      }}>
        {rank}
      </span>
      <Avatar name={entry.apelido} size={36} />
      <span style={{
        flex: 1,
        fontFamily: "var(--font-body)", fontWeight: 600,
        fontSize: 15, color: "rgba(255,255,255,0.6)",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {entry.apelido}
      </span>
      <span style={{
        fontFamily: "var(--font-display)", fontWeight: 900,
        fontSize: 20, color: "rgba(255,255,255,0.3)",
        letterSpacing: "-0.02em", flexShrink: 0,
      }}>
        {entry.count}
      </span>
    </div>
  );
}

export function RankingTabs({ data, meuApelido }: { data: RankingData; meuApelido?: string }) {
  const [active, setActive] = useState<keyof RankingData>("MVP");
  const tab = TABS.find((t) => t.key === active)!;
  const ranking = data[active];

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>

      {/* ── Tab bar ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 20,
        background: "rgba(9,9,9,0.88)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        padding: "12px 16px",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 6,
        }}>
          {TABS.map((t) => {
            const isActive = active === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                style={{
                  height: 38,
                  borderRadius: 9999,
                  border: "none",
                  background: isActive ? "rgba(159,232,112,0.12)" : "rgba(255,255,255,0.04)",
                  boxShadow: isActive ? "0 0 0 1px rgba(159,232,112,0.35)" : "0 0 0 1px rgba(255,255,255,0.06)",
                  color: isActive ? "#9fe870" : "rgba(255,255,255,0.35)",
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: 13,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase" as const,
                  cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                  transition: "background 140ms, box-shadow 140ms, color 140ms",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 8 }}>

        {ranking.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "72px 24px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
          }}>
            <div style={{ fontSize: 56, opacity: 0.12 }}>{tab.emoji}</div>
            <p style={{
              fontFamily: "var(--font-display)", fontWeight: 900,
              fontSize: "clamp(28px, 8vw, 40px)", lineHeight: 0.95,
              textTransform: "uppercase" as const,
              color: "rgba(255,255,255,0.18)",
              letterSpacing: "-0.01em", margin: 0,
            }}>
              {tab.emptyMsg.split("\n").map((l, i) => <span key={i}>{l}<br /></span>)}
            </p>
            <p style={{
              fontFamily: "var(--font-body)", fontSize: 14,
              color: "rgba(255,255,255,0.2)", margin: 0,
            }}>
              Ainda não houve votação suficiente.
            </p>
          </div>
        ) : (
          <>
            {/* 1º lugar */}
            {ranking[0] && <FirstCard entry={ranking[0]} tab={tab} />}

            {/* 2º e 3º lado a lado */}
            {(ranking[1] || ranking[2]) && (
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                {ranking[1] && <PodiumRow entry={ranking[1]} rank={2} />}
                {ranking[2] && <PodiumRow entry={ranking[2]} rank={3} />}
                {/* se só tiver 2 entradas, garante que 3 preenche o espaço igualmente */}
                {ranking[1] && !ranking[2] && <div style={{ flex: 1 }} />}
              </div>
            )}

            {/* 4º+ */}
            {ranking.length > 3 && (
              <div style={{
                marginTop: 8,
                background: "#111",
                border: "1px solid #1e1e1e",
                borderRadius: 16,
                padding: "4px 16px",
              }}>
                {ranking.slice(3).map((entry, i, arr) => (
                  <ListRow
                    key={entry.apelido}
                    entry={entry}
                    rank={i + 4}
                    isLast={i === arr.length - 1}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
