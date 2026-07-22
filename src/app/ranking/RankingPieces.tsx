"use client";

import type { RankRow } from "../../lib/badges";

// Ouro / prata / bronze — cor SÓLIDA (flat, sem degradê: o Bagre DS não usa
// gradiente). A profundidade vem de sombras/inset, não de gradient.
export const PODIUM = ["#f0c257", "#d4d8dd", "#d98a4f"];

const GRIS = "#2c2c2c"; // stroke cinza padrão do produto/DS

/** Reordena top3 em [2º, 1º, 3º] (1º no centro). */
export function orderPodium(top3: RankRow[]): { row: RankRow; pos: number }[] {
  const wp = top3.map((row, i) => ({ row, pos: i + 1 }));
  const out: { row: RankRow; pos: number }[] = [];
  if (wp[1]) out.push(wp[1]);
  if (wp[0]) out.push(wp[0]);
  if (wp[2]) out.push(wp[2]);
  return out;
}

export function PodiumCol({ row, pos, eu }: { row: RankRow; pos: number; eu: boolean }) {
  const first = pos === 1;
  const cor = PODIUM[pos - 1];
  const medalha = first ? 60 : 50;
  return (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, position: "relative" }}>
      {/* Coroa "caída" — repousa na borda da medalha, levemente tombada pro lado. */}
      {first && (
        <div style={{
          position: "absolute", top: -11, left: "calc(50% + 6px)",
          transform: "rotate(22deg)", transformOrigin: "bottom left",
          width: 30, height: 30, zIndex: 2,
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/coroa-ranking.png" alt="" width={30} height={30} style={{ objectFit: "contain" }} />
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        {/* Medalha: double-bezel — anel escuro (shell) + disco de cor sólida (core). */}
        <div style={{
          width: medalha + 6, height: medalha + 6, borderRadius: "50%",
          background: "#0d0f0d", border: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: eu ? "0 0 0 2px #9fe870, 0 0 18px rgba(159,232,112,0.28)" : "none",
        }}>
          <div style={{
            width: medalha, height: medalha, borderRadius: "50%",
            background: cor, // cor chapada, sem degradê nem inset (DS Bagre é flat)
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontFamily: "var(--font-numeric)", fontWeight: 800, fontSize: first ? 24 : 20, color: "rgba(20,16,8,0.82)" }}>{pos}</span>
          </div>
        </div>
        <p style={{
          margin: 0, maxWidth: "100%", fontFamily: "var(--font-display)", fontWeight: 700,
          fontSize: 15, lineHeight: "18px", color: eu ? "#9fe870" : "#e8e6de",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{row.apelido}</p>
        <span style={{
          fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 11, lineHeight: "14px",
          color: "#767469", whiteSpace: "nowrap",
        }}>{row.rodadas} {row.rodadas === 1 ? "rodada" : "rodadas"}</span>
      </div>

      {/* Placar — double-bezel flat: shell escuro + core preto com borda da cor. */}
      <div style={{ width: "100%", padding: 3, background: "#0d0f0d", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 20 }}>
        <div style={{
          height: first ? 66 : 52, background: "#050605", border: `1px solid ${cor}40`, borderRadius: 17,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1,
        }}>
          <span style={{ fontFamily: "var(--font-numeric)", fontWeight: 800, fontSize: first ? 22 : 18, lineHeight: "1.1", color: cor, fontVariantNumeric: "tabular-nums" }}>{row.pontos}</span>
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 9, letterSpacing: "0.06em", lineHeight: "12px", color: "#8a8880", textTransform: "uppercase" }}>pontos</span>
        </div>
      </div>
    </div>
  );
}

export function ListRow({ row, pos, eu }: { row: RankRow; pos: number; eu: boolean }) {
  return (
    <div
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 12,
        background: eu ? "rgba(159,232,112,0.06)" : "#0d0f0d",
        border: `1px solid ${eu ? "#9fe870" : GRIS}`,
        borderRadius: 18, padding: "10px 12px",
      }}
    >
      {/* Posição */}
      <div style={{
        width: 32, height: 32, flexShrink: 0, borderRadius: "50%",
        background: "#050605", border: `1px solid ${eu ? "#9fe870" : GRIS}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: 14, color: eu ? "#9fe870" : "#9a9890",
      }}>{pos}</div>

      {/* Nome + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, lineHeight: "19px", color: eu ? "#9fe870" : "#e8e6de", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {row.apelido.toUpperCase()}
        </p>
        <p style={{ margin: 0, fontFamily: "var(--font-body)", fontWeight: 400, fontSize: 13, lineHeight: "1.4", color: "#767469" }}>
          {row.rodadas} {row.rodadas === 1 ? "rodada" : "rodadas"} · {row.mvps} MVP{row.mvps === 1 ? "" : "s"}
        </p>
      </div>

      {/* Pontos */}
      <div style={{ flexShrink: 0, height: 34, background: "#050605", border: `1px solid ${GRIS}`, borderRadius: 11, padding: "0 10px", display: "flex", alignItems: "center", gap: 3 }}>
        <span style={{ fontFamily: "var(--font-numeric)", fontWeight: 800, fontSize: 15, color: "#9fe870", fontVariantNumeric: "tabular-nums" }}>{row.pontos}</span>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 9, letterSpacing: "0.04em", color: "#8a8880", textTransform: "uppercase" }}>pts</span>
      </div>
    </div>
  );
}
