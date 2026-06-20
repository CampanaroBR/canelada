"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { BottomNav } from "@/components/layout/BottomNav";
import { Lock, CheckCircle, MedalMilitary, List, Bell, X, User, UsersThree, SignOut } from "@phosphor-icons/react";

const BADGE_CATALOG = [
  {
    id: "presenca",
    title: "PRESENÇA",
    badges: [
      { slug: "primeiro-baba",  nome: "Primeira Pelada", descricao: "Participou da primeira rodada registrada no Canelada.", svg: "/conquistas/primeiro-baba.png", tagline: "PRIMEIRA DE MUITAS!", rara: false },
      { slug: "veterano",       nome: "Veterano",         descricao: "Participou de 10 rodadas.",                                                                    svg: "/conquistas/veterano.png",       tagline: "10 PARTIDAS, QUE RAÇA!",       rara: false },
      { slug: "casca-grossa",   nome: "Casca Grossa",     descricao: "Participou de 25 rodadas.",                                                                    svg: "/conquistas/casca-grossa.png",   tagline: "25 PARTIDAS CONCLUÍDAS!",      rara: false },
      { slug: "mais-presente",  nome: "Mais Presente",    descricao: "Participou de 100% das rodadas de um mês.",                                                    svg: "/conquistas/mais-presente.png",  tagline: "100% DE PRESENÇA!",            rara: false },
      { slug: "alma-do-grupo",  nome: "Alma do Grupo",    descricao: "Participou de ao menos 80% das rodadas em 3 meses consecutivos.",                              svg: "/conquistas/alma-do-grupo.png",  tagline: "PILAR DO GRUPO!",              rara: false },
      { slug: "hall-da-fama",   nome: "Hall da Fama",     descricao: "Participou de 50 rodadas.",                                                                    svg: "/conquistas/hall-da-fama.png",   tagline: "50 PARTIDAS, LENDÁRIO!",       rara: true  },
      { slug: "lenda-do-baba",  nome: "Lenda do Baba",    descricao: "Participou de 100 rodadas e tem pelo menos 5 MVPs.",                                           svg: "/conquistas/lenda-do-baba.png",  tagline: "O LENDÃO DO BABA!",            rara: true  },
    ],
  },
  {
    id: "performance",
    title: "PERFORMANCE",
    badges: [
      { slug: "mvp",              nome: "MVP",              descricao: "Recebeu MVP pela primeira vez.",                 svg: "/conquistas/mvp.png",              tagline: "PRIMEIRO MVP!",              rara: false },
      { slug: "rei-absoluto",     nome: "Rei Absoluto",     descricao: "Recebeu 5 MVPs acumulados.",                    svg: "/conquistas/rei-absoluto.png",     tagline: "5 MVPs, É REI!",             rara: false },
      { slug: "craque-da-galera", nome: "Craque da Galera", descricao: "Recebeu 10 MVPs acumulados.",                   svg: "/conquistas/craque-da-galera.png", tagline: "10 MVPs E CRESCENDO!",       rara: true  },
      { slug: "rei-do-mes",       nome: "Rei do Mês",       descricao: "Jogador com mais MVPs durante um mês.",         svg: "/conquistas/rei-do-mes.png",       tagline: "MELHOR DO MÊS!",             rara: false },
      { slug: "craque-historico", nome: "Craque Histórico", descricao: "Recebeu 20 MVPs acumulados.",                   svg: "/conquistas/craque-historico.png", tagline: "20 MVPs, CRAQUE HISTÓRICO!", rara: true  },
    ],
  },
  {
    id: "sequencias",
    title: "SEQUÊNCIAS",
    badges: [
      { slug: "em-chamas",       nome: "Em Chamas",       descricao: "Recebeu destaque positivo em 3 rodadas consecutivas.",                                svg: "/conquistas/em-chamas.png",       tagline: "3 DESTAQUES SEGUIDOS!",  rara: false },
      { slug: "imparavel",       nome: "Imparável",        descricao: "Recebeu destaque positivo em 5 rodadas consecutivas.",                                svg: "/conquistas/imparavel.png",       tagline: "5 SEGUIDOS, IMPARÁVEL!", rara: true  },
      { slug: "invicto",         nome: "Invicto",          descricao: "Sem traits negativas por 5 rodadas consecutivas.",                                    svg: "/conquistas/invicto.png",         tagline: "LIMPO POR 5 RODADAS!",   rara: true  },
      { slug: "virada-de-chave", nome: "Virada de Chave",  descricao: "Recebeu trait negativa e conquistou destaque positivo na rodada seguinte.",           svg: "/conquistas/virada-de-chave.png", tagline: "QUE REVIRAVOLTA!",       rara: false },
      { slug: "consistente",     nome: "Consistente",      descricao: "Participou de 8 rodadas consecutivas.",                                              svg: "/conquistas/consistente.png",     tagline: "8 RODADAS SEGUIDAS!",    rara: false },
    ],
  },
  {
    id: "reconhecimento",
    title: "RECONHECIMENTO",
    badges: [
      { slug: "operario",          nome: "Operário",          descricao: "Recebeu a trait Raçudo 5 vezes.",                    svg: "/conquistas/operario.png",          tagline: "RAÇUDO ATÉ A ALMA!",    rara: false },
      { slug: "racudo-do-mes",     nome: "Raçudo do Mês",     descricao: "Recebeu mais votos para Raçudo durante um mês.",     svg: "/conquistas/racudo-do-mes.png",     tagline: "RAÇUDO DO MÊS!",        rara: false },
      { slug: "resenha-forte",     nome: "Resenha Forte",     descricao: "Recebeu 20 traits sociais acumuladas.",              svg: "/conquistas/resenha-forte.png",     tagline: "20 DESTAQUES SOCIAIS!", rara: false },
      { slug: "querido-da-galera", nome: "Querido da Galera", descricao: "Recebeu 50 destaques positivos acumulados.",         svg: "/conquistas/querido-da-galera.png", tagline: "50 DESTAQUES, É AMADO!", rara: true  },
    ],
  },
  {
    id: "colecao",
    title: "COLEÇÃO",
    badges: [
      { slug: "colecionador",      nome: "Colecionador",      descricao: "Desbloqueou 8 badges.",              svg: "/conquistas/colecionador.png",      tagline: "8 BADGES DESBLOQUEADAS!", rara: false },
      { slug: "mestre-da-resenha", nome: "Mestre da Resenha", descricao: "Desbloqueou 16 badges.",             svg: "/conquistas/mestre-da-resenha.png", tagline: "16 BADGES, MESTRE!",      rara: true  },
      { slug: "completo",          nome: "Completo!",          descricao: "Desbloqueou todas as badges do jogo.", svg: "/conquistas/completo.png",         tagline: "TODAS AS BADGES! INCRÍVEL!", rara: true },
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
  progress?: Record<string, { current: number; meta: number }>;
  lastConquista: { slug: string; nome: string; descricao: string } | null;
}

export function MedalhasClient({ unlockedSlugs, progress = {}, lastConquista }: Props) {
  const [filter, setFilter] = useState<Filter>("todas");
  const [selected, setSelected] = useState<BadgeEntry | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const unlockedSet = new Set(unlockedSlugs);
  const unlockedCount = ALL_SLUGS.filter(s => unlockedSet.has(s)).length;

  // % de progresso de uma badge bloqueada (capado em 0.95 p/ nunca parecer "completa porém travada")
  function pctFor(slug: string): number {
    if (unlockedSet.has(slug)) return 1;
    const p = progress[slug];
    if (!p || p.meta <= 0) return 0;
    return Math.min(p.current / p.meta, 0.95);
  }
  // "Em andamento" = bloqueada com algum progresso real
  const andamentoCount = ALL_SLUGS.filter(s => !unlockedSet.has(s) && pctFor(s) > 0).length;

  function shouldShow(slug: string): boolean {
    if (filter === "todas") return true;
    if (filter === "desbloqueadas") return unlockedSet.has(slug);
    if (filter === "andamento") return !unlockedSet.has(slug) && pctFor(slug) > 0;
    return true;
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#090909" }}>

      {/* ── TOPBAR ── */}
      <div className="glass-bar" style={{
        position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "min(100%, 430px)", zIndex: 30,
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px" }}>
          <button onClick={() => setMenuOpen(true)} style={{ width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer" }}>
            <List size={24} color="#fff" weight="bold" />
          </button>
          <Image alt="Canelada" src="/logo.png" width={56} height={56} priority style={{ objectFit: "cover" }} />
          <button style={{ width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer" }}>
            <Bell size={24} color="#fff" weight="bold" />
          </button>
        </div>
      </div>

      {/* ── DARK HEADER + BANNER ── */}
      <div style={{
        background: "#0e4a54",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 96px)",
        paddingBottom: 20,
        paddingLeft: 16,
        paddingRight: 16,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        boxSizing: "border-box",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}>

        {/* Title row */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ flex: "1 0 0", minWidth: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 28, lineHeight: "32px", color: "#fff" }}>
              Suas Badges
            </p>
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 12, lineHeight: "normal", color: "#fff" }}>
              {unlockedCount} de {TOTAL} badges desbloqueadas
            </p>
          </div>
          {/* Circular progress ring */}
          <div style={{ flexShrink: 0, width: 48, height: 48, position: "relative" }}>
            <svg width="48" height="48" viewBox="0 0 48 48" style={{ display: "block" }}>
              <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
              <circle
                cx="24" cy="24" r="20" fill="none"
                stroke="#9fe870" strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${(unlockedCount / TOTAL) * 125.66} 125.66`}
                transform="rotate(-90 24 24)"
              />
            </svg>
            <span style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11, color: "#fff",
            }}>
              {Math.round(unlockedCount / TOTAL * 100)}%
            </span>
          </div>
        </div>

        {lastConquista ? (
          <div style={{
            background: "#090909",
            border: "1px solid #c5973a",
            borderRadius: 18,
            padding: "11px 9px 11px 17px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            {/* Left text — fixed height 80px como no Figma */}
            <div style={{ height: 80, display: "flex", flexDirection: "column", gap: 6, justifyContent: "center", flex: "0 0 auto", maxWidth: "calc(100% - 88px)" }}>
              <div>
                <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, lineHeight: "16px", color: "#9fe870" }}>
                  ÚLTIMA CONQUISTA
                </p>
                <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 20, lineHeight: "24px", color: "#fff" }}>
                  {lastConquista.nome}
                </p>
              </div>
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 12, lineHeight: "16px", color: "#ccc" }}>
                {lastConquista.descricao}
              </p>
            </div>

            {/* Right: badge image + tiny name overlay */}
            <div style={{ flex: "1 0 0", minWidth: 1, height: 80, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
              <div style={{ width: 72, height: 72, flexShrink: 0, position: "relative" }}>
                <Image
                  alt={lastConquista.nome}
                  src={BADGE_SVG[lastConquista.slug] ?? `/conquistas/${lastConquista.slug}.png`}
                  fill
                  sizes="72px"
                  style={{ objectFit: "contain" }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            background: "#090909",
            border: "1px solid #c5973a",
            borderRadius: 18,
            padding: "11px 9px 11px 17px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <div style={{ height: 80, display: "flex", flexDirection: "column", gap: 6, justifyContent: "center", flex: "0 0 auto", maxWidth: "calc(100% - 88px)" }}>
              <div>
                <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, lineHeight: "16px", color: "#9fe870" }}>
                  ÚLTIMA CONQUISTA
                </p>
                <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 20, lineHeight: "24px", color: "#fff" }}>
                  Nenhuma ainda
                </p>
              </div>
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 12, lineHeight: "16px", color: "#ccc" }}>
                Vote na pelada para desbloquear badges!
              </p>
            </div>
            <div style={{ flex: "1 0 0", minWidth: 1, height: 80, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
              <div style={{ width: 72, height: 72, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MedalMilitary size={48} color="rgba(197,151,58,0.4)" weight="fill" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── MAIN CARD — contém tudo ── */}
      <div style={{
        background: "#171717",
        border: "1px solid #2e2e2e",
        borderTopLeftRadius: 48,
        borderTopRightRadius: 48,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        boxShadow: "0px 4px 4px 0px rgba(0,0,0,0.25)",
        paddingTop: 24,
        paddingLeft: 8,
        paddingRight: 8,
        paddingBottom: "calc(104px + env(safe-area-inset-bottom, 0px))",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}>

        {/* Section header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, height: 42, paddingLeft: 8 }}>
          <div style={{
            background: "#171717",
            border: "1px solid #2e2e2e",
            borderRadius: 12,
            padding: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="" src="/icon-medal-badge.svg" style={{ width: 24, height: 24, display: "block" }} />
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, lineHeight: "20px", color: "#fff", whiteSpace: "nowrap" }}>
            BADGES
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
              : `Em andamento (${andamentoCount})`;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  background: active ? "#9fe870" : "#111",
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
          padding: "17px 9px 9px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}>
          {BADGE_CATALOG.map(cat => {
            const visible = cat.badges.filter(b => shouldShow(b.slug));
            if (visible.length === 0) return null;
            const catUnlocked = cat.badges.filter(b => unlockedSet.has(b.slug)).length;

            return (
              <div key={cat.id} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Category header */}
                <div style={{ paddingLeft: 8, display: "flex", flexDirection: "column", gap: 0 }}>
                  <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, lineHeight: "20px", color: "#fff", whiteSpace: "nowrap" }}>
                    {cat.title}
                  </p>
                  <div style={{ display: "flex", gap: 6, alignItems: "baseline", whiteSpace: "nowrap" }}>
                    {/* número + /N inline, sem gap entre eles */}
                    <span style={{ fontFamily: "var(--font-display)", lineHeight: 0 }}>
                      <span style={{ fontWeight: 700, fontSize: 18, lineHeight: "22px", color: catUnlocked > 0 ? "#9fe870" : "#fff" }}>{catUnlocked}</span>
                      <span style={{ fontWeight: 500, fontSize: 16, lineHeight: "18px", color: "#fff" }}>/{cat.badges.length}</span>
                    </span>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, lineHeight: "20px", color: "#999" }}>
                      Badges conquistadas
                    </span>
                  </div>
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
                                : <Lock size={14} color="rgba(255,255,255,0.65)" weight="fill" />
                              }
                            </div>

                            {/* Player: image + label */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                              {/* Badge image with -8px bottom margin */}
                              <div style={{ width: 72, height: 72, flexShrink: 0, marginBottom: -8, position: "relative" }}>
                                <Image
                                  alt={badge.nome}
                                  src={badge.svg}
                                  fill
                                  sizes="72px"
                                  style={{
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

                            {/* Progress bar — só em badges bloqueadas com progresso real */}
                            {!unlocked && progress[badge.slug] && (
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
                                  width: `${Math.round(pctFor(badge.slug) * 100)}%`,
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
        const isRara = selected.rara;

        const sheetShadow = !unlocked && isRara
          ? "0px 2px 0px 0px rgba(206,156,84,0.16), 1px -12px 20px 0px rgba(206,156,84,0.24)"
          : "0px 2px 8px 0px rgba(40,41,61,0.16), 0px 16px 24px 0px rgba(96,97,112,0.16)";

        const nameColor = unlocked
          ? "#fff"
          : isRara
          ? "rgba(212,168,67,0.3)"
          : "rgba(255,255,255,0.4)";

        const descColor = unlocked
          ? "#b0b0b6"
          : isRara
          ? "rgba(197,151,58,0.4)"
          : "rgba(176,176,182,0.4)";

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
                animation: "backdrop-in 260ms cubic-bezier(0.16,1,0.3,1) both",
              }}
            />

            {/* Sheet */}
            <div style={{
              position: "fixed", bottom: 0,
              left: "50%", transform: "translateX(-50%)",
              width: "min(100%, 430px)",
              zIndex: 50,
              background: "#171717",
              borderTopLeftRadius: 48,
              borderTopRightRadius: 48,
              boxShadow: sheetShadow,
              overflow: "hidden",
              animation: "sheet-up 380ms cubic-bezier(0.16,1,0.3,1) both",
            }}>
              {/* Handle */}
              <div style={{
                height: 32,
                display: "flex", alignItems: "center", justifyContent: "center",
                paddingTop: 12, paddingBottom: 12,
              }}>
                <div style={{ width: 40, height: 4, background: "#3a3a3a", borderRadius: 9999 }} />
              </div>

              {/* Content */}
              <div style={{
                display: "flex", flexDirection: "column", gap: 24,
                alignItems: "center", padding: 16,
              }}>

                {/* Badge info block */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center", width: "100%" }}>

                  {/* Status pill */}
                  <div style={{
                    background: "#0a0e0e",
                    border: "1px solid #2e2e2e",
                    borderRadius: 9999,
                    padding: "5px 13px",
                    display: "inline-flex", alignItems: "center", gap: 8,
                    flexShrink: 0,
                  }}>
                    {unlocked
                      ? <CheckCircle size={18} color="#9fe870" weight="fill" />
                      : <Lock size={18} color="#fff" weight="fill" />
                    }
                    <span style={{
                      fontFamily: "var(--font-display)", fontWeight: 700,
                      fontSize: 12, lineHeight: "18px",
                      color: unlocked ? "#9fe870" : "#fff",
                      whiteSpace: "nowrap",
                    }}>
                      {unlocked ? "DESBLOQUEADA" : "BLOQUEADO"}
                    </span>
                  </div>

                  {/* Badge image 140×140 */}
                  <div style={{ width: 140, height: 140, flexShrink: 0, marginBottom: isRara && !unlocked ? -8 : 0, position: "relative" }}>
                    <Image
                      src={selected.svg}
                      alt={selected.nome}
                      fill
                      sizes="140px"
                      style={{ objectFit: "contain" }}
                    />
                  </div>

                  {/* Text block */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start", width: "100%" }}>
                    {/* Tagline (unlocked only) */}
                    {unlocked && (
                      <p style={{
                        margin: 0,
                        fontFamily: "var(--font-display)", fontWeight: 700,
                        fontSize: 12, lineHeight: "16px",
                        color: "#8b8b93", letterSpacing: "1.4px",
                        textAlign: "center", width: "100%",
                      }}>
                        {selected.tagline}
                      </p>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center", width: "100%" }}>
                      <p style={{
                        margin: 0,
                        fontFamily: "var(--font-display)", fontWeight: 900,
                        fontSize: 28, lineHeight: "32px",
                        color: nameColor, textAlign: "center", width: "100%",
                      }}>
                        {selected.nome}
                      </p>
                      <p style={{
                        margin: 0,
                        fontFamily: "var(--font-body)", fontWeight: 500,
                        fontSize: 16, lineHeight: "20px",
                        color: descColor, textAlign: "center", width: "100%",
                      }}>
                        {selected.descricao}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status box — locked only */}
                {!unlocked && (
                  <div style={{
                    background: "#0a0e0e",
                    border: "1px solid #232327",
                    borderRadius: 18,
                    padding: "11px 16px",
                    display: "flex", flexDirection: "column", gap: 12,
                    width: "100%", boxSizing: "border-box",
                  }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
                      <p style={{
                        margin: 0,
                        fontFamily: "var(--font-display)", fontWeight: 700,
                        fontSize: 16, lineHeight: "20px", color: "#fff",
                      }}>
                        Em andamento
                      </p>
                      {/* Progress bar */}
                      <div style={{
                        height: 8, background: "#26262b", borderRadius: 99,
                        overflow: "hidden", width: "100%",
                      }}>
                        <div style={{ height: "100%", width: "0%", background: "#9fe870", borderRadius: 99 }} />
                      </div>
                    </div>
                    <p style={{
                      margin: 0,
                      fontFamily: "var(--font-body)", fontWeight: 600,
                      fontSize: 12, color: "#999",
                    }}>
                      {selected.descricao}
                    </p>
                  </div>
                )}

                {/* Close button */}
                <button
                  onClick={() => setSelected(null)}
                  style={{
                    width: "100%",
                    padding: "17px",
                    background: "#0a0e0e",
                    border: "1px solid #424242",
                    borderRadius: 16,
                    fontFamily: "var(--font-display)", fontWeight: 700,
                    fontSize: 16, lineHeight: "20px",
                    color: "#fff",
                    cursor: "pointer", textAlign: "center",
                    WebkitTapHighlightColor: "transparent",
                    boxSizing: "border-box",
                  }}
                >
                  Fechar
                </button>
              </div>

              {/* Footer safe-area spacer */}
              <div style={{ height: "max(16px, env(safe-area-inset-bottom, 0px))", background: "#171717" }} />
            </div>
          </>
        );
      })()}

      <BottomNav />

      {/* ── Menu Hambúrguer Drawer ── */}
      {menuOpen && (
        <>
          <div
            aria-hidden
            onClick={() => setMenuOpen(false)}
            style={{
              position: "fixed", top: 0, bottom: 0, left: "50%", transform: "translateX(-50%)",
              width: "min(100%, 430px)", zIndex: 50,
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)",
            }}
          />
          <div style={{
            position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
            width: "min(100%, 430px)", zIndex: 51,
            background: "#1a1a1a",
            border: "1px solid #2e2e2e",
            borderRadius: "32px 32px 0 0",
            paddingBottom: "max(24px, env(safe-area-inset-bottom, 24px))",
          }}>
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 8px" }}>
              <div style={{ width: 40, height: 4, background: "#3a3a3a", borderRadius: 9999 }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 16px 16px" }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "#fff" }}>MENU</span>
              <button
                onClick={() => setMenuOpen(false)}
                style={{ width: 40, height: 40, background: "#000", border: "1px solid #424242", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
              >
                <X size={16} color="#fff" weight="bold" />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 16px" }}>
              <MenuRow icon={<User size={20} color="#fff" weight="regular" />} label="Meu Perfil" href="/perfil" onClose={() => setMenuOpen(false)} />
              <MenuRow icon={<UsersThree size={20} color="#fff" weight="regular" />} label="Meu Grupo" href="/grupo" onClose={() => setMenuOpen(false)} />
              <div style={{ height: 1, background: "#2a2a2a", margin: "8px 0" }} />
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                style={{ display: "flex", alignItems: "center", gap: 12, background: "none", border: "none", cursor: "pointer", padding: "14px 8px", borderRadius: 12, width: "100%" }}
              >
                <div style={{ width: 40, height: 40, background: "#2a0a0a", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <SignOut size={20} color="#ef4444" weight="regular" />
                </div>
                <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 16, color: "#ef4444" }}>Sair</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MenuRow({ icon, label, href, onClose }: { icon: React.ReactNode; label: string; href: string; onClose: () => void }) {
  return (
    <Link href={href} onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 8px", borderRadius: 12, textDecoration: "none" }}>
      <div style={{ width: 40, height: 40, background: "#242424", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 16, color: "#fff" }}>{label}</span>
    </Link>
  );
}

function chunk<T>(arr: readonly T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) result.push([...arr.slice(i, i + size)]);
  return result;
}
