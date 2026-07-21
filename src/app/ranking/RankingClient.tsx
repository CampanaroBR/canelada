"use client";

import { useState } from "react";
import Image from "next/image";
import { Bell, Trophy, ChartBar, Export, ChevronDown } from "reicon-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { MenuSheet } from "@/components/MenuSheet";
import { HamburgerIcon } from "@/components/HamburgerIcon";
import type { RankingGrupo, RankRow } from "@/lib/badges";
import { EmptyState, SegmentedControl, SectionHeader } from "@/ds";

// ouro / prata / bronze — cor sólida (borda, texto) + par de gradiente (fundo da medalha)
const PODIUM = ["#f0c257", "#d4d8dd", "#d98a4f"];
const PODIUM_GRADIENT = [
  "linear-gradient(160deg, #f7d88a 0%, #c8912e 100%)",
  "linear-gradient(160deg, #eef1f4 0%, #9aa1a8 100%)",
  "linear-gradient(160deg, #e8ac7a 0%, #a85c2e 100%)",
];

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
            background: "linear-gradient(180deg, #161816 0%, #131513 100%)",
            border: "1px solid #262926",
            borderRadius: 32,
            boxShadow: "0 24px 48px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)",
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
                    background: "#0d0f0d", border: "1px solid #262926",
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
  const gradiente = PODIUM_GRADIENT[pos - 1];
  const medalha = first ? 60 : 50;
  return (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, position: "relative" }}>
      {/* Coroa no 1º */}
      {first && (
        <div style={{ position: "absolute", top: -26, left: "50%", transform: "translateX(-50%) rotate(-14deg)", width: 32, height: 32, zIndex: 2, filter: "drop-shadow(0 4px 8px rgba(240,194,87,0.35))" }}>
          <Image src="/coroa-ranking.png" alt="" fill sizes="32px" style={{ objectFit: "contain" }} />
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        {/* Medalha: double-bezel — anel escuro (outer shell) + disco de gradiente (inner core) */}
        <div style={{
          width: medalha + 6, height: medalha + 6, borderRadius: "50%",
          background: "#0d0f0d", border: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: eu ? `0 0 0 2px rgba(159,232,112,0.9), 0 0 20px rgba(159,232,112,0.25)` : "none",
        }}>
          <div style={{
            width: medalha, height: medalha, borderRadius: "50%",
            background: gradiente,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `inset 0 2px 3px rgba(255,255,255,0.5), inset 0 -3px 6px rgba(0,0,0,0.28), 0 6px 14px -4px ${cor}55`,
          }}>
            <span style={{ fontFamily: "var(--font-numeric)", fontWeight: 800, fontSize: first ? 24 : 20, color: "rgba(20,16,8,0.82)", textShadow: "0 1px 0 rgba(255,255,255,0.3)" }}>{pos}</span>
          </div>
        </div>
        <p style={{
          margin: 0, maxWidth: "100%", fontFamily: "var(--font-display)", fontWeight: 700,
          fontSize: 15, lineHeight: "18px", color: eu ? "#9fe870" : "#e8e6de",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{row.apelido}</p>
      </div>

      {/* Placar — outer shell + inner core (double-bezel), mesma linguagem dos cards do app */}
      <div style={{
        width: "100%", padding: 3,
        background: "#0d0f0d", border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: 20,
      }}>
        <div style={{
          height: first ? 66 : 52,
          background: `linear-gradient(180deg, ${cor}14 0%, transparent 60%), #050605`,
          border: `1px solid ${cor}40`,
          borderRadius: 17,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1,
        }}>
          <span style={{ fontFamily: "var(--font-numeric)", fontWeight: 800, fontSize: first ? 22 : 18, lineHeight: "1.1", color: cor, fontVariantNumeric: "tabular-nums" }}>{row.pontos}</span>
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 9, letterSpacing: "0.06em", lineHeight: "12px", color: "#8a8880", textTransform: "uppercase" }}>pontos</span>
        </div>
      </div>
    </div>
  );
}

function ListRow({ row, pos, eu }: { row: RankRow; pos: number; eu: boolean }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      background: eu ? "linear-gradient(180deg, rgba(159,232,112,0.08) 0%, rgba(159,232,112,0.02) 100%)" : "#0d0f0d",
      border: `1px solid ${eu ? "rgba(159,232,112,0.45)" : "rgba(255,255,255,0.06)"}`,
      borderRadius: 18, padding: "10px 12px",
      transition: "background 200ms cubic-bezier(0.32,0.72,0,1)",
    }}>
      {/* Posição */}
      <div style={{
        width: 32, height: 32, flexShrink: 0, borderRadius: "50%",
        background: "#050605", border: `1px solid ${eu ? "#9fe870" : "rgba(255,255,255,0.1)"}`,
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
      <div style={{
        flexShrink: 0, height: 34, background: "#050605", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 11,
        padding: "0 10px", display: "flex", alignItems: "center", gap: 3,
      }}>
        <span style={{ fontFamily: "var(--font-numeric)", fontWeight: 800, fontSize: 15, color: "#9fe870", fontVariantNumeric: "tabular-nums" }}>{row.pontos}</span>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 9, letterSpacing: "0.04em", color: "#8a8880", textTransform: "uppercase" }}>pts</span>
      </div>
    </div>
  );
}
