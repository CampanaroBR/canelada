"use client";

import { useState } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { SealCheck, Lock, CheckCircle, MedalMilitary } from "@phosphor-icons/react";

const BADGE_CATALOG = [
  {
    id: "presenca",
    title: "PRESENÇA 🏅",
    badges: [
      { slug: "primeira-vitoria", nome: "Primeiro Baba",  svg: "/conquistas/primeira-vitoria.svg" },
      { slug: "veterano",         nome: "Veterano",        svg: "/conquistas/Veterano.svg" },
      { slug: "mais-presente",    nome: "Mais Presente",   svg: "/conquistas/mais-presente.svg" },
      { slug: "alma-do-grupo",    nome: "Alma do Grupo",   svg: "/conquistas/alma-do-grupo.svg" },
      { slug: "jogador-invisivel",nome: "Invisível",       svg: "/conquistas/jogador-invisivel.svg" },
      { slug: "lenda",            nome: "Lenda",           svg: "/conquistas/Lenda.svg" },
    ],
  },
  {
    id: "performance",
    title: "PERFORMANCE ⭐",
    badges: [
      { slug: "rei-absoluto",  nome: "Rei Absoluto",  svg: "/conquistas/rei-absoluto.svg" },
      { slug: "rei-do-mes",    nome: "Rei do Mês",    svg: "/conquistas/rei-do-mes.svg" },
      { slug: "trofeu-bagre",  nome: "Troféu Bagre",  svg: "/conquistas/trofeu-bagre.svg" },
      { slug: "so-perde",      nome: "Só Perde",      svg: "/conquistas/so-perde.svg" },
    ],
  },
  {
    id: "sequencias",
    title: "SEQUÊNCIAS 🔥",
    badges: [
      { slug: "em-chamas",      nome: "Em Chamas",      svg: "/conquistas/em-chamas.svg" },
      { slug: "invicto",        nome: "Invicto",         svg: "/conquistas/Invicto.svg" },
      { slug: "virada-de-chave",nome: "Virada de Chave", svg: "/conquistas/virada-de-chave.svg" },
      { slug: "consistente",    nome: "Consistente",     svg: "/conquistas/Consistente.svg" },
      { slug: "ma-fase",        nome: "Má Fase",         svg: "/conquistas/ma-fase.svg" },
    ],
  },
  {
    id: "reconhecimento",
    title: "RECONHECIMENTO 💪",
    badges: [
      { slug: "racudo-do-mes", nome: "Raçudo do Mês",  svg: "/conquistas/racudo-do-mes.svg" },
      { slug: "irregular",     nome: "Irregular",       svg: "/conquistas/Irregular.svg" },
      { slug: "lanterna",      nome: "Lanterna",        svg: "/conquistas/Lanterna.svg" },
    ],
  },
  {
    id: "colecao",
    title: "COLEÇÃO 🎖️",
    badges: [
      { slug: "completo", nome: "Completo!", svg: "/conquistas/Completo.svg" },
    ],
  },
] as const;

const ALL_SLUGS = BADGE_CATALOG.flatMap(c => c.badges.map(b => b.slug));
const TOTAL = ALL_SLUGS.length;

type Filter = "todas" | "desbloqueadas" | "andamento";

interface Props {
  unlockedSlugs: string[];
  lastConquista: { slug: string; nome: string; descricao: string } | null;
}

const BADGE_SVG: Record<string, string> = Object.fromEntries(
  BADGE_CATALOG.flatMap(c => c.badges.map(b => [b.slug, b.svg]))
);

