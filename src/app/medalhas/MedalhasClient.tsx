"use client";

import { useState } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { SealCheck, Lock, CheckCircle, MedalMilitary } from "@phosphor-icons/react";

const BADGE_CATALOG = [
  {
    id: "presenca",
    title: "PRESENÇA 🏅",
    badges: [
      { slug: "primeiro-baba",  nome: "Primeira Pelada", descricao: "Participou da primeira rodada registrada no Canelada.", svg: "/conquistas/primeiro-baba.svg" },
      { slug: "veterano",       nome: "Veterano",         descricao: "Participou de 10 rodadas.", svg: "/conquistas/veterano.svg" },
      { slug: "casca-grossa",   nome: "Casca Grossa",     descricao: "Participou de 25 rodadas.", svg: "/conquistas/casca-grossa.svg" },
      { slug: "mais-presente",  nome: "Mais Presente",    descricao: "Participou de 100% das rodadas de um mês.", svg: "/conquistas/mais-presente.svg" },
      { slug: "alma-do-grupo",  nome: "Alma do Grupo",    descricao: "Participou de ao menos 80% das rodadas em 3 meses consecutivos.", svg: "/conquistas/alma-do-grupo.svg" },
      { slug: "hall-da-fama",   nome: "Hall da Fama",     descricao: "Participou de 50 rodadas.", svg: "/conquistas/hall-da-fama.svg" },
      { slug: "lenda-do-baba",  nome: "Lenda do Baba",    descricao: "Participou de 100 rodadas e tem pelo menos 5 MVPs.", svg: "/conquistas/lenda-do-baba.svg" },
    ],
  },
  {
    id: "performance",
    title: "PERFORMANCE ⭐",
    badges: [
      { slug: "mvp",              nome: "MVP",              descricao: "Recebeu MVP pela primeira vez.", svg: "/conquistas/mvp.svg" },
      { slug: "rei-absoluto",     nome: "Rei Absoluto",     descricao: "Recebeu 5 MVPs acumulados.", svg: "/conquistas/rei-absoluto.svg" },
      { slug: "craque-da-galera", nome: "Craque da Galera", descricao: "Recebeu 10 MVPs acumulados.", svg: "/conquistas/craque-da-galera.svg" },
      { slug: "rei-do-mes",       nome: "Rei do Mês",       descricao: "Jogador com mais MVPs durante um mês.", svg: "/conquistas/rei-do-mes.svg" },
      { slug: "craque-historico", nome: "Craque Histórico", descricao: "Recebeu 20 MVPs acumulados.", svg: "/conquistas/craque-historico.svg" },
    ],
  },
  {
    id: "sequencias",
    title: "SEQUÊNCIAS 🔥",
    badges: [
      { slug: "em-chamas",       nome: "Em Chamas",       descricao: "Recebeu destaque positivo em 3 rodadas consecutivas.", svg: "/conquistas/em-chamas.svg" },
      { slug: "imparavel",       nome: "Imparável",        descricao: "Recebeu destaque positivo em 5 rodadas consecutivas.", svg: "/conquistas/imparavel.svg" },
      { slug: "invicto",         nome: "Invicto",          descricao: "Sem traits negativas por 5 rodadas consecutivas.", svg: "/conquistas/invicto.svg" },
      { slug: "virada-de-chave", nome: "Virada de Chave",  descricao: "Recebeu trait negativa e conquistou destaque positivo na rodada seguinte.", svg: "/conquistas/virada-de-chave.svg" },
      { slug: "consistente",     nome: "Consistente",      descricao: "Participou de 8 rodadas consecutivas.", svg: "/conquistas/consistente.svg" },
    ],
  },
  {
    id: "reconhecimento",
    title: "RECONHECIMENTO 💪",
    badges: [
      { slug: "operario",          nome: "Operário",          descricao: "Recebeu a trait Raçudo 5 vezes.", svg: "/conquistas/operario.svg" },
      { slug: "racudo-do-mes",     nome: "Raçudo do Mês",     descricao: "Recebeu mais votos para Raçudo durante um mês.", svg: "/conquistas/racudo-do-mes.svg" },
      { slug: "resenha-forte",     nome: "Resenha Forte",     descricao: "Recebeu 20 traits sociais acumuladas.", svg: "/conquistas/resenha-forte.svg" },
      { slug: "querido-da-galera", nome: "Querido da Galera", descricao: "Recebeu 50 destaques positivos acumulados.", svg: "/conquistas/querido-da-galera.svg" },
    ],
  },
  {
    id: "colecao",
    title: "COLEÇÃO 🎖️",
    badges: [
      { slug: "colecionador",      nome: "Colecionador",      descricao: "Desbloqueou 8 badges.", svg: "/conquistas/colecionador.svg" },
      { slug: "mestre-da-resenha", nome: "Mestre da Resenha", descricao: "Desbloqueou 16 badges.", svg: "/conquistas/mestre-da-resenha.svg" },
      { slug: "completo",          nome: "Completo!",          descricao: "Desbloqueou todas as badges do jogo.", svg: "/conquistas/completo.svg" },
    ],
  },
] as const;

