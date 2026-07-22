"use client";

import { useState } from "react";
import Image from "next/image";
import { Bell, Trophy, ChartBar, Export, ChevronDown } from "reicon-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { MenuSheet } from "@/components/MenuSheet";
import { HamburgerIcon } from "@/components/HamburgerIcon";
import type { RankingGrupo } from "@/lib/badges";
import { EmptyState, SegmentedControl, SectionHeader } from "@/ds";
import { PodiumCol, ListRow, orderPodium } from "./RankingPieces";

const VISIVEL_INICIAL = 5; // linhas (4º em diante) antes do "Ver mais"

interface Props {
  ranking: RankingGrupo;
  grupoNome: string;
  meuId: string;
}

export function RankingClient({ ranking, grupoNome, meuId }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  // abre na aba que tem dados (evita "vazio" quando a semana ainda não teve rodada)
  const [periodo, setPeriodo] = useState<"semana" | "mes">(
    ranking.semana.classificacao.length > 0 ? "semana" : "mes"
  );
  const [verTudo, setVerTudo] = useState(false);

  const data = ranking[periodo];
  const top3 = data.classificacao.slice(0, 3);
  const resto = data.classificacao.slice(3);
  const restoVisivel = verTudo ? resto : resto.slice(0, VISIVEL_INICIAL);
  const temDados = data.classificacao.length > 0;

  async function compartilhar() {
    const top = data.classificacao.slice(0, 5)
      .map((r, i) => `${i + 1}. ${r.apelido} — ${r.pontos} pts`).join("\n");
    const periodoLabel = periodo === "semana" ? "semanal" : "mensal";
    const text = `🏆 Classificação ${periodoLabel} — ${grupoNome}\n\n${top}`;
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: `Classificação — ${grupoNome}`, text, url });
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        alert("Classificação copiada!");
      }
    } catch { /* usuário cancelou */ }
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#090909" }}>
      {/* ── TOPBAR ── */}
      <div className="glass-bar" style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "min(100%, 430px)", zIndex: 30, paddingTop: "env(safe-area-inset-top, 0px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px" }}>
          <button onClick={() => setMenuOpen(true)} aria-label="Menu" style={{ width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer" }}>
            <HamburgerIcon open={menuOpen} />
          </button>
          <div style={{ padding: 4, display: "flex", overflow: "clip" }}>
            <Image alt="Canelada" src="/logo.png" width={48} height={48} priority style={{ objectFit: "cover", borderRadius: "50%" }} />
          </div>
          <button aria-label="Notificações" style={{ width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer" }}>
            <Bell size={24} color="#fff" weight="Outline" />
          </button>
        </div>
      </div>

      {/* ── HEADER CONTAINER (arredondado embaixo) ── */}
      <div style={{
        background: "#0a0e0e", border: "1px solid #2c2c2c",
        borderRadius: "0 0 40px 40px",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 96px)",
        paddingBottom: 20, paddingLeft: 16, paddingRight: 16, boxSizing: "border-box",
      }}>
        {/* Section header */}
        <div style={{ paddingLeft: 8, paddingRight: 8 }}>
          <SectionHeader
            icon={<ChartBar size={24} color="#9fe870" weight="Filled" />}
            title="CLASSIFICAÇÃO"
            subtitle="Pontuação da galera"
            trailing={
              <button onClick={compartilhar} aria-label="Compartilhar classificação" style={{
                background: "#171717", border: "1px solid #2c2c2c", borderRadius: 16,
                width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", flexShrink: 0, WebkitTapHighlightColor: "transparent",
              }}>
                <Export size={24} color="#9fe870" weight="Outline" />
              </button>
            }
          />
        </div>

        {/* Toggle Semanal / Mensal */}
        <div style={{ paddingTop: 14 }}>
          <SegmentedControl
            fullWidth
            value={periodo}
            onChange={(v) => { setPeriodo(v as "semana" | "mes"); setVerTudo(false); }}
            items={[{ value: "semana", label: "Semanal" }, { value: "mes", label: "Mensal" }]}
          />
        </div>
      </div>

      {/* ── CONTEÚDO ── */}
      <main style={{ padding: "0 8px", paddingBottom: "calc(104px + env(safe-area-inset-bottom, 0px))" }}>
        {!temDados ? (
          <div style={{ margin: "16px 8px 0" }}>
            <EmptyState
              icon={<Trophy size={26} weight="Outline" />}
              title="Sem classificação ainda"
              description={periodo === "semana" ? "Nenhuma rodada encerrada nesta semana." : "Nenhuma rodada encerrada neste mês."}
            />
          </div>
        ) : (
          <div style={{
            background: "#171717",
            border: "1px solid #2c2c2c",
            borderRadius: 32,
            boxShadow: "0 24px 48px -20px rgba(0,0,0,0.55)",
            padding: "28px 12px 16px", display: "flex", flexDirection: "column", gap: 28,
          }}>
            {/* Pódio */}
            {top3.length > 0 && (
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 10, position: "relative" }}>
                {orderPodium(top3).map(({ row, pos }) => (
                  <PodiumCol key={row.jogadorId} row={row} pos={pos} eu={row.jogadorId === meuId} />
                ))}
              </div>
            )}

            {/* Lista 4º+ */}
            {resto.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {restoVisivel.map((row, i) => (
                  <ListRow key={row.jogadorId} row={row} pos={i + 4} eu={row.jogadorId === meuId} />
                ))}

                {/* Ver mais / Ver menos */}
                {resto.length > VISIVEL_INICIAL && (
                  <button onClick={() => setVerTudo(v => !v)} style={{
                    marginTop: 6, height: 48, borderRadius: 16, cursor: "pointer",
                    background: "#0d0f0d", border: "1px solid #2c2c2c",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#e8e6de",
                    WebkitTapHighlightColor: "transparent",
                    transition: "border-color 180ms cubic-bezier(0.32,0.72,0,1), color 180ms cubic-bezier(0.32,0.72,0,1)",
                  }}>
                    {verTudo ? "Ver menos" : `Ver mais (${resto.length - VISIVEL_INICIAL})`}
                    <ChevronDown size={14} color="#9fe870" weight="Outline" style={{ transform: verTudo ? "rotate(180deg)" : "none", transition: "transform 220ms cubic-bezier(0.32,0.72,0,1)" }} />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <BottomNav />
      <MenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
