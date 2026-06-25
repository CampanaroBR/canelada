import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BottomNav } from "@/components/layout/BottomNav";
import Link from "next/link";
import Image from "next/image";
import { TRAIT_SVG } from "@/lib/assets";
import { EditarPerfilSheet } from "../EditarPerfilSheet";
import { CONQUISTAS, computeConquistas, computeOverall } from "@/lib/conquistas";

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

const CAT_COLOR: Record<string, string> = {
  FUTEBOL: "#B5FF4D",
  PERSONALIDADE: "#F59E0B",
  RESENHA: "#EF4444",
};

const hexA = (hex: string, a: string) => `${hex}${a}`; // hex + alpha suffix (ex: "#fff" + "33")

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
      userId: true,
      apelido: true,
      nome: true,
      sobrenome: true,
      posicao: true,
      peDominante: true,
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
        <header style={{ height: "56px", display: "flex", alignItems: "center", padding: "0 20px" }}>
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
    prisma.trait.findMany({ orderBy: [{ categoria: "asc" }, { nome: "asc" }], select: { slug: true } }),
    prisma.voto.count({ where: { votadoId: jogador.id, categoria: "MVP" } }),
    prisma.voto.count({ where: { votadoId: jogador.id, categoria: "BAGRE" } }),
    prisma.voto.count({ where: { votadoId: jogador.id, categoria: "RACUDO" } }),
    prisma.voto.count({ where: { votadoId: jogador.id, categoria: "RESENHA" } }),
    prisma.rodada.count({ where: { grupoId: jogador.grupoId } }),
    prisma.voto.findMany({ where: { votadoId: jogador.id }, select: { rodadaId: true }, distinct: ["rodadaId"] }),
    prisma.rodada.findMany({
      where: { grupoId: jogador.grupoId },
      select: { id: true, data: true, votos: { where: { votadoId: jogador.id }, select: { categoria: true } } },
      orderBy: { data: "desc" },
      take: 5,
    }),
  ]);

  const unlockedMap = new Map(jogador.traitsRecebidas.map((t) => [t.traitSlug, t.contador]));
  const color = getAvatarColor(jogador.apelido);
  const initials = getInitials(jogador.apelido);
  const isOwner = jogador.userId === session.user.id;
  const nomeCompleto = [jogador.nome, jogador.sobrenome].filter(Boolean).join(" ");
  const traitsUnlocked = jogador.traitsRecebidas.length;
  const presencaCount = presencaRows.length;
  const joinYear = new Date(jogador.createdAt).getFullYear();

  const conquiStats = { mvpCount, bagreCount, racudoCount, resenhaCount, traitsUnlocked, presencaCount };
  const overall = computeOverall(conquiStats);
  const conquistasUnlocked = computeConquistas(conquiStats);

  const unlockedTraitList = jogador.traitsRecebidas;
  const lockedTraits = allTraits.filter((t) => !unlockedMap.has(t.slug));
  const unlockedConq = CONQUISTAS.filter((c) => conquistasUnlocked.has(c.slug));

  return (
    <div style={{ minHeight: "100dvh", background: "var(--color-bg)" }}>
      {/* ── Header ── */}
      <header className="glass-bar" style={{
        position: "sticky", top: 0, zIndex: 30, height: 56,
        display: "flex", alignItems: "center", padding: "0 16px", gap: 12,
      }}>
        <Link href="/feed" aria-label="Voltar" style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)", marginLeft: -8, textDecoration: "none", flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </Link>
        <span style={{ flex: 1, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>Perfil</span>
        {isOwner && (
          <EditarPerfilSheet initial={{
            nome: jogador.nome ?? "",
            sobrenome: jogador.sobrenome ?? "",
            apelido: jogador.apelido,
            posicao: jogador.posicao ?? "",
            peDominante: jogador.peDominante ?? "",
          }} />
        )}
      </header>

      <main style={{ paddingBottom: "calc(96px + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* ── HERO CARD ── */}
        <div style={{ padding: "12px 16px 0" }}>
          <div style={{
            position: "relative", overflow: "hidden",
            borderRadius: 24, padding: "22px 20px",
            background: "#0c0f0e",
            border: `1px solid ${hexA(color, "40")}`,
            boxShadow: `0 18px 44px -22px ${hexA(color, "66")}`,
          }}>
            {/* glow */}
            <div aria-hidden style={{ position: "absolute", top: -90, left: "50%", transform: "translateX(-50%)", width: 340, height: 220, background: color, opacity: 0.16, filter: "blur(72px)", borderRadius: "50%", pointerEvents: "none" }} />
            {/* watermark */}
            <div aria-hidden style={{ position: "absolute", right: -8, bottom: -38, fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 168, lineHeight: 1, color: "#fff", opacity: 0.03, pointerEvents: "none", letterSpacing: "-0.04em" }}>{initials}</div>

            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", flexShrink: 0, background: hexA(color, "1f"), border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 26px ${hexA(color, "40")}` }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 30, color }}>{initials}</span>
              </div>
              <div style={{ marginLeft: "auto", textAlign: "center", background: hexA(color, "18"), border: `1px solid ${hexA(color, "55")}`, borderRadius: 16, padding: "8px 16px" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 34, lineHeight: 0.9, color, fontVariantNumeric: "tabular-nums" }}>{overall}</div>
                <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 9, letterSpacing: "0.14em", color, opacity: 0.85, marginTop: 3 }}>OVR</div>
              </div>
            </div>

            <div style={{ position: "relative", marginTop: 16 }}>
              <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "clamp(34px, 11vw, 46px)", lineHeight: 0.95, letterSpacing: "-0.02em", textTransform: "uppercase", color: "#fff" }}>{jogador.apelido}</h1>
              {nomeCompleto && <p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: "var(--color-text-secondary)" }}>{nomeCompleto}</p>}
            </div>

            <div style={{ position: "relative", display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
              <MetaPill>⚽ {totalRodadas} {totalRodadas === 1 ? "rodada" : "rodadas"}</MetaPill>
              <MetaPill>Desde {joinYear}</MetaPill>
              {jogador.posicao && <MetaPill>{jogador.posicao}</MetaPill>}
              {jogador.peDominante && <MetaPill>Pé {jogador.peDominante}</MetaPill>}
            </div>
          </div>
        </div>

        {/* ── STATS ── */}
        <div style={{ padding: "0 16px", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
          <MetricCard label="Presenças" value={presencaCount} color="#9fe870" />
          <MetricCard label="MVPs" value={mvpCount} color="#B5FF4D" />
          <MetricCard label="Bagres" value={bagreCount} color="#EF4444" />
          <MetricCard label="Personagens" value={traitsUnlocked} color="#A78BFA" />
        </div>

        {/* ── PERSONAGENS ── */}
        <section style={{ padding: "0 16px" }}>
          <SectionTitle title="Personagens" count={`${traitsUnlocked}/${allTraits.length}`} />
          {unlockedTraitList.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {unlockedTraitList.map((t) => (
                <TraitTile key={t.traitSlug} src={TRAIT_SVG[t.traitSlug]} nome={t.trait.nome} count={t.contador} color={CAT_COLOR[t.trait.categoria] ?? "#9fe870"} />
              ))}
            </div>
          ) : (
            <EmptyState icon="🎭" title="Nenhum personagem ainda" text="Entre nos babás e seja votado pra começar a colecionar seus personagens." />
          )}

          {lockedTraits.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <p style={{ margin: "0 0 8px", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
                A desbloquear · {lockedTraits.length}
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                {lockedTraits.slice(0, 6).map((t) => (
                  <div key={t.slug} style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 12, background: "#101010", border: "1px solid #222", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.5 }}>
                    {TRAIT_SVG[t.slug] && <Image src={TRAIT_SVG[t.slug]} alt="" width={28} height={28} style={{ objectFit: "contain", filter: "grayscale(1) brightness(0.7)" }} />}
                  </div>
                ))}
                {lockedTraits.length > 6 && (
                  <div style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 12, background: "#101010", border: "1px solid #222", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, color: "#7a7a7a" }}>
                    +{lockedTraits.length - 6}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ── MEDALHAS ── */}
        <section style={{ padding: "0 16px" }}>
          <SectionTitle title="Medalhas" count={`${unlockedConq.length}/${CONQUISTAS.length}`} />
          {unlockedConq.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {unlockedConq.map((c) => (
                <div key={c.slug} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ width: "100%", aspectRatio: "1 / 1", position: "relative" }}>
                    <Image src={c.svg} alt={c.nome} fill sizes="80px" style={{ objectFit: "contain" }} />
                  </div>
                  <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 10, lineHeight: "12px", color: "#b0b0b6", textAlign: "center" }}>{c.nome}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="🏅" title="Nenhuma medalha ainda" text="Medalhas vêm com presença, MVPs e sequências boas. Bora pro próximo baba!" />
          )}
        </section>

        {/* ── HISTÓRICO ── */}
        <section style={{ padding: "0 16px" }}>
          <SectionTitle title="Histórico" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recentRodadas.length === 0 ? (
              <EmptyState icon="📅" title="Sem histórico" text="Suas rodadas vão aparecer aqui." />
            ) : (
              recentRodadas.map((r) => {
                const d = new Date(r.data);
                const label = d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
                const n = r.votos.length;
                return (
                  <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0a0e0e", border: "1px solid #2c2c2c", borderRadius: 14, padding: "12px 16px" }}>
                    <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: "#fff", textTransform: "capitalize" }}>{label}</span>
                    <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: n > 0 ? "#9fe870" : "#7a7a7a" }}>{n > 0 ? `${n} voto${n > 1 ? "s" : ""}` : "Sem votos"}</span>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

/* ── Componentes de apresentação ── */

function MetaPill({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 9999, background: "rgba(255,255,255,0.06)", boxShadow: "0 0 0 1px rgba(255,255,255,0.10)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>
      {children}
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ position: "relative", overflow: "hidden", background: "#0a0e0e", border: "1px solid #2c2c2c", borderRadius: 16, padding: "14px 14px 12px" }}>
      <div aria-hidden style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 3, background: color }} />
      <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>{label}</div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 40, lineHeight: 0.95, color, fontVariantNumeric: "tabular-nums", marginTop: 2 }}>{value}</div>
    </div>
  );
}

function SectionTitle({ title, count }: { title: string; count?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
      <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 18, letterSpacing: "0.04em", textTransform: "uppercase", color: "#fff" }}>{title}</h2>
      {count && <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, color: "var(--color-text-muted)" }}>{count}</span>}
    </div>
  );
}

function TraitTile({ src, nome, count, color }: { src?: string; nome: string; count: number; color: string }) {
  return (
    <div style={{ background: "#0a0e0e", border: `1px solid ${hexA(color, "40")}`, borderRadius: 14, padding: "12px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ width: 48, height: 48, position: "relative" }}>
        {src && <Image src={src} alt={nome} fill sizes="48px" style={{ objectFit: "contain" }} />}
      </div>
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11, lineHeight: "13px", color: "#fff", textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{nome}</span>
      {count > 1 && <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, color }}>{count}×</span>}
    </div>
  );
}

function EmptyState({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div style={{ background: "#0a0e0e", border: "1px dashed #2c2c2c", borderRadius: 18, padding: "28px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 30, marginBottom: 8 }}>{icon}</div>
      <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "#fff" }}>{title}</p>
      <p style={{ margin: "6px 0 0", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 13, lineHeight: "18px", color: "#7a7a7a" }}>{text}</p>
    </div>
  );
}