type BadgeEntry = typeof BADGE_CATALOG[number]["badges"][number];

const ALL_SLUGS = BADGE_CATALOG.flatMap(c => c.badges.map(b => b.slug));
const TOTAL = ALL_SLUGS.length;

const BADGE_SVG: Record<string, string> = Object.fromEntries(
  BADGE_CATALOG.flatMap(c => c.badges.map(b => [b.slug, b.svg]))
);

type Filter = "todas" | "desbloqueadas" | "andamento";

interface Props {
  unlockedSlugs: string[];
  lastConquista: { slug: string; nome: string; descricao: string } | null;
}

export function MedalhasClient({ unlockedSlugs, lastConquista }: Props) {
  const [filter, setFilter] = useState<Filter>("todas");
  const [selected, setSelected] = useState<BadgeEntry | null>(null);
  const unlockedSet = new Set(unlockedSlugs);
  const unlockedCount = ALL_SLUGS.filter(s => unlockedSet.has(s)).length;

  function shouldShow(slug: string): boolean {
    if (filter === "todas") return true;
    if (filter === "desbloqueadas") return unlockedSet.has(slug);
    if (filter === "andamento") return !unlockedSet.has(slug);
    return true;
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#090909" }}>

      {/* ── TOPBAR ── */}
      <div style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "min(100%, 430px)", zIndex: 30,
        paddingTop: "env(safe-area-inset-top, 0px)",
        background: "rgba(0,0,0,0.15)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "4px 8px",
      }}>
        <div style={{ width: 56, height: 56 }} />
        <div style={{ width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Canelada" style={{ width: 40, height: 40, objectFit: "contain" }} />
        </div>
        <div style={{ width: 56, height: 56 }} />
      </div>

      {/* ── TEAL HEADER + BANNER ── */}
      <div style={{
        background: "#147787",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 72px)",
        paddingBottom: 36,
        paddingLeft: 16,
        paddingRight: 16,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        boxSizing: "border-box",
        width: "100%",
      }}>
        {lastConquista ? (
          <div style={{
            background: "#090909",
            border: "1px solid #2e2e2e",
            borderRadius: 18,
            padding: "11px 9px 11px 17px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 12, lineHeight: "16px", color: "#9fe870" }}>
                ÚLTIMA CONQUISTA
              </p>
              <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 20, lineHeight: "24px", color: "#fff" }}>
                {lastConquista.nome}
              </p>
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 12, lineHeight: "16px", color: "#9a9aa1" }}>
                {lastConquista.descricao}
              </p>
            </div>
            <div style={{ width: 72, height: 72, flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={lastConquista.nome}
                src={BADGE_SVG[lastConquista.slug] ?? `/conquistas/${lastConquista.slug}.svg`}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
          </div>
        ) : (
          <div style={{
            background: "#090909",
            border: "1px solid #2e2e2e",
            borderRadius: 18,
            padding: "17px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}>
            <MedalMilitary size={32} color="#9fe870" weight="fill" />
            <div>
              <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 12, lineHeight: "16px", color: "#9fe870" }}>
                NENHUMA CONQUISTA AINDA
              </p>
              <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 16, lineHeight: "20px", color: "#fff" }}>
                Vote na pelada para desbloquear!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── MAIN CARD — contém tudo ── */}
      <div style={{
        background: "#171717",
        borderTopLeftRadius: 48,
        borderTopRightRadius: 48,
        paddingTop: 24,
        paddingLeft: 8,
        paddingRight: 8,
        paddingBottom: "calc(104px + env(safe-area-inset-bottom, 0px))",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}>

        {/* Section header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, height: 42 }}>
          <div style={{
            background: "#171717",
            border: "1px solid #2e2e2e",
            borderRadius: 12,
            padding: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <SealCheck size={24} color="#9fe870" weight="fill" />
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, lineHeight: "20px", color: "#fff" }}>
            MEDALHAS CONQUISTADAS
          </span>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
          {(["todas", "desbloqueadas", "andamento"] as Filter[]).map(f => {
            const active = filter === f;
            const label = f === "todas"
              ? `Todas (${TOTAL})`
              : f === "desbloqueadas"
              ? `Desbloqueadas (${unlockedCount})`
              : `Em andamento (${TOTAL - unlockedCount})`;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  background: active ? "#9fe870" : "transparent",
                  border: active ? "none" : "1px solid #2e2e2e",
                  borderRadius: 9999,
                  padding: "5px 12px",
                  cursor: "pointer",
                  flexShrink: 0,
                  fontFamily: "var(--font-display)",
                  fontWeight: active ? 700 : 600,
                  fontSize: 12,
                  lineHeight: "18px",
                  color: active ? "#090909" : "#f5f5f5",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Inner badge container */}
        <div style={{
          background: "#090909",
          border: "1px solid #2e2e2e",
          borderRadius: 20,
          padding: "13px 9px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}>
          {BADGE_CATALOG.map(cat => {
            const visible = cat.badges.filter(b => shouldShow(b.slug));
            if (visible.length === 0) return null;
            const catUnlocked = cat.badges.filter(b => unlockedSet.has(b.slug)).length;

            return (
              <div key={cat.id} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {/* Category header */}
                <div style={{ paddingLeft: 4 }}>
                  <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, lineHeight: "20px", color: "#fff" }}>
                    {cat.title}
                  </p>
                  <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 14, lineHeight: "20px", color: "#999" }}>
                    <span style={{ fontWeight: 700, color: catUnlocked > 0 ? "#9fe870" : "#fff" }}>{catUnlocked}</span>
                    <span style={{ color: "#fff" }}>/{cat.badges.length}</span>
                    {" medalhas conquistadas"}
                  </p>
                </div>

                {/* Badge rows of 3 */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {chunk(visible, 3).map((row, ri) => (
                    <div key={ri} style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
                      {row.map(badge => {
                        const unlocked = unlockedSet.has(badge.slug);
                        return (
                          <div
                            key={badge.slug}
                            onClick={() => setSelected(badge)}
                            style={{
                              flex: "1 0 0",
                              minWidth: 0,
                              position: "relative",
                              background: unlocked ? "#0a0e0e" : "#171717",
                              border: unlocked ? "1px solid #2e2e2e" : "none",
                              borderRadius: 12,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: unlocked ? "11px 4px" : "10px 4px",
                              gap: 0,
                              overflow: "hidden",
                              cursor: "pointer",
                              WebkitTapHighlightColor: "transparent",
                            }}
                          >
                            {/* Lock / Check icon */}
                            <div style={{ position: "absolute", top: unlocked ? 3 : 4, right: 4 }}>
                              {unlocked
                                ? <CheckCircle size={24} color="#9fe870" weight="fill" />
                                : <Lock size={14} color="rgba(255,255,255,0.35)" weight="fill" />
                              }
                            </div>

                            {/* Player: image + label */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                              {/* Badge image with -8px bottom margin */}
                              <div style={{ width: 72, height: 72, flexShrink: 0, marginBottom: -8 }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  alt={badge.nome}
                                  src={badge.svg}
                                  style={{
                                    width: "100%", height: "100%",
                                    objectFit: "contain",
                                    opacity: unlocked ? 1 : 0.3,
                                  }}
                                />
                              </div>

                              {/* Label */}
                              <p style={{
                                margin: 0,
                                fontFamily: "var(--font-display)",
                                fontWeight: 800,
                                fontSize: 12,
                                lineHeight: "13.75px",
                                color: unlocked ? "#fff" : "rgba(255,255,255,0.25)",
                                textAlign: "center",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: "100%",
                              }}>
                                {badge.nome}
                              </p>
                            </div>

                            {/* Progress bar (locked only) */}
                            {!unlocked && (
                              <div style={{
                                width: 72,
                                height: 6,
                                background: "rgba(120,120,120,0.2)",
                                borderRadius: 100,
                                overflow: "hidden",
                                flexShrink: 0,
                                marginTop: 8,
                              }}>
                                <div style={{
                                  height: "100%",
                                  width: "0%",
                                  background: "#9fe870",
                                  borderRadius: 100,
                                }} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {row.length < 3 && Array.from({ length: 3 - row.length }).map((_, i) => (
                        <div key={`empty-${i}`} style={{ flex: "1 0 0", minWidth: 0 }} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── BADGE BOTTOM SHEET ── */}
      {selected && (() => {
        const unlocked = unlockedSet.has(selected.slug);
        return (
          <>
            {/* Backdrop */}
            <div
              onClick={() => setSelected(null)}
              style={{
                position: "fixed", inset: 0,
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
                zIndex: 40,
              }}
            />

            {/* Sheet */}
            <div style={{
              position: "fixed",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "min(100%, 430px)",
              zIndex: 50,
              background: "#111",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: "12px 20px calc(32px + env(safe-area-inset-bottom, 0px))",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0,
            }}>
              {/* Handle */}
              <div style={{ width: 36, height: 4, background: "#333", borderRadius: 100, marginBottom: 20 }} />

              {/* Badge image */}
              <div style={{
                width: 120, height: 120,
                background: unlocked ? "rgba(159,232,112,0.06)" : "rgba(255,255,255,0.04)",
                border: unlocked ? "1px solid rgba(159,232,112,0.2)" : "1px solid #2a2a2a",
                borderRadius: 20,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 16,
                flexShrink: 0,
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selected.svg}
                  alt={selected.nome}
                  style={{ width: 96, height: 96, objectFit: "contain", opacity: unlocked ? 1 : 0.3 }}
                />
              </div>

              {/* Status pill */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                background: unlocked ? "rgba(159,232,112,0.12)" : "rgba(255,255,255,0.06)",
                border: unlocked ? "1px solid rgba(159,232,112,0.3)" : "1px solid #2a2a2a",
                borderRadius: 100,
                padding: "3px 10px",
                marginBottom: 10,
              }}>
                {unlocked
                  ? <CheckCircle size={13} color="#9fe870" weight="fill" />
                  : <Lock size={11} color="rgba(255,255,255,0.35)" weight="fill" />
                }
                <span style={{
                  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11,
                  color: unlocked ? "#9fe870" : "rgba(255,255,255,0.35)",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}>
                  {unlocked ? "Conquistada" : "Bloqueada"}
                </span>
              </div>

              {/* Name */}
              <p style={{
                margin: "0 0 8px",
                fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 26, lineHeight: "30px",
                color: "#fff", textAlign: "center",
              }}>
                {selected.nome}
              </p>

              {/* Description */}
              <p style={{
                margin: "0 0 24px",
                fontFamily: "var(--font-body)", fontWeight: 400, fontSize: 14, lineHeight: "20px",
                color: "#888", textAlign: "center",
                maxWidth: 280,
              }}>
                {selected.descricao}
              </p>

              {/* Close button */}
              <button
                onClick={() => setSelected(null)}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "#1e1e1e",
                  border: "1px solid #2a2a2a",
                  borderRadius: 14,
                  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15,
                  color: "#fff",
                  cursor: "pointer",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                Fechar
              </button>
            </div>
          </>
        );
      })()}

      <BottomNav />
    </div>
  );
}

function chunk<T>(arr: readonly T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) result.push([...arr.slice(i, i + size)]);
  return result;
}