export function MedalhasClient({ unlockedSlugs, lastConquista }: Props) {
  const [filter, setFilter] = useState<Filter>("todas");
  const unlockedSet = new Set(unlockedSlugs);
  const unlockedCount = ALL_SLUGS.filter(s => unlockedSet.has(s)).length;

  function shouldShow(slug: string): boolean {
    const unlocked = unlockedSet.has(slug);
    if (filter === "todas") return true;
    if (filter === "desbloqueadas") return unlocked;
    if (filter === "andamento") return !unlocked;
    return true;
  }

  return (
    <div style={{
      minHeight: "100dvh",
      background: "#090909",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      paddingBottom: "calc(104px + env(safe-area-inset-bottom, 0px))",
    }}>

      {/* ── TOPBAR ── */}
      <div style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "min(100%, 430px)", zIndex: 30,
        paddingTop: "env(safe-area-inset-top, 0px)",
        background: "rgba(255,255,255,0.1)",
        backdropFilter: "blur(50px)", WebkitBackdropFilter: "blur(50px)",
        borderBottom: "1px solid rgba(84,84,86,0.34)",
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

      {/* ── TEAL HEADER ── */}
      <div style={{
        background: "#147787",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 72px)",
        paddingBottom: 20,
        paddingLeft: 16,
        paddingRight: 16,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        width: "100%",
        boxSizing: "border-box",
        overflow: "clip",
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
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 12, lineHeight: "16px", color: "#9fe870", letterSpacing: "0.3px" }}>
                ÚLTIMA CONQUISTA
              </p>
              <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 20, lineHeight: "24px", color: "#fff" }}>
                {lastConquista.nome}
              </p>
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 12, lineHeight: "16px", color: "#9a9aa1" }}>
                {lastConquista.descricao}
              </p>
            </div>
            <div style={{ width: 72, height: 72, flexShrink: 0, position: "relative", overflow: "clip" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={lastConquista.nome}
                src={BADGE_SVG[lastConquista.slug] ?? `/conquistas/${lastConquista.slug}.svg`}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
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

      {/* ── MAIN CONTENT ── */}
      <div style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        paddingTop: 16,
        paddingLeft: 8,
        paddingRight: 8,
        boxSizing: "border-box",
      }}>

        {/* Section header + filter */}
        <div style={{
          background: "#171717",
          border: "1px solid #2e2e2e",
          borderRadius: 20,
          padding: "16px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}>
          {/* Title row */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              background: "#0f0f0f",
              border: "1px solid #2e2e2e",
              borderRadius: 10,
              width: 36, height: 36,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <SealCheck size={20} color="#9fe870" weight="fill" />
            </div>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, lineHeight: "20px", color: "#fff" }}>
              MEDALHAS CONQUISTADAS
            </span>
          </div>

          {/* Filter tabs */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", flexShrink: 0 }}>
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
                    padding: active ? "6px 12px" : "5px 11px",
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
        </div>

        {/* Badge categories */}
        <div style={{
          background: "#090909",
          borderRadius: 20,
          padding: "16px 0",
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}>
          {BADGE_CATALOG.map(cat => {
            const visible = cat.badges.filter(b => shouldShow(b.slug));
            if (visible.length === 0) return null;
            const catUnlocked = cat.badges.filter(b => unlockedSet.has(b.slug)).length;
            const catTotal = cat.badges.length;

            return (
              <div key={cat.id} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {/* Category header */}
                <div style={{ paddingLeft: 12 }}>
                  <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, lineHeight: "20px", color: "#fff" }}>
                    {cat.title}
                  </p>
                  <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 14, lineHeight: "20px", color: "#999" }}>
                    <span style={{ fontWeight: 700, color: catUnlocked > 0 ? "#9fe870" : "#fff" }}>{catUnlocked}</span>
                    <span style={{ color: "#fff" }}>/{catTotal}</span>
                    {" medalhas conquistadas"}
                  </p>
                </div>

                {/* Badge grid — rows of 3 */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 8, paddingRight: 8 }}>
                  {chunk(visible, 3).map((row, ri) => (
                    <div key={ri} style={{ display: "flex", gap: 8 }}>
                      {row.map(badge => {
                        const unlocked = unlockedSet.has(badge.slug);
                        return (
                          <div
                            key={badge.slug}
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
                              padding: unlocked ? "11px 8px" : "10px 8px",
                              gap: 8,
                              overflow: "hidden",
                            }}
                          >
                            {/* Lock / Check icon — top right */}
                            <div style={{ position: "absolute", top: unlocked ? 3 : 4, right: unlocked ? 4 : 5 }}>
                              {unlocked
                                ? <CheckCircle size={24} color="#9fe870" weight="fill" />
                                : <Lock size={14} color="rgba(255,255,255,0.4)" weight="fill" />
                              }
                            </div>

                            {/* Badge image + label */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                              {/* Container clips the bottom ~10% where SVG text is baked in */}
                              <div style={{ width: 72, height: 64, flexShrink: 0, overflow: "hidden", position: "relative" }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  alt={badge.nome}
                                  src={badge.svg}
                                  style={{
                                    position: "absolute", top: 0, left: 0,
                                    width: "100%", height: "112%",
                                    objectFit: "cover",
                                    objectPosition: "top center",
                                    opacity: unlocked ? 1 : 0.35,
                                  }}
                                />
                              </div>
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
                                width: "100%",
                                height: 6,
                                background: "rgba(120,120,120,0.2)",
                                borderRadius: 100,
                                overflow: "hidden",
                                position: "relative",
                                flexShrink: 0,
                              }}>
                                <div style={{
                                  position: "absolute",
                                  left: 0, top: 0,
                                  height: 6,
                                  width: "0%",
                                  background: "#9fe870",
                                  borderRadius: 100,
                                }} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {/* Fill empty slots */}
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

      <BottomNav />
    </div>
  );
}

function chunk<T>(arr: readonly T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) result.push([...arr.slice(i, i + size)]);
  return result;
}
