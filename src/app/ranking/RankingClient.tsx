"use client";

import { useState } from "react";
import Image from "next/image";
import { List, Bell, Trophy, Crown } from "@phosphor-icons/react";
import { BottomNav } from "@/components/layout/BottomNav";
import { MenuSheet } from "@/components/MenuSheet";
import { TRAIT_SVG } from "@/lib/assets";
import type { RankingGrupo, RankRow, TraitLeader } from "@/lib/badges";

// label + cor de acento por personagem
const TRAIT_META: Record<string, { label: string; cor: string }> = {
  categoria: { label: "Craque", cor: "#9fe870" },
  matador:   { label: "Matador", cor: "#f0a14e" },
  paredao:   { label: "Paredão", cor: "#5aa9e6" },
  garcom:    { label: "Garçom", cor: "#b98ef0" },
  racudo:    { label: "Raçudo", cor: "#3fcaa8" },
  bagre:     { label: "Bagre", cor: "#ef6b6b" },
};

const PODIUM = ["#e2c485", "#c0c0c0", "#cd7f32"]; // ouro, prata, bronze

const rgba = (hex: string, a: number) =>
  `rgba(${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)},${a})`;

interface Props {
  ranking: RankingGrupo;
  grupoNome: string;
  meuId: string;
}

export function RankingClient({ ranking, grupoNome, meuId }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [periodo, setPeriodo] = useState<"mes" | "geral">("mes");

  const data = ranking[periodo];
  const top3 = data.classificacao.slice(0, 3);
  const resto = data.classificacao.slice(3);
  const temDados = data.classificacao.length > 0;

  return (
    <div style={{ minHeight: "100dvh", background: "#090909" }}>
      {/* ── TOPBAR ── */}
      <div className="glass-bar" style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "min(100%, 430px)", zIndex: 30,
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px" }}>
          <button onClick={() => setMenuOpen(true)} aria-label="Menu" style={{ width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer" }}>
            <List size={24} color="#fff" weight="bold" />
          </button>
          <div style={{ padding: 4, display: "flex", overflow: "clip" }}>
            <Image alt="Canelada" src="/logo.png" width={48} height={48} priority style={{ objectFit: "cover", borderRadius: "50%" }} />
          </div>
          <button aria-label="Notificações" style={{ width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer" }}>
            <Bell size={24} color="#fff" weight="bold" />
          </button>
        </div>
      </div>

      {/* ── HEADER + TOGGLE ── */}
      <div style={{
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 96px)",
        paddingBottom: 16, paddingLeft: 16, paddingRight: 16, boxSizing: "border-box",
      }}>
        <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
          {grupoNome}
        </div>
        <h1 style={{ margin: "2px 0 0", fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 40, lineHeight: 0.95, letterSpacing: "-0.02em", textTransform: "uppercase", color: "#fff" }}>
          Classificação
        </h1>
        <div style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 13, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
          Pontos por Personagem da Semana
        </div>

        {/* Toggle Mês / Geral */}
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          {([["mes", "Mês atual"], ["geral", "Geral"]] as const).map(([key, label]) => {
            const active = periodo === key;
            return (
              <button
                key={key}
                onClick={() => setPeriodo(key)}
                style={{
                  flex: 1, height: 38, borderRadius: 9999, cursor: "pointer",
                  background: active ? "#9fe870" : "#111",
                  border: active ? "none" : "1px solid #2e2e2e",
                  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13,
                  color: active ? "#000" : "#7a7a7a",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <main style={{ padding: "0 16px", paddingBottom: "calc(104px + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column", gap: 24 }}>
        {!temDados ? (
          <div style={{ background: "#0a0e0e", border: "1px solid #2c2c2c", borderRadius: 20, padding: "40px 20px", textAlign: "center" }}>
            <Trophy size={40} color="#3a3a3a" weight="fill" style={{ marginBottom: 12 }} />
            <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "#fff" }}>
              Sem classificação ainda
            </p>
            <p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 13, color: "#7a7a7a" }}>
              {periodo === "mes" ? "Nenhuma rodada encerrada neste mês." : "Nenhuma rodada encerrada ainda."}
            </p>
          </div>
        ) : (
          <>
            {/* ── PÓDIO ── */}
            {top3.length > 0 && (
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 8 }}>
                {orderPodium(top3).map(({ row, pos }) => (
                  <Podium key={row.jogadorId} row={row} pos={pos} eu={row.jogadorId === meuId} />
                ))}
              </div>
            )}

            {/* ── CLASSIFICAÇÃO (4º em diante) ── */}
            {resto.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {resto.map((row, i) => (
                  <RankRowItem key={row.jogadorId} row={row} pos={i + 4} eu={row.jogadorId === meuId} />
                ))}
              </div>
            )}

            {/* ── PERSONAGENS (líderes por trait) ── */}
            {(() => {
              const craque = data.lideres.find(l => l.slug === "categoria");
              const bagre = data.lideres.find(l => l.slug === "bagre");
              const positivos = data.lideres.filter(l => l.slug !== "categoria" && l.slug !== "bagre");
              return (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <Crown size={18} color="#e2c485" weight="fill" />
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase", color: "#fff" }}>
                      Donos da temporada
                    </span>
                  </div>
                  <p style={{ margin: "0 0 14px", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 12, color: "#7a7a7a" }}>
                    Quem mais leva cada personagem
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {craque && <LeaderCard leader={craque} size="lg" />}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                      {positivos.map(l => <LeaderCard key={l.slug} leader={l} size="sm" />)}
                    </div>
                    {bagre && <LeaderCard leader={bagre} size="lg" />}
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </main>

      <BottomNav />
      <MenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}

/** Reordena top3 em [2º, 1º, 3º] pra o pódio (1º no centro). */
function orderPodium(top3: RankRow[]): { row: RankRow; pos: number }[] {
  const withPos = top3.map((row, i) => ({ row, pos: i + 1 }));
  const out: { row: RankRow; pos: number }[] = [];
  if (withPos[1]) out.push(withPos[1]);
  if (withPos[0]) out.push(withPos[0]);
  if (withPos[2]) out.push(withPos[2]);
  return out;
}

function Podium({ row, pos, eu }: { row: RankRow; pos: number; eu: boolean }) {
  const cor = PODIUM[pos - 1];
  const first = pos === 1;
  return (
    <div style={{ flex: 1, maxWidth: 130, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{
        width: first ? 64 : 52, height: first ? 64 : 52, borderRadius: "50%",
        background: "#0a0e0e", border: `2px solid ${cor}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-display)", fontWeight: 900, fontSize: first ? 24 : 20, color: cor,
      }}>
        {pos}
      </div>
      <p style={{
        margin: 0, maxWidth: "100%", fontFamily: "var(--font-display)", fontWeight: 800,
        fontSize: 13, color: eu ? "#9fe870" : "#fff", textAlign: "center",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>
        {row.apelido.toUpperCase()}
      </p>
      <div style={{
        width: "100%", background: "#0a0e0e", border: `1px solid ${cor}33`,
        borderRadius: 12, padding: first ? "12px 0" : "9px 0", textAlign: "center",
      }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: first ? 22 : 18, color: cor }}>
          {row.pontos}
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 10, color: "#7a7a7a" }}>pts</div>
      </div>
    </div>
  );
}

function RankRowItem({ row, pos, eu }: { row: RankRow; pos: number; eu: boolean }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      background: eu ? "rgba(159,232,112,0.08)" : "#0a0e0e",
      border: `1px solid ${eu ? "#9fe870" : "#2c2c2c"}`,
      borderRadius: 14, padding: "10px 14px",
    }}>
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "#7a7a7a", width: 28, flexShrink: 0 }}>
        {pos}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, lineHeight: "18px", color: eu ? "#9fe870" : "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {row.apelido.toUpperCase()}
        </p>
        <p style={{ margin: "2px 0 0", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 11, color: "#7a7a7a" }}>
          {row.rodadas} {row.rodadas === 1 ? "rodada" : "rodadas"} · {row.mvps} MVP{row.mvps === 1 ? "" : "s"}
        </p>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 18, color: "#9fe870" }}>{row.pontos}</span>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 10, color: "#7a7a7a", marginLeft: 3 }}>pts</span>
      </div>
    </div>
  );
}

function LeaderCard({ leader, size }: { leader: TraitLeader; size: "lg" | "sm" }) {
  const svg = TRAIT_SVG[leader.slug];
  const meta = TRAIT_META[leader.slug] ?? { label: leader.slug, cor: "#9fe870" };
  const cor = meta.cor;
  const lg = size === "lg";
  const vazio = !leader.apelido;
  const avatar = lg ? 64 : 48;
  const img = lg ? 46 : 34;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: lg ? 14 : 10,
      background: "#0b0f0e",
      border: `1px solid ${vazio ? "#222" : rgba(cor, 0.34)}`,
      borderRadius: 16, padding: lg ? 14 : 11,
      boxSizing: "border-box", overflow: "hidden", minWidth: 0,
    }}>
      {/* Arte do personagem em círculo tonalizado */}
      <div style={{
        width: avatar, height: avatar, flexShrink: 0, borderRadius: "50%",
        background: vazio ? "#141414" : rgba(cor, 0.13),
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ width: img, height: img, position: "relative", opacity: vazio ? 0.35 : 1 }}>
          {svg && <Image src={svg} alt={meta.label} fill sizes={`${img}px`} style={{ objectFit: "contain" }} />}
        </div>
      </div>

      {/* Texto */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          display: "inline-block",
          fontFamily: "var(--font-display)", fontWeight: 800,
          fontSize: lg ? 11 : 10, letterSpacing: "0.06em", textTransform: "uppercase",
          color: cor, background: rgba(cor, 0.12),
          padding: "2px 8px", borderRadius: 6,
        }}>
          {meta.label}
        </span>
        <p style={{
          margin: "6px 0 0", fontFamily: "var(--font-display)", fontWeight: 900,
          fontSize: lg ? 20 : 15, lineHeight: lg ? "22px" : "17px",
          color: vazio ? "#5a5a5a" : "#fff",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {vazio ? "Ninguém ainda" : leader.apelido!.toUpperCase()}
        </p>
        {!vazio && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6,
            background: rgba(cor, 0.12), borderRadius: 9999, padding: "2px 9px",
          }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 12, color: cor }}>
              {leader.titulos}×
            </span>
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: cor }}>
              {leader.titulos === 1 ? "título" : "títulos"}
            </span>
          </div>
        )}
      </div>

      {/* Coroa no destaque (Craque) */}
      {lg && leader.slug === "categoria" && !vazio && (
        <Crown size={22} color={cor} weight="fill" style={{ flexShrink: 0, opacity: 0.9 }} />
      )}
    </div>
  );
}
