import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BottomNav } from "@/components/layout/BottomNav";
import Link from "next/link";
import Image from "next/image";
import { TRAIT_SVG } from "@/app/votacao/VotacaoFlow";
import {
  CONQUISTAS,
  CAT_CONQUISTA_CONFIG,
  computeConquistas,
  computeOverall,
  type ConquistaCategoria,
} from "@/lib/conquistas";

export const dynamic = "force-dynamic";

const AVATAR_COLORS = ["#B5FF4D", "#60A5FA", "#F59E0B", "#EF4444", "#A78BFA", "#34D399", "#F97316", "#EC4899"];
function getAvatarColor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
function getInitials(name: string) {
  const p = name.trim().split(/\s+/);
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

const CAT_CONFIG: Record<string, { label: string; color: string }> = {
  FUTEBOL:       { label: "Futebol",       color: "#B5FF4D" },
  PERSONALIDADE: { label: "Personalidade", color: "#F59E0B" },
  RESENHA:       { label: "Resenha",       color: "#EF4444" },
};

const VOTO_CONFIG: Record<string, { label: string; color: string }> = {
  MVP:     { label: "MVP",     color: "#B5FF4D" },
  BAGRE:   { label: "Bagre",   color: "#EF4444" },
  RACUDO:  { label: "Raçudo",  color: "#F59E0B" },
  RESENHA: { label: "Resenha", color: "#60A5FA" },
  TRAIT:   { label: "Trait",   color: "#A78BFA" },
};

export default async function PerfilPage({
  params,
}: {
  params: Promise<{ apelido: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { apelido: apelidoParam } = await params;
  const apelido = decodeURIComponent(apelidoParam);

  const jogador = await prisma.jogador.findFirst({
    where: { apelido: { equals: apelido, mode: "insensitive" } },
    select: {
      id: true,
      apelido: true,
      grupoId: true,
      createdAt: true,
      traitsRecebidas: {
        select: {
          traitSlug: true,
          contador: true,
          trait: { select: { nome: true, emoji: true, categoria: true } },
        },
        orderBy: { contador: "desc" },
      },
    },
  });

  if (!jogador) {
    return (
      <div style={{ minHeight: "100dvh", background: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
        <header style={{ height: "56px", display: "flex", alignItems: "center", padding: "0 20px", boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.06)" }}>
          <Link href="/feed" style={{ color: "var(--color-text-muted)", display: "flex", alignItems: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </Link>
        </header>
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <p style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)", fontSize: "14px" }}>Jogador não encontrado.</p>
        </main>
        <BottomNav />
      </div>
    );
  }

  const [allTraits, mvpCount, bagreCount, racudoCount, resenhaCount, totalRodadas, presencaRows, recentRodadas] = await Promise.all([
    prisma.trait.findMany({
      orderBy: [{ categoria: "asc" }, { nome: "asc" }],
      select: { slug: true, nome: true, emoji: true, categoria: true },
    }),
    prisma.voto.count({ where: { votadoId: jogador.id, categoria: "MVP" } }),
    prisma.voto.count({ where: { votadoId: jogador.id, categoria: "BAGRE" } }),
    prisma.voto.count({ where: { votadoId: jogador.id, categoria: "RACUDO" } }),
    prisma.voto.count({ where: { votadoId: jogador.id, categoria: "RESENHA" } }),
    prisma.rodada.count({ where: { grupoId: jogador.grupoId } }),
    prisma.voto.findMany({
      where: { votadoId: jogador.id },
      select: { rodadaId: true },
      distinct: ["rodadaId"],
    }),
    prisma.rodada.findMany({
      where: { grupoId: jogador.grupoId },
      select: {
        id: true,
        data: true,
        votos: {
          where: { votadoId: jogador.id },
          select: { categoria: true, traitSlug: true },
        },
      },
      orderBy: { data: "desc" },
      take: 5,
    }),
  ]);

  const unlockedMap = new Map(jogador.traitsRecebidas.map((t) => [t.traitSlug, t.contador]));
  const traitsByCategory: Record<string, typeof allTraits> = {
    FUTEBOL: allTraits.filter((t) => t.categoria === "FUTEBOL"),
    PERSONALIDADE: allTraits.filter((t) => t.categoria === "PERSONALIDADE"),
    RESENHA: allTraits.filter((t) => t.categoria === "RESENHA"),
  };

  const color = getAvatarColor(jogador.apelido);
  const initials = getInitials(jogador.apelido);
  const traitsUnlocked = jogador.traitsRecebidas.length;
  const presencaCount = presencaRows.length;
  const joinYear = new Date(jogador.createdAt).getFullYear();

  const conquiStats = { mvpCount, bagreCount, racudoCount, resenhaCount, traitsUnlocked, presencaCount };
  const conquistasUnlocked = computeConquistas(conquiStats);
  const overall = computeOverall(conquiStats);

  const conquistasByCategory = (Object.keys(CAT_CONQUISTA_CONFIG) as ConquistaCategoria[]).reduce(
    (acc, cat) => {
      acc[cat] = CONQUISTAS.filter((c) => c.categoria === cat);
      return acc;
    },
    {} as Record<ConquistaCategoria, typeof CONQUISTAS>
  );

  const STATS = [
    { label: "MVPs",     value: mvpCount,       color: "#B5FF4D" },
    { label: "Bagres",   value: bagreCount,      color: "#EF4444" },
    { label: "Traits",   value: traitsUnlocked,  color: "#A78BFA" },
  ];

  return (
    <div style={{ minHeight: "100dvh", background: "var(--color-bg)", display: "flex", flexDirection: "column" }}>

      {/* ── Sticky header — liquid glass ── */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        height: "56px",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        gap: "12px",
        background: "rgba(18,18,18,0.60)",
        backdropFilter: "blur(40px) saturate(200%) brightness(1.08)",
        WebkitBackdropFilter: "blur(40px) saturate(200%) brightness(1.08)",
        boxShadow: [
          "inset 0 1px 0 rgba(255,255,255,0.12)",
          "inset 0 -1px 0 rgba(255,255,255,0.08)",
          "0 1px 0 rgba(0,0,0,0.20)",
        ].join(", "),
      }}>
        <Link
          href="/feed"
          aria-label="Voltar"
          style={{
            width: "44px",
            height: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-text-muted)",
            marginLeft: "-10px",
            flexShrink: 0,
            textDecoration: "none",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <span style={{
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: "16px",
          letterSpacing: "0.1em",
          color: "var(--color-text-muted)",
          textTransform: "uppercase",
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          PERFIL
        </span>
      </header>

      <main style={{ flex: 1, paddingBottom: "calc(88px + env(safe-area-inset-bottom, 0px))" }}>

        {/* ── HERO DRAMÁTICO ── */}
        <div style={{
          position: "relative",
          height: "52dvh",
          minHeight: "320px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}>
          {/* Stripe texture diagonal */}
          <div aria-hidden style={{
            position: "absolute",
            inset: "-40px",
            backgroundImage: "repeating-linear-gradient(135deg, transparent 0px, transparent 28px, rgba(255,255,255,0.012) 28px, rgba(255,255,255,0.012) 29px)",
            pointerEvents: "none",
          }} />

          {/* Color wash de cima */}
          <div aria-hidden style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(180deg, ${color}28 0%, transparent 65%)`,
            pointerEvents: "none",
          }} />

          {/* Watermark gigante — initials como textura */}
          <div aria-hidden style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -55%)",
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "clamp(160px, 42vw, 220px)",
            lineHeight: 1,
            letterSpacing: "-0.06em",
            textTransform: "uppercase",
            color: color,
            opacity: 0.06,
            userSelect: "none",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}>
            {initials}
          </div>

          {/* Avatar double-bezel — flutuando no centro */}
          <div style={{
            position: "absolute",
            top: "38%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}>
            {/* Outer shell */}
            <div style={{
              width: "108px",
              height: "108px",
              borderRadius: "50%",
              background: color + "10",
              boxShadow: [
                `0 0 0 1px ${color}30`,
                `0 0 48px ${color}25`,
                "inset 0 1px 1px rgba(255,255,255,0.10)",
              ].join(", "),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "6px",
            }}>
              {/* Inner core */}
              <div style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background: `radial-gradient(circle at 35% 35%, ${color}30, ${color}10)`,
                boxShadow: `inset 0 1px 1px rgba(255,255,255,0.12), 0 0 0 1px ${color}25`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: "30px",
                letterSpacing: "0.04em",
                color: color,
              }}>
                {initials}
              </div>
            </div>
          </div>

          {/* Fade para dark na base */}
          <div aria-hidden style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "60%",
            background: "linear-gradient(to bottom, transparent 0%, var(--color-bg) 100%)",
            pointerEvents: "none",
          }} />

          {/* Nome + meta — ancorado na base do hero */}
          <div style={{
            position: "relative",
            zIndex: 1,
            padding: "0 24px 20px",
          }}>
            {/* Overall + nome */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: "14px", marginBottom: "12px" }}>
              <h1 style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: "clamp(44px, 12vw, 64px)",
                lineHeight: 0.88,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
                color: "var(--color-text-primary)",
                flex: 1,
                minWidth: 0,
              }}>
                {jogador.apelido}
              </h1>

              {/* Overall score */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flexShrink: 0,
                background: color + "18",
                borderRadius: "var(--radius-md)",
                boxShadow: `0 0 0 1px ${color}40, 0 0 20px ${color}15`,
                padding: "6px 12px 4px",
              }}>
                <span className="tabular" style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: "clamp(32px, 9vw, 44px)",
                  lineHeight: 0.9,
                  color: color,
                  letterSpacing: "-0.02em",
                }}>
                  {overall}
                </span>
                <span style={{
                  fontSize: "8px",
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: color,
                  opacity: 0.7,
                  fontFamily: "var(--font-body)",
                  marginTop: "3px",
                }}>
                  OVR
                </span>
              </div>
            </div>

            {/* Meta pills */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "var(--radius-pill)",
                background: "rgba(255,255,255,0.06)",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.10)",
              }}>
                <span style={{ fontSize: "10px" }}>⚽</span>
                <span style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  color: "var(--color-text-secondary)",
                  fontFamily: "var(--font-body)",
                  textTransform: "uppercase",
                }}>
                  {totalRodadas} Rodada{totalRodadas !== 1 ? "s" : ""}
                </span>
              </div>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "var(--radius-pill)",
                background: "rgba(255,255,255,0.06)",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.10)",
              }}>
                <span style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  color: "var(--color-text-secondary)",
                  fontFamily: "var(--font-body)",
                  textTransform: "uppercase",
                }}>
                  Desde {joinYear}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── STATS GRID — estilo "X6 PREMIER LEAGUE" ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "8px",
          padding: "0 16px 32px",
        }}>
          {STATS.map((s) => (
            <div key={s.label} style={{
              background: "var(--color-surface-1)",
              borderRadius: "var(--radius-lg)",
              boxShadow: `var(--shadow-border), inset 0 1px 0 rgba(255,255,255,0.04)`,
              padding: "16px 12px 14px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "4px",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Accent left bar */}
              <div aria-hidden style={{
                position: "absolute",
                top: 0, left: 0, bottom: 0,
                width: "3px",
                background: s.color,
                borderRadius: "3px 0 0 3px",
              }} />
              <span style={{
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-body)",
              }}>
                {s.label}
              </span>
              <span style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: "clamp(36px, 9vw, 48px)",
                lineHeight: 0.9,
                color: s.color,
                fontVariantNumeric: "tabular-nums",
              }}>
                {s.value}
              </span>
            </div>
          ))}
        </div>

        {/* ── TRAITS — grid hexagonal ── */}
        <section style={{ padding: "0 16px 32px" }}>
          <div style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "20px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--color-text-primary)",
            }}>
              MARCAS
            </h2>
            <span style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "14px",
              color: "var(--color-text-muted)",
            }}>
              {traitsUnlocked}/{allTraits.length}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {Object.entries(traitsByCategory).map(([catKey, catTraits]) => {
              const catCfg = CAT_CONFIG[catKey];
              const unlockedInCat = catTraits.filter(t => unlockedMap.has(t.slug)).length;
              return (
                <div key={catKey}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "14px",
                  }}>
                    <p style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: catCfg.color,
                      fontFamily: "var(--font-body)",
                    }}>
                      {catCfg.label}
                    </p>
                    <span style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "var(--color-text-muted)",
                      fontFamily: "var(--font-body)",
                    }}>
                      {unlockedInCat}/{catTraits.length}
                    </span>
                  </div>

                  {/* Hexagon badge grid */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "12px 8px",
                  }}>
                    {catTraits.map((trait) => {
                      const count = unlockedMap.get(trait.slug);
                      const unlocked = count !== undefined;
                      const svgSrc = TRAIT_SVG[trait.slug];

                      return (
                        <div key={trait.slug} style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "8px",
                        }}>
                          {/* Hexagon outer shell — borda via padding */}
                          <div style={{
                            width: "76px",
                            height: "76px",
                            clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                            background: unlocked ? catCfg.color + "55" : "rgba(255,255,255,0.07)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "3px",
                            position: "relative",
                          }}>
                            {/* Hexagon inner */}
                            <div style={{
                              width: "100%",
                              height: "100%",
                              clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                              background: unlocked
                                ? `radial-gradient(circle at 35% 30%, ${catCfg.color}28, ${catCfg.color}10)`
                                : "var(--color-surface-2)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              overflow: "hidden",
                            }}>
                              {svgSrc ? (
                                <Image
                                  src={svgSrc}
                                  alt={trait.nome}
                                  width={48}
                                  height={48}
                                  style={{
                                    objectFit: "contain",
                                    filter: unlocked ? "none" : "grayscale(1)",
                                    opacity: unlocked ? 1 : 0.30,
                                  }}
                                />
                              ) : (
                                <span style={{
                                  fontSize: "22px",
                                  filter: unlocked ? "none" : "grayscale(1)",
                                  opacity: unlocked ? 1 : 0.30,
                                }}>
                                  {trait.emoji ?? "⭐"}
                                </span>
                              )}
                            </div>

                            {/* Count badge */}
                            {unlocked && count! > 1 && (
                              <div style={{
                                position: "absolute",
                                top: "4px",
                                right: "4px",
                                background: catCfg.color,
                                color: "#0D0D0D",
                                borderRadius: "9999px",
                                minWidth: "16px",
                                height: "16px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "8px",
                                fontWeight: 900,
                                fontFamily: "var(--font-display)",
                                padding: "0 3px",
                                boxShadow: "0 0 0 2px var(--color-bg)",
                                zIndex: 1,
                              }}>
                                {count}
                              </div>
                            )}
                          </div>

                          <span style={{
                            fontSize: "10px",
                            fontWeight: unlocked ? 700 : 500,
                            fontFamily: "var(--font-body)",
                            color: unlocked ? catCfg.color : "var(--color-text-muted)",
                            textAlign: "center",
                            lineHeight: 1.3,
                            opacity: unlocked ? 1 : 0.4,
                            letterSpacing: "0.02em",
                            maxWidth: "72px",
                          }}>
                            {trait.nome}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── MEDALHAS — conquistas do jogador ── */}
        <section style={{ padding: "0 16px 32px" }}>
          <div style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "20px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--color-text-primary)",
            }}>
              MEDALHAS
            </h2>
            <span style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "14px",
              color: "var(--color-text-muted)",
            }}>
              {conquistasUnlocked.size}/{CONQUISTAS.length}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {(Object.keys(CAT_CONQUISTA_CONFIG) as ConquistaCategoria[]).map((catKey) => {
              const catCfg = CAT_CONQUISTA_CONFIG[catKey];
              const catConquistas = conquistasByCategory[catKey];
              const unlockedInCat = catConquistas.filter(c => conquistasUnlocked.has(c.slug)).length;

              return (
                <div key={catKey}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "14px",
                  }}>
                    <p style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: catCfg.color,
                      fontFamily: "var(--font-body)",
                    }}>
                      {catCfg.icon} {catCfg.label}
                    </p>
                    <span style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "var(--color-text-muted)",
                      fontFamily: "var(--font-body)",
                    }}>
                      {unlockedInCat}/{catConquistas.length}
                    </span>
                  </div>

                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "12px 4px",
                  }}>
                    {catConquistas.map((conquista) => {
                      const unlocked = conquistasUnlocked.has(conquista.slug);
                      return (
                        <div key={conquista.slug} style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "6px",
                        }}>
                          {/* Circular badge */}
                          <div style={{
                            width: "68px",
                            height: "68px",
                            borderRadius: "50%",
                            background: unlocked
                              ? `radial-gradient(circle at 35% 30%, ${catCfg.color}30, ${catCfg.color}10)`
                              : "var(--color-surface-2)",
                            boxShadow: unlocked
                              ? `0 0 0 2px ${catCfg.color}60, 0 0 16px ${catCfg.color}20, inset 0 1px 0 rgba(255,255,255,0.10)`
                              : "0 0 0 1px rgba(255,255,255,0.06)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            flexShrink: 0,
                            transition: "box-shadow 200ms",
                          }}>
                            <Image
                              src={conquista.svg}
                              alt={conquista.nome}
                              width={44}
                              height={44}
                              style={{
                                objectFit: "contain",
                                filter: unlocked ? "none" : "grayscale(1)",
                                opacity: unlocked ? 1 : 0.25,
                              }}
                            />
                          </div>

                          <span style={{
                            fontSize: "9px",
                            fontWeight: unlocked ? 700 : 500,
                            fontFamily: "var(--font-body)",
                            color: unlocked ? catCfg.color : "var(--color-text-muted)",
                            textAlign: "center",
                            lineHeight: 1.3,
                            opacity: unlocked ? 1 : 0.35,
                            letterSpacing: "0.02em",
                            maxWidth: "68px",
                          }}>
                            {conquista.nome}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── HISTÓRICO ── */}
        {recentRodadas.length > 0 && (
          <section style={{ padding: "0 16px 32px" }}>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "20px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--color-text-primary)",
              marginBottom: "16px",
            }}>
              HISTÓRICO
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {recentRodadas.map((rodada) => {
                const dateStr = new Date(rodada.data).toLocaleDateString("pt-BR", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                });
                const recebeu = rodada.votos;
                return (
                  <div key={rodada.id} style={{
                    background: "var(--color-surface-1)",
                    borderRadius: "var(--radius-md)",
                    boxShadow: "var(--shadow-border)",
                    padding: "12px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                  }}>
                    <time style={{
                      fontSize: "12px",
                      color: "var(--color-text-muted)",
                      fontFamily: "var(--font-body)",
                      textTransform: "capitalize",
                      flexShrink: 0,
                    }}>
                      {dateStr}
                    </time>
                    {recebeu.length > 0 ? (
                      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                        {recebeu.map((v, i) => {
                          const cfg = VOTO_CONFIG[v.categoria] ?? { label: v.categoria, color: "var(--color-text-muted)" };
                          return (
                            <span key={i} style={{
                              padding: "2px 8px",
                              borderRadius: "9999px",
                              background: cfg.color + "18",
                              boxShadow: `0 0 0 1px ${cfg.color}40`,
                              color: cfg.color,
                              fontFamily: "var(--font-display)",
                              fontWeight: 900,
                              fontSize: "10px",
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                            }}>
                              {cfg.label}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <span style={{ fontSize: "12px", color: "var(--color-text-muted)", opacity: 0.4, fontFamily: "var(--font-body)" }}>
                        Sem votos
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
