"use client";

import { useState } from "react";
import Link from "next/link";
import { BottomNav } from "@/components/layout/BottomNav";
import { BottomsheetMaisVotados } from "@/components/BottomsheetMaisVotados";
import type { LeaderboardEntry } from "@/components/BottomsheetMaisVotados";

type IMG = Record<string, string>;
type MaisVotado = { apelido: string; qtd: number; categoria: string };
type Personagem  = { tipo: string; texto: string; data: Date };
type Conquista   = { apelido: string; traitNome: string; traitEmoji: string | null; data: Date };

interface Props {
  IMG: IMG;
  rodadaId: string | null;
  dataRodada: string | null;
  jaVotou: boolean;
  maisVotados: MaisVotado[];
  personagens: Personagem[];
  conquistas: Conquista[];
  datePills: string[];
  criarRodadaAction: () => Promise<void>;
}

export function HomeClient({
  IMG, rodadaId, dataRodada, jaVotou,
  maisVotados, personagens, conquistas, datePills,
  criarRodadaAction,
}: Props) {
  const [bsOpen, setBsOpen] = useState(false);
  const [activePill, setActivePill] = useState(datePills.length - 1);

  const lbEntries: LeaderboardEntry[] = maisVotados.slice(0, 6).map((v, i) => ({
    rank: i + 1,
    apelido: v.apelido,
    qtd: v.qtd,
    categoria: v.categoria,
  }));

  const mascots = [IMG.mascotPreg, IMG.mascotMat, IMG.mascotBagre];
  const tipoLabel: Record<string, string> = { MVP: "MATADOR", BAGRE: "BAGRE DA NOITE" };
  const tipoColor: Record<string, string> = { MVP: "#9fe870", BAGRE: "#d42020" };
  const badgeImgs = [IMG.emChamas, IMG.virada, IMG.maFase];
  const medalImgs = [IMG.medal1, IMG.medal2, IMG.medal3];

  return (
    <div style={{ minHeight: "100dvh", background: "#090909", paddingBottom: "calc(84px + env(safe-area-inset-bottom,0px))" }}>

      {/* ── TOPBAR ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 30,
        background: "rgba(9,9,9,0.9)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      }}>
        <div style={{ height: 54 }} /> {/* status bar */}
        <div style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px" }}>
          <button style={{ width: 56, height: 64, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG.list} alt="Menu" style={{ width: 24, height: 24 }} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMG.logo} alt="Canelada" style={{ width: 64, height: 64, objectFit: "contain" }} />
          <button style={{ width: 56, height: 60, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG.bell} alt="Notificações" style={{ width: 28, height: 28 }} />
          </button>
        </div>
      </header>

      <main style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── 1. VOTAÇÃO CARD (teal) ── */}
        <section style={{
          background: "#1998ad",
          borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
          paddingBottom: 24, paddingLeft: 16, paddingRight: 16,
          marginTop: -118, paddingTop: "calc(118px + 16px)",
        }}>
          {/* White outer card */}
          <div style={{ background: "#fff", borderRadius: 48, padding: 12, overflow: "hidden" }}>
            {/* Campo inner card */}
            <div style={{ position: "relative", borderRadius: 40, border: "1px solid #777575", overflow: "hidden", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Field BG */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img aria-hidden src={IMG.campo} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
              <div aria-hidden style={{ position: "absolute", inset: 0, background: "rgba(35,52,0,0.34)", pointerEvents: "none" }} />

              {/* Match info row */}
              <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, lineHeight: "20px", color: "#fff" }}>VOTAÇÃO DO</p>
                  <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 32, lineHeight: "32px", color: "#fff" }}>BABA</p>
                  <div style={{ marginTop: 6, display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(55,55,55,0.2)", padding: "4px 8px", borderRadius: 100 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: rodadaId ? "#00ff00" : "#888" }} />
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 12, color: "#fff", letterSpacing: "-0.4px" }}>
                      {rodadaId ? "Votação aberta até às 15h" : "Nenhuma rodada aberta"}
                    </span>
                  </div>
                </div>
                {dataRodada && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <div style={{ background: "#1e1e1e", padding: "4px 8px", borderRadius: 48, display: "flex", alignItems: "center", gap: 4 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={IMG.calendar} alt="" style={{ width: 16, height: 16 }} />
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, color: "#9fe870", letterSpacing: "-0.48px" }}>{dataRodada}</span>
                    </div>
                    <div style={{ background: "#1e1e1e", padding: "4px 8px", borderRadius: 48, display: "flex", alignItems: "center", gap: 4 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={IMG.alarm} alt="" style={{ width: 16, height: 16 }} />
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12, color: "#fff", letterSpacing: "-0.48px" }}>20:00</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Players formation */}
              <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
                <PlayerSlot imgSrc={IMG.tshirt} />
                <div style={{ display: "flex", gap: 62, justifyContent: "center", width: "100%" }}>
                  <PlayerSlot imgSrc={IMG.tshirt} />
                  <PlayerSlot imgSrc={IMG.tshirt} />
                  <PlayerSlot imgSrc={IMG.tshirt} />
                </div>
                <div style={{ borderTop: "1px solid #5e5e5e", width: 292, paddingTop: 16, display: "flex", justifyContent: "center" }}>
                  <PlayerSlot imgSrc={IMG.tshirt} />
                </div>
              </div>

              {/* CTA */}
              <div style={{ position: "relative" }}>
                {rodadaId && !jaVotou ? (
                  <Link href="/votacao" style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "#0d0d0d", border: "1px solid #000",
                    borderRadius: 14, padding: "8px 16px", textDecoration: "none",
                    boxShadow: "0 4px 10px 2px rgba(0,0,0,0.25)",
                  }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, lineHeight: "22px", color: "#9fe870", letterSpacing: "-0.8px" }}>VOTAR AGORA</span>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(255,255,255,0.45)" }}>Escolha a personagem de cada um</span>
                    </div>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#9fe870", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#090909" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </div>
                  </Link>
                ) : !rodadaId ? (
                  <form action={criarRodadaAction}>
                    <button type="submit" style={{
                      width: "100%", background: "#0d0d0d", border: "1px solid #000",
                      borderRadius: 14, padding: "13px 16px",
                      fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "#9fe870",
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
                      letterSpacing: "-0.8px",
                    }}>
                      ⚽ BABA ROLOU HOJE
                    </button>
                  </form>
                ) : (
                  <div style={{ background: "#0d0d0d", border: "1px solid #000", borderRadius: 14, padding: "13px 16px", textAlign: "center" }}>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "rgba(255,255,255,0.4)" }}>Você já votou nesta rodada ✓</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. MAIS VOTADOS ── */}
        {maisVotados.length > 0 && (
          <section style={{ margin: "0 8px", background: "#141414", borderRadius: 20, overflow: "hidden" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "17px 17px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={IMG.trophy} alt="" style={{ width: 16, height: 16, opacity: 0.7 }} />
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14, color: "#fff" }}>MAIS VOTADOS</span>
              </div>
              <button onClick={() => setBsOpen(true)} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Ver mais</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={IMG.caretRight} alt="" style={{ width: 12, height: 12, opacity: 0.4 }} />
              </button>
            </div>
            {/* Top 3 rows */}
            <div style={{ padding: "8px 17px 17px", display: "flex", flexDirection: "column" }}>
              {maisVotados.slice(0, 3).map((v, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "8px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "#fff", width: 20, textAlign: "right", flexShrink: 0 }}>{i + 1}.</span>
                  <div style={{ flex: 1, background: "#1b1b1b", borderRadius: 12, display: "flex", alignItems: "center", gap: 8, padding: 8, height: 52 }}>
                    <div style={{ width: 40, height: 40, background: "#3a3a3a", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 20, color: "#fff" }}>{v.qtd}x</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "#fff" }}>{v.apelido.toUpperCase()}</p>
                      <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 12, color: "#8d908d" }}>{v.categoria}</p>
                    </div>
                    <div style={{ width: 40, height: 40, background: "#000", border: "1px solid #353535", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={medalImgs[i]} alt="" style={{ width: 28, height: 28 }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 3. PERSONAGEM DA SEMANA ── */}
        {personagens.length > 0 && (
          <section style={{ margin: "0 8px", background: "#141414", borderRadius: 20, overflow: "hidden" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", padding: "17px 17px 0" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMG.calendarStar} alt="" style={{ width: 16, height: 16, opacity: 0.7 }} />
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14, color: "#fff", marginLeft: 8 }}>PERSONAGEM DA SEMANA</span>
            </div>

            {/* Date filter pills */}
            {datePills.length > 0 && (
              <div style={{ display: "flex", gap: 8, padding: "13px 17px 0", overflow: "auto" }}>
                {datePills.map((d, i) => (
                  <button key={i} onClick={() => setActivePill(i)} style={{
                    background: i === activePill ? "#9fe870" : "#111",
                    border: i === activePill ? "none" : "1px solid #2e2e2e",
                    borderRadius: 9999, padding: i === activePill ? "6px 12px" : "7px 13px",
                    fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12,
                    color: i === activePill ? "#000" : "#555",
                    cursor: "pointer", flexShrink: 0,
                  }}>{d}</button>
                ))}
              </div>
            )}

            {/* Personagem cards */}
            <div style={{ padding: "8px 17px 17px", display: "flex", flexDirection: "column" }}>
              {personagens.map((p, i) => {
                const label = tipoLabel[p.tipo] ?? p.tipo;
                const color = tipoColor[p.tipo] ?? "#fff";
                const dateStr = new Date(p.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
                const mascot = mascots[i % mascots.length];
                // Extract first two words as name
                const nome = p.texto.split(" ").slice(0, 2).join(" ");
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 17,
                    padding: "17px 0",
                    borderBottom: i < personagens.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                  }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 20, color, lineHeight: "24px" }}>{label}</p>
                      <p style={{ margin: "2px 0 0", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15, color: "#fff" }}>{nome}</p>
                      <p style={{ margin: "2px 0 0", fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
                        Votado {p.tipo === "MVP" ? "📅" : "🐟"} · {dateStr}
                      </p>
                      <button style={{
                        marginTop: 10, background: "#1e1e1e", border: "none",
                        borderRadius: 8, padding: "6px 12px",
                        fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12,
                        color: "rgba(255,255,255,0.6)", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 4,
                      }}>
                        Ver mais
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={IMG.caretRight} alt="" style={{ width: 12, height: 12, opacity: 0.6 }} />
                      </button>
                    </div>
                    <div style={{ width: 117, height: 117, flexShrink: 0, position: "relative" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={mascot} alt={label} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── 4. MEDALHAS ── */}
        {conquistas.length > 0 && (
          <section style={{ margin: "0 8px", background: "#141414", borderRadius: 20, overflow: "hidden" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "17px 17px 0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={IMG.medal} alt="" style={{ width: 16, height: 16, opacity: 0.7 }} />
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14, color: "#fff" }}>MEDALHAS</span>
              </div>
              <Link href="/ranking" style={{ display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Ver todas</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={IMG.caretRight} alt="" style={{ width: 12, height: 12, opacity: 0.4 }} />
              </Link>
            </div>

            {/* Counter */}
            <div style={{ padding: "16px 17px 0", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 24 }}>🥇</span>
              <div>
                <p style={{ margin: 0, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: "#fff" }}>
                  {conquistas.length} de {conquistas.length} jogadores
                </p>
                <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
                  já conquistaram uma medalha
                </p>
              </div>
            </div>

            {/* Achievement rows */}
            <div style={{ padding: "8px 17px 17px", display: "flex", flexDirection: "column" }}>
              {conquistas.map((c, i) => {
                const dateStr = new Date(c.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
                const badge = badgeImgs[i % badgeImgs.length];
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 16,
                    padding: "9px 0",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                  }}>
                    <div style={{ width: 72, height: 72, flexShrink: 0, borderRadius: 16, overflow: "hidden", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={badge} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>
                        HOJE · NOVA MEDALHA
                      </p>
                      <p style={{ margin: "2px 0 0", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "#fff", lineHeight: "20px" }}>
                        {c.apelido} destravou &ldquo;{c.traitNome}&rdquo;!
                      </p>
                      <p style={{ margin: "2px 0 0", fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                        {dateStr}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Bottomsheet MAIS VOTADOS */}
      <BottomsheetMaisVotados
        open={bsOpen}
        onClose={() => setBsOpen(false)}
        entries={lbEntries}
        datas={datePills}
        dataAtiva={datePills.length - 1}
      />

      <BottomNav />
    </div>
  );
}

function PlayerSlot({ imgSrc }: { imgSrc: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{
        width: 48, height: 48,
        background: "#1e1e1e", border: "1px solid #555",
        borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: -8, boxShadow: "0 5px 7px 4px rgba(0,0,0,0.3)",
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imgSrc} alt="" style={{ width: 24, height: 24 }} />
      </div>
      <p style={{ margin: 0, marginTop: 10, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 12, color: "#fff" }}>VOTE</p>
    </div>
  );
}
