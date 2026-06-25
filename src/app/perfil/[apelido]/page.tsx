import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BottomNav } from "@/components/layout/BottomNav";
import Link from "next/link";
import Image from "next/image";
import { TRAIT_SVG } from "@/lib/assets";
import { EditarPerfilSheet } from "../EditarPerfilSheet";
import { CONQUISTAS, CAT_CONQUISTA_CONFIG, computeConquistas, computeOverall, type ConquistaCategoria } from "@/lib/conquistas";

export const dynamic = "force-dynamic";

const ACCENT = "#9fe870";

function getInitials(name: string) {
  const p = name.trim().split(/\s+/);
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

// cor de acento por categoria de trait
const TRAIT_CAT: Record<string, { label: string; color: string }> = {
  FUTEBOL: { label: "Futebol", color: "#9fe870" },
  PERSONALIDADE: { label: "Personalidade", color: "#f0a14e" },
  RESENHA: { label: "Resenha", color: "#5aa9e6" },
};

export default async function PerfilPage({ params }: { params: Promise<{ apelido: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { apelido: apelidoParam } = await params;
  const apelido = decodeURIComponent(apelidoParam);

  const jogador = await prisma.jogador.findFirst({
    where: { apelido: { equals: apelido, mode: "insensitive" } },
    select: {
      id: true, userId: true, apelido: true, nome: true, sobrenome: true,
      posicao: true, peDominante: true, grupoId: true, createdAt: true,
      traitsRecebidas: { select: { traitSlug: true, contador: true } },
    },
  });

  if (!jogador) {
    return (
      <div style={{ minHeight: "100dvh", background: "#090909", display: "flex", flexDirection: "column" }}>
        <header style={{ height: 56, display: "flex", alignItems: "center", padding: "0 16px" }}>
          <Link href="/feed" style={{ color: "#7a7a7a", display: "flex", alignItems: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </Link>
        </header>
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <p style={{ color: "#7a7a7a", fontFamily: "var(--font-body)", fontSize: 14 }}>Jogador não encontrado.</p>
        </main>
        <BottomNav />
      </div>
    );
  }

  const [allTraits, mvpCount, bagreCount, racudoCount, resenhaCount, totalRodadas, presencaRows, recentRodadas] = await Promise.all([
    prisma.trait.findMany({ orderBy: [{ categoria: "asc" }, { nome: "asc" }], select: { slug: true, nome: true, categoria: true } }),
    prisma.voto.count({ where: { votadoId: jogador.id, categoria: "MVP" } }),
    prisma.voto.count({ where: { votadoId: jogador.id, categoria: "BAGRE" } }),
    prisma.voto.count({ where: { votadoId: jogador.id, categoria: "RACUDO" } }),
    prisma.voto.count({ where: { votadoId: jogador.id, categoria: "RESENHA" } }),
    prisma.rodada.count({ where: { grupoId: jogador.grupoId } }),
    prisma.voto.findMany({ where: { votadoId: jogador.id }, select: { rodadaId: true }, distinct: ["rodadaId"] }),
    prisma.rodada.findMany({
      where: { grupoId: jogador.grupoId },
      select: { id: true, data: true, votos: { where: { votadoId: jogador.id }, select: { categoria: true } } },
      orderBy: { data: "desc" }, take: 5,
    }),
  ]);

  const unlockedMap = new Map(jogador.traitsRecebidas.map((t) => [t.traitSlug, t.contador]));
  const initials = getInitials(jogador.apelido);
  const isOwner = jogador.userId === session.user.id;
  const nomeCompleto = [jogador.nome, jogador.sobrenome].filter(Boolean).join(" ");
  const traitsUnlocked = jogador.traitsRecebidas.length;
  const presencaCount = presencaRows.length;
  const joinYear = new Date(jogador.createdAt).getFullYear();

  const conquiStats = { mvpCount, bagreCount, racudoCount, resenhaCount, traitsUnlocked, presencaCount };
  const overall = computeOverall(conquiStats);
  const conquistasUnlocked = computeConquistas(conquiStats);
  const conqUnlockedCount = CONQUISTAS.filter((c) => conquistasUnlocked.has(c.slug)).length;

  const traitsByCat = ["FUTEBOL", "PERSONALIDADE", "RESENHA"].map((cat) => ({
    cat,
    cfg: TRAIT_CAT[cat],
    items: allTraits.filter((t) => t.categoria === cat),
  })).filter((g) => g.items.length > 0);

  const conqByCat = (["SEQUENCIA", "MENSAL", "HISTORICA"] as ConquistaCategoria[]).map((cat) => ({
    cat,
    cfg: CAT_CONQUISTA_CONFIG[cat],
    items: CONQUISTAS.filter((c) => c.categoria === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div style={{ minHeight: "100dvh", background: "#090909" }}>
      {/* ── Topbar ── */}
      <header className="glass-bar" style={{ position: "sticky", top: 0, zIndex: 30, height: 56, display: "flex", alignItems: "center", padding: "0 16px", gap: 12 }}>
        <Link href="/feed" aria-label="Voltar" style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", marginLeft: -8, textDecoration: "none", flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </Link>
        <span style={{ flex: 1, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7a7a7a" }}>Perfil</span>
        {isOwner && (
          <EditarPerfilSheet initial={{ nome: jogador.nome ?? "", sobrenome: jogador.sobrenome ?? "", apelido: jogador.apelido, posicao: jogador.posicao ?? "", peDominante: jogador.peDominante ?? "" }} />
        )}
      </header>

      <main style={{ paddingBottom: "calc(96px + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* ── Card do jogador ── */}
        <div style={{ padding: "12px 16px 0" }}>
          <div style={{ background: "#0a0e0e", border: "1px solid #2c2c2c", borderRadius: 20, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", flexShrink: 0, background: "#171717", border: `2px solid ${ACCENT}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 26, color: ACCENT }}>{initials}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 26, lineHeight: 1, letterSpacing: "-0.01em", textTransform: "uppercase", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{jogador.apelido}</h1>
                {nomeCompleto && <p style={{ margin: "4px 0 0", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 13, color: "#7a7a7a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{nomeCompleto}</p>}
              </div>
              <div style={{ flexShrink: 0, textAlign: "center", background: "#090909", border: `1px solid ${ACCENT}55`, borderRadius: 14, padding: "8px 14px" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 28, lineHeight: 0.9, color: ACCENT, fontVariantNumeric: "tabular-nums" }}>{overall}</div>
                <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 9, letterSpacing: "0.14em", color: ACCENT, opacity: 0.8, marginTop: 2 }}>OVR</div>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
              <Pill>⚽ {totalRodadas} {totalRodadas === 1 ? "rodada" : "rodadas"}</Pill>
              <Pill>Desde {joinYear}</Pill>
              {jogador.posicao && <Pill>{jogador.posicao}</Pill>}
              {jogador.peDominante && <Pill>Pé {jogador.peDominante}</Pill>}
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div style={{ padding: "0 16px", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
          <Metric label="Presenças" value={presencaCount} color={ACCENT} />
          <Metric label="MVPs" value={mvpCount} color="#B5FF4D" />
          <Metric label="Bagres" value={bagreCount} color="#EF4444" />
          <Metric label="Personagens" value={traitsUnlocked} color="#A78BFA" />
        </div>

        {/* ── Personagens (traits) ── */}
        <section style={{ padding: "0 16px" }}>
          <SectionTitle title="Personagens" count={`${traitsUnlocked}/${allTraits.length}`} />
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {traitsByCat.map((g) => (
              <div key={g.cat}>
                <CatLabel label={g.cfg.label} color={g.cfg.color} count={`${g.items.filter((t) => unlockedMap.has(t.slug)).length}/${g.items.length}`} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {g.items.map((t) => (
                    <Tile key={t.slug} src={TRAIT_SVG[t.slug]} nome={t.nome} unlocked={unlockedMap.has(t.slug)} accent={g.cfg.color} count={unlockedMap.get(t.slug)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Medalhas (conquistas) ── */}
        <section style={{ padding: "0 16px" }}>
          <SectionTitle title="Medalhas" count={`${conqUnlockedCount}/${CONQUISTAS.length}`} />
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {conqByCat.map((g) => (
              <div key={g.cat}>
                <CatLabel label={g.cfg.label} color={g.cfg.color} count={`${g.items.filter((c) => conquistasUnlocked.has(c.slug)).length}/${g.items.length}`} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {g.items.map((c) => (
                    <Tile key={c.slug} src={c.svg} nome={c.nome} unlocked={conquistasUnlocked.has(c.slug)} accent={g.cfg.color} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Histórico ── */}
        <section style={{ padding: "0 16px" }}>
          <SectionTitle title="Histórico" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recentRodadas.length === 0 ? (
              <div style={{ background: "#0a0e0e", border: "1px solid #2c2c2c", borderRadius: 14, padding: "16px", textAlign: "center", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 13, color: "#7a7a7a" }}>
                Suas rodadas vão aparecer aqui.
              </div>
            ) : recentRodadas.map((r) => {
              const label = new Date(r.data).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
              const n = r.votos.length;
              return (
                <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0a0e0e", border: "1px solid #2c2c2c", borderRadius: 14, padding: "12px 16px" }}>
                  <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: "#fff", textTransform: "capitalize" }}>{label}</span>
                  <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: n > 0 ? ACCENT : "#7a7a7a" }}>{n > 0 ? `${n} voto${n > 1 ? "s" : ""}` : "Sem votos"}</span>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

/* ── Componentes ── */

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 9999, background: "#141414", border: "1px solid #2c2c2c", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase", color: "#9b9b9b", whiteSpace: "nowrap" }}>
      {children}
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ position: "relative", overflow: "hidden", background: "#0a0e0e", border: "1px solid #2c2c2c", borderRadius: 16, padding: "14px 14px 12px" }}>
      <div aria-hidden style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 3, background: color }} />
      <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#7a7a7a" }}>{label}</div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 38, lineHeight: 0.95, color, fontVariantNumeric: "tabular-nums", marginTop: 2 }}>{value}</div>
    </div>
  );
}

function SectionTitle({ title, count }: { title: string; count?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
      <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 18, letterSpacing: "0.04em", textTransform: "uppercase", color: "#fff" }}>{title}</h2>
      {count && <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, color: "#7a7a7a" }}>{count}</span>}
    </div>
  );
}

function CatLabel({ label, color, count }: { label: string; color: string; count: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
      <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color }}>{label}</span>
      <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11, color: "#7a7a7a" }}>{count}</span>
    </div>
  );
}

function Tile({ src, nome, unlocked, accent, count }: { src?: string; nome: string; unlocked: boolean; accent: string; count?: number }) {
  return (
    <div style={{ position: "relative", background: "#0a0e0e", border: `1px solid ${unlocked ? accent : "#2c2c2c"}`, borderRadius: 12, boxSizing: "border-box", height: 118, padding: "20px 8px 8px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", gap: 3 }}>
      {!unlocked ? (
        <div style={{ position: "absolute", top: 7, right: 7, zIndex: 2 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff" aria-hidden><path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5Zm3 8H9V6a3 3 0 0 1 6 0v3Z" /></svg>
        </div>
      ) : count && count > 1 ? (
        <div style={{ position: "absolute", top: 6, right: 6, background: accent, borderRadius: 5, padding: "0 5px", zIndex: 2 }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 9, lineHeight: "15px", color: "#0a1a06" }}>{count}×</span>
        </div>
      ) : null}
      <div style={{ width: 54, height: 54, flexShrink: 0, position: "relative" }}>
        {src && <Image src={src} alt={nome} fill sizes="54px" style={{ objectFit: "contain", filter: unlocked ? "none" : "brightness(0.45) grayscale(0.4)" }} />}
      </div>
      <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 12, lineHeight: "14px", color: unlocked ? "#fff" : "#7a7a7a", textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{nome}</p>
    </div>
  );
}
