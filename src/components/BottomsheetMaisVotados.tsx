"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Lightning, Skull, X, ShareNetwork, MedalMilitary } from "@phosphor-icons/react";
import { BottomSheet } from "@/ds";

export type LeaderboardEntry = {
  rank: number;
  apelido: string;
  qtd: number;
  categoria: string;
};

interface Props {
  open: boolean;
  onClose: () => void;
  /** Um ranking por data (mesma ordem de `datas`) — o filtro troca de verdade. */
  entriesPorData: LeaderboardEntry[][];
  datas?: string[];
  dataAtiva?: number;
  /** "piores" troca título/ícone/cores pro tom vermelho do ranking negativo. */
  variant?: "melhores" | "piores";
}

const MEDAL_COLORS = ["#F59E0B", "#9CA3AF", "#B45309"];

export function BottomsheetMaisVotados({
  open, onClose, entriesPorData, datas = [], dataAtiva = 2, variant = "melhores",
}: Props) {
  const negativo = variant === "piores";
  const accent = negativo ? "#e56767" : "#9fe870";
  const borderTone = negativo ? "#3a2424" : "#2e2e2e";
  const rowBg = negativo ? "#1b1414" : "#1b1b1b";
  const title = negativo ? "PIORES DA RODADA" : "PARCIAL DA RODADA";
  const [activePill, setActivePill] = useState(dataAtiva);

  useEffect(() => {
    if (open) setActivePill(dataAtiva);
  }, [open, dataAtiva]);

  // Ranking da data selecionada — trocar de pill agora troca a lista de verdade.
  const entries = entriesPorData[activePill] ?? [];

  async function compartilhar() {
    const top = entries.slice(0, 5).map((e) => `${e.rank}. ${e.apelido} (${e.qtd}x ${e.categoria})`).join("\n");
    const text = `${negativo ? "💀" : "⚡"} ${title}${datas[activePill] ? ` — ${datas[activePill]}` : ""}\n\n${top}`;
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (typeof navigator !== "undefined" && navigator.share) await navigator.share({ title, text, url });
      else if (typeof navigator !== "undefined" && navigator.clipboard) { await navigator.clipboard.writeText(`${text}\n${url}`); alert("Parcial copiada!"); }
    } catch { /* cancelou */ }
  }

  return (
    <BottomSheet open={open} onClose={onClose} maxHeight="90dvh" boxShadow="0px 2px 8px rgba(40,41,61,0.16), 0px 16px 24px rgba(96,97,112,0.16)">
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px 16px",
      }}>
        {/* Left spacer (mirrors close button) */}
        <div style={{ width: 40, height: 40 }} />

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {negativo ? <Skull size={16} color={accent} weight="regular" /> : <Lightning size={16} color={accent} weight="regular" />}
          <span style={{
            fontFamily: "var(--font-display)", fontWeight: 800,
            fontSize: 18, lineHeight: "20px", color: "#fff",
          }}>
            {title}
          </span>
        </div>

        <button
          onClick={onClose}
          aria-label="Fechar"
          style={{
            width: 40, height: 40, background: "#000",
            border: "1px solid #424242", borderRadius: 24,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0,
          }}
        >
          <X size={16} color="#fff" weight="bold" />
        </button>
      </div>

      {/* Content */}
      <div style={{
        display: "flex", flexDirection: "column", gap: 16,
        padding: "0 16px",
      }}>
        {/* Datas + compartilhar (à direita) */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", flex: 1, minWidth: 0 }}>
            {datas.map((d, i) => {
              const active = i === activePill;
              return (
                <button
                  key={i}
                  onClick={() => setActivePill(i)}
                  style={{
                    background: active ? accent : "#111",
                    border: active ? "none" : `1px solid ${borderTone}`,
                    borderRadius: 9999,
                    padding: active ? "6px 12px" : "7px 13px",
                    fontFamily: "var(--font-display)", fontWeight: 700,
                    fontSize: 12, lineHeight: "18px",
                    color: active ? "#000" : "#555",
                    cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap",
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        {/* Leaderboard rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {entries.map((entry) => (
            <div
              key={entry.rank}
              style={{
                background: "#090909", border: `1px solid ${borderTone}`, borderRadius: 14,
                paddingLeft: 24, paddingRight: 8,
                paddingTop: 8, paddingBottom: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{
                  fontFamily: "var(--font-numeric)", fontWeight: 700,
                  fontSize: 20, lineHeight: "18px", color: "#fff", flexShrink: 0,
                }}>
                  {entry.rank}.
                </span>
                <div style={{
                  flex: 1, minWidth: 1, background: rowBg, borderRadius: 12,
                  display: "flex", alignItems: "center", gap: 8,
                  padding: 8, height: 52,
                }}>
                  {/* Player info */}
                  <div style={{ flex: 1, minWidth: 1, display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
                    <div style={{
                      width: 40, height: 40, background: negativo ? "#3a2424" : "#3a3a3a", borderRadius: 12,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <span style={{ fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: 20, color: "#fff" }}>
                        {entry.qtd}x
                      </span>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{
                        margin: 0, fontFamily: "var(--font-display)", fontWeight: 800,
                        fontSize: 16, lineHeight: "18px", color: "#fff",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {entry.apelido.toUpperCase()}
                      </p>
                      <p style={{
                        margin: 0, fontFamily: "var(--font-display)", fontWeight: 500,
                        fontSize: 12, lineHeight: "14px", color: negativo ? "#a97d7d" : "#8d908d",
                      }}>
                        {entry.categoria}
                      </p>
                    </div>
                  </div>

                  {/* Ícone: medalha (top 3, ranking positivo) ou caveira (todo mundo, ranking negativo) */}
                  {negativo ? (
                    <div style={{
                      width: 40, height: 40, background: "#000",
                      border: `1px solid ${borderTone}`, borderRadius: 12,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Skull size={24} weight="fill" color={accent} />
                    </div>
                  ) : entry.rank <= 3 && (
                    <div style={{
                      width: 40, height: 40, background: "#000",
                      border: "1px solid #353535", borderRadius: 12,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <MedalMilitary
                        size={28}
                        weight="fill"
                        color={MEDAL_COLORS[entry.rank - 1]}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ver mais → Ranking */}
        <Link href="/ranking" onClick={onClose} style={{ display: "block", textAlign: "center", padding: "6px 0 2px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#fff", textDecoration: "none", WebkitTapHighlightColor: "transparent" }}>
          Ver mais
        </Link>

        {/* Compartilhar (full-width) */}
        <button onClick={compartilhar} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", height: 54, borderRadius: 16, background: "#0a0e0e", border: "1px solid #2c2c2c", cursor: "pointer", WebkitTapHighlightColor: "transparent" }}>
          <ShareNetwork size={18} color={accent} weight="bold" />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "#fff" }}>Compartilhar</span>
        </button>
      </div>
    </BottomSheet>
  );
}
