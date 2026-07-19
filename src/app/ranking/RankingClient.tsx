"use client";

import { useState } from "react";
import Image from "next/image";
import { Bell, Trophy, ChartBar, Export, ChevronDown } from "reicon-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { MenuSheet } from "@/components/MenuSheet";
import { HamburgerIcon } from "@/components/HamburgerIcon";
import type { RankingGrupo, RankRow } from "@/lib/badges";
import { EmptyState, SegmentedControl, SectionHeader } from "@/ds";

// ouro / prata / bronze (Figma)
const PODIUM = ["#c5973a", "#999999", "#734524"];
const PT_COLOR = ["#c5973a", "#c0c0c0", "#cd7f32"];

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
        <div style={{ height: 42, paddingLeft: 8, display: "flex", alignItems: "center" }}>
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
            background: "#171717", border: "1px solid #2c2c2c",
            borderRadius: "48px 48px 16px 16px",
            boxShadow: "0px 4px 4px rgba(0,0,0,0.25)",
            padding: "24px 8px 16px", display: "flex", flexDirection: "column", gap: 24,
          }}>
            {/* Pódio */}
            {top3.length > 0 && (
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 16, position: "relative" }}>
                {orderPodium(top3).map(({ row, pos }) => (
                  <PodiumCol key={row.jogadorId} row={row} pos={pos} eu={row.jogadorId === meuId} />
                ))}
              </div>
            )}

            {/* Lista 4º+ */}
            {resto.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {restoVisivel.map((row, i) => (
                  <ListRow key={row.jogadorId} row={row} pos={i + 4} eu={row.jogadorId === meuId} />
                ))}

                {/* Ver mais / Ver menos */}
                {resto.length > VISIVEL_INICIAL && (
                  <button onClick={() => setVerTudo(v => !v)} style={{
                    marginTop: 4, height: 46, borderRadius: 16, cursor: "pointer",
                    background: "#0a0e0e", border: "1px solid #2c2c2c",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#fff",
                    WebkitTapHighlightColor: "transparent",
                  }}>
                    {verTudo ? "Ver menos" : `Ver mais (${resto.length - VISIVEL_INICIAL})`}
                    <ChevronDown size={14} color="#9fe870" weight="Outline" style={{ transform: verTudo ? "rotate(180deg)" : "none" }} />
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

/** Reordena top3 em [2º, 1º, 3º] (1º no centro). */
function orderPodium(top3: RankRow[]): { row: RankRow; pos: number }[] {
  const wp = top3.map((row, i) => ({ row, pos: i + 1 }));
  const out: { row: RankRow; pos: number }[] = [];
  if (wp[1]) out.push(wp[1]);
  if (wp[0]) out.push(wp[0]);
  if (wp[2]) out.push(wp[2]);
  return out;
}

function PodiumCol({ row, pos, eu }: { row: RankRow; pos: number; eu: boolean }) {
  const first = pos === 1;
  const cor = PODIUM[pos - 1];
  const ptCor = PT_COLOR[pos - 1];
  return (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, position: "relative" }}>
      {/* Coroa no 1º */}
      {first && (
        <div style={{ position: "absolute", top: -22, left: "50%", transform: "translateX(-50%) rotate(-16deg)", width: 34, height: 34, zIndex: 2 }}>
          <Image src="/coroa-ranking.png" alt="" fill sizes="34px" style={{ objectFit: "contain" }} />
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <div style={{
          width: first ? 54 : 46, height: first ? 54 : 46, borderRadius: 40,
          background: "#090909", border: `2px solid ${cor}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-numeric)", fontWeight: 600, fontSize: 20, color: "#fff",
        }}>{pos}</div>
        <p style={{
          margin: 0, maxWidth: "100%", fontFamily: "var(--font-display)", fontWeight: 600,
          fontSize: 18, lineHeight: "20px", color: eu ? "#9fe870" : "#fff",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{row.apelido}</p>
      </div>

      {/* Caixa de pontos */}
      <div style={{
        width: "100%", height: first ? 72 : 56,
        background: "#090909", border: `1px solid ${cor}`,
        borderRadius: "20px 0 20px 20px",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: first ? 24 : 20, lineHeight: "1.1", color: ptCor, fontVariantNumeric: "tabular-nums" }}>{row.pontos}</span>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 10, lineHeight: "14px", color: "#fff" }}>pnts</span>
      </div>
    </div>
  );
}

function ListRow({ row, pos, eu }: { row: RankRow; pos: number; eu: boolean }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
      {/* Posição */}
      <div style={{
        width: 44, flexShrink: 0, background: "#090909",
        border: `1px solid ${eu ? "#9fe870" : "#383838"}`, borderRadius: "20px 0 20px 20px",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: 20, color: "#fff",
      }}>{pos}</div>

      {/* Linha */}
      <div style={{
        flex: 1, minWidth: 0, background: "#000",
        border: `1px solid ${eu ? "#9fe870" : "#383838"}`, borderRadius: "0 20px 20px 20px",
        padding: 8,
      }}>
        <div style={{
          background: "#090909", borderRadius: 12,
          padding: "4px 8px 4px 16px", display: "flex", alignItems: "center", gap: 8,
        }}>
          <div style={{ flex: 1, minWidth: 0, padding: "4px 0" }}>
            <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, lineHeight: "20px", color: eu ? "#9fe870" : "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {row.apelido.toUpperCase()}
            </p>
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontWeight: 400, fontSize: 14, lineHeight: "1.4", color: "#7a7a7a" }}>
              {row.rodadas} {row.rodadas === 1 ? "rodada" : "rodadas"} · {row.mvps} MVP{row.mvps === 1 ? "" : "s"}
            </p>
          </div>
          <div style={{
            height: 40, background: "#000", border: "1px solid #353535", borderRadius: 12,
            padding: "4px 8px", display: "flex", alignItems: "center", gap: 2, flexShrink: 0,
          }}>
            <span style={{ fontFamily: "var(--font-numeric)", fontWeight: 700, fontSize: 16, color: "#9fe870", fontVariantNumeric: "tabular-nums" }}>{row.pontos}</span>
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 10, color: "#fff" }}>pnts</span>
          </div>
        </div>
      </div>
    </div>
  );
}
