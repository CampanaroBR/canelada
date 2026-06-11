import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BottomNav } from "@/components/layout/BottomNav";
import Link from "next/link";

export const dynamic = "force-dynamic";

const AVATAR_COLORS = ["#9fe870", "#60A5FA", "#F59E0B", "#EF4444", "#A78BFA", "#34D399", "#F97316", "#EC4899"];
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
  FUTEBOL:       { label: "Futebol",       color: "#9fe870" },
  PERSONALIDADE: { label: "Personalidade", color: "#F59E0B" },
  RESENHA:       { label: "Resenha",       color: "#EF4444" },
};

const VOTO_CONFIG: Record<string, { label: string; color: string }> = {
  MVP:     { label: "MVP",     color: "#9fe870" },
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
        <header style={{ height: "56px", display: "flex", alignItems: "center", padding: "0 20px", borderBottom: "1px solid var(--color-border-muted)" }}>
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

  const [allTraits, mvpCount, bagreCount, totalRodadas, recentRodadas] = await Promise.all([
    prisma.trait.findMany({
      orderBy: [{ categoria: "asc" }, { nome: "asc" }],
      select: { slug: true, nome: true, emoji: true, categoria: true },
    }),
    prisma.voto.count({ where: { votadoId: jogador.id, categoria: "MVP" } }),
    prisma.voto.count({ where: { votadoId: jogador.id, categoria: "BAGRE" } }),
    prisma.rodada.count({ where: { grupoId: jogador.grupoId } }),
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

  return (
    <div style={{ minHeight: "100dvh", background: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        height: "56px",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        background: "rgba(18,18,18,0.60)",
        backdropFilter: "blur(40px) saturate(200%) brightness(1.08)",
        WebkitBackdropFilter: "blur(40px) saturate(200%) brightness(1.08)",
        boxShadow: ["inset 0 1px 0 rgba(255,255,255,0.12)", "inset 0 -1px 0 rgba(255,255,255,0.08)", "0 1px 0 rgba(0,0,0,0.20)"].join(", "),
        gap: "12px",
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
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <span style={{
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: "18px",
          letterSpacing: "0.08em",
          color: "var(--color-accent)",
          textTransform: "uppercase",
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {jogador.apelido.toUpperCase()}
        </span>
      </header>

      <main style={{
        flex: 1,
        padding: "24px 16px calc(88px + env(safe-area-inset-bottom, 0px))",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}>
        {/* Hero: avatar + stats */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", paddingTop: "8px" }}>
          <div style={{
            width: "88px",
            height: "88px",
            borderRadius: "50%",
            background: color + "22",
            border: `3px solid ${color}55`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "28px",
            color,
            letterSpacing: "0.04em",
            boxShadow: `0 0 32px ${color}22`,
          }}>
            {initials}
          </div>
          <div style={{ textAlign: "center" }}>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "clamp(28px, 7vw, 36px)",
              letterSpacing: "-0.01em",
              textTransform: "uppercase",
              color: "var(--color-text-primary)",
              lineHeight: 1,
              marginBottom: "6px",
            }}>
              {jogador.apelido}
            </h1>
            <p style={{ fontSize: "13px", color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
              {totalRodadas} rodada{totalRodadas !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Stats row */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "8px",
            width: "100%",
            maxWidth: "320px",
          }}>
            {[
              { label: "MVPs", value: mvpCount, color: "#9fe870" },
              { label: "Bagres", value: bagreCount, color: "#EF4444" },
              { label: "Traits", value: traitsUnlocked, color: "#A78BFA" },
            ].map((s) => (
              <div key={s.label} style={{
                background: "var(--color-surface-1)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-border)",
                padding: "12px 8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
              }}>
                <span style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: "28px",
                  lineHeight: 1,
                  color: s.color,
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {s.value}
                </span>
                <span style={{ fontSize: "10px", fontWeight: 600, color: "var(--color-text-muted)", fontFamily: "var(--font-body)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Traits */}
        <section>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "14px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
            marginBottom: "16px",
          }}>
            TRAITS
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {Object.entries(traitsByCategory).map(([catKey, catTraits]) => {
              const catCfg = CAT_CONFIG[catKey];
              return (
                <div key={catKey}>
                  <p style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: catCfg.color,
                    fontFamily: "var(--font-body)",
                    marginBottom: "10px",
                    opacity: 0.8,
                  }}>
                    {catCfg.label}
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                    {catTraits.map((trait) => {
                      const count = unlockedMap.get(trait.slug);
                      const unlocked = count !== undefined;
                      return (
                        <div key={trait.slug} style={{
                          background: unlocked ? catCfg.color + "12" : "var(--color-surface-1)",
                          borderRadius: "var(--radius-md)",
                          boxShadow: unlocked ? `0 0 0 1px ${catCfg.color}44` : "var(--shadow-border)",
                          padding: "12px 8px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "6px",
                          opacity: unlocked ? 1 : 0.35,
                          position: "relative",
                        }}>
                          <span style={{ fontSize: "22px", filter: unlocked ? "none" : "grayscale(1)", lineHeight: 1 }}>
                            {trait.emoji ?? "⭐"}
                          </span>
                          <span style={{
                            fontSize: "10px",
                            fontWeight: 600,
                            fontFamily: "var(--font-body)",
                            color: unlocked ? catCfg.color : "var(--color-text-muted)",
                            textAlign: "center",
                            lineHeight: 1.2,
                          }}>
                            {trait.nome}
                          </span>
                          {unlocked && count! > 1 && (
                            <div style={{
                              position: "absolute",
                              top: "6px",
                              right: "6px",
                              background: catCfg.color,
                              color: "#0D0D0D",
                              borderRadius: "9999px",
                              width: "16px",
                              height: "16px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "9px",
                              fontWeight: 900,
                              fontFamily: "var(--font-display)",
                            }}>
                              {count}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Histórico de rodadas */}
        {recentRodadas.length > 0 && (
          <section>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "14px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-text-muted)",
              marginBottom: "12px",
            }}>
              HISTÓRICO
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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
                    <span style={{
                      fontSize: "12px",
                      color: "var(--color-text-muted)",
                      fontFamily: "var(--font-body)",
                      textTransform: "capitalize",
                      flexShrink: 0,
                    }}>
                      {dateStr}
                    </span>
                    {recebeu.length > 0 ? (
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                        {recebeu.map((v, i) => {
                          const cfg = VOTO_CONFIG[v.categoria] ?? { label: v.categoria, color: "var(--color-text-muted)" };
                          return (
                            <span key={i} style={{
                              padding: "2px 8px",
                              borderRadius: "9999px",
                              background: cfg.color + "20",
                              boxShadow: `0 0 0 1px ${cfg.color}44`,
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
                      <span style={{ fontSize: "12px", color: "var(--color-text-muted)", opacity: 0.5, fontFamily: "var(--font-body)" }}>
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
