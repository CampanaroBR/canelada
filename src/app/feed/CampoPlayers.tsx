"use client";

import Link from "next/link";
import type { PersonagemSemana } from "@/components/ShareCardModal";

export const TSHIRT_OUTLINE = "/tshirt-outline.svg";
export const TSHIRT_GK_OUT = "/tshirt-gk-outline.svg";
// Melhores da rodada: linha azul, goleiro vermelho.
export const TSHIRT_FILLED = "/tshirt-filled.svg";
export const TSHIRT_GK_FILL = "/tshirt-gk-filled.svg";
// Piores da rodada: linha vermelho-claro, goleiro vinho — cores diferentes
// dos melhores pra não confundir os dois times na mesma tela.
export const TSHIRT_FILLED_PIORES = "/tshirt-filled-piores.svg";
export const TSHIRT_GK_FILL_PIORES = "/tshirt-gk-filled-piores.svg";

/* Slot vazio: camisa + "VOTE" */
export function PlayerSlot({ tshirt, href }: { tshirt: string; href?: string }) {
  const inner = (
    <>
      <div style={{
        background: "#1e1e1e", border: "1px solid #555", borderRadius: 22,
        width: 48, height: 48,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: -8,
        boxShadow: "0px 5px 6.9px 4px rgba(0,0,0,0.3)",
        padding: 7, overflow: "clip", flexShrink: 0,
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" src={tshirt} style={{ width: 24, height: 24 }} />
      </div>
      <p style={{ margin: 0, marginTop: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 12, lineHeight: "normal", color: "#fff", textAlign: "center", whiteSpace: "nowrap" }}>VOTE</p>
    </>
  );
  const wrap: React.CSSProperties = { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, WebkitTapHighlightColor: "transparent" };
  return href
    ? <Link href={href} style={{ ...wrap, textDecoration: "none" }}>{inner}</Link>
    : <div style={wrap}>{inner}</div>;
}

/* Slot com nome do jogador (estado pós-votação) */
export function PlayerNamed({ p, tshirt, onShare }: { p: PersonagemSemana | null; tshirt: string; onShare: (p: PersonagemSemana) => void }) {
  const name = p?.vencedor ?? "?";
  const clickable = !!p;
  return (
    <button
      onClick={() => p && onShare(p)}
      disabled={!clickable}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1,
        background: "none", border: "none", padding: 0, cursor: clickable ? "pointer" : "default",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <div style={{
        background: "#1e1e1e", border: "1px solid #555", borderRadius: 22,
        width: 48, height: 48,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: -8,
        boxShadow: "0px 5px 6.9px 4px rgba(0,0,0,0.3)",
        padding: 7, overflow: "clip", flexShrink: 0,
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" src={tshirt} style={{ width: 24, height: 24 }} />
      </div>
      <p style={{ margin: 0, marginTop: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 12, lineHeight: "normal", color: "#fff", textAlign: "center", whiteSpace: "nowrap", maxWidth: 72, overflow: "hidden", textOverflow: "ellipsis" }}>{name}</p>
    </button>
  );
}
