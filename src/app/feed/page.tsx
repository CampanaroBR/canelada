import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BottomNav } from "@/components/layout/BottomNav";
import Link from "next/link";
import { criarRodada } from "@/app/votacao/actions";

export const dynamic = "force-dynamic";

/* ── Types ── */
type MaisVotado = { apelido: string; foto: string | null; qtd: number; categoria: string };
type PersonagemStory = {
  id: string;
  tipo: string;
  texto: string;
  rodada: { data: Date };
  jogadorApelido?: string;
};
type Conquista = { apelido: string; foto: string | null; traitNome: string; traitEmoji: string | null; conquista: Date };

export default async function FeedPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const jogador = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { id: true, grupoId: true },
  });
  if (!jogador) redirect("/onboarding");

  const grupoId = jogador.grupoId;

  const [rodadaAtiva, topVotados, recentStories, recentConquistas] = await Promise.all([
    // Rodada aberta
    prisma.rodada.findFirst({
      where: { grupoId, encerrada: false },
      select: { id: true, data: true },
      orderBy: { createdAt: "desc" },
    }),

    // Top 3 mais votados (MVP) no grupo, todas as rodadas
    prisma.voto.groupBy({
      by: ["votadoId"],
      where: { rodada: { grupoId }, categoria: "MVP" },
      _count: { votadoId: true },
      orderBy: { _count: { votadoId: "desc" } },
      take: 3,
    }),

    // Últimas stories (personagem da semana)
    prisma.story.findMany({
      where: { rodada: { grupoId }, tipo: { in: ["MVP", "BAGRE"] } },
      include: { rodada: { select: { data: true } } },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),

    // Conquistas recentes (traits)
    prisma.jogadorTrait.findMany({
      where: { jogador: { grupoId } },
      include: {
        jogador: { select: { apelido: true, foto: true } },
        trait: { select: { nome: true, emoji: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 3,
    }),
  ]);

  // Resolve nomes dos mais votados
  let maisVotados: MaisVotado[] = [];
  if (topVotados.length > 0) {
    const ids = topVotados.map(v => v.votadoId);
    const jogadores = await prisma.jogador.findMany({
      where: { id: { in: ids } },
      select: { id: true, apelido: true, foto: true },
    });
    const jogMap = Object.fromEntries(jogadores.map(j => [j.id, j]));
    maisVotados = topVotados.map(v => ({
      apelido: jogMap[v.votadoId]?.apelido ?? "?",
      foto: jogMap[v.votadoId]?.foto ?? null,
      qtd: v._count.votadoId,
      categoria: "MVP",
    }));
  }

  // Personagens da semana — extrai nome do texto do story
  const personagens: PersonagemStory[] = recentStories.map(s => ({
    id: s.id,
    tipo: s.tipo,
    texto: s.texto,
    rodada: s.rodada,
  }));

  // Conquistas
  const conquistas: Conquista[] = recentConquistas.map(c => ({
    apelido: c.jogador.apelido,
    foto: c.jogador.foto,
    traitNome: c.trait.nome,
    traitEmoji: c.trait.emoji,
    conquista: c.updatedAt,
  }));

  const jaVotou = rodadaAtiva
    ? !!(await prisma.voto.findFirst({
        where: { rodadaId: rodadaAtiva.id, votanteId: jogador.id },
        select: { id: true },
      }))
    : false;

  const dataRodada = rodadaAtiva
    ? new Date(rodadaAtiva.data).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })
    : null;

  return (
    <div style={{ minHeight: "100dvh", background: "#090909", paddingBottom: "calc(80px + env(safe-area-inset-bottom,0px))" }}>

      {/* ── Topbar ── */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        width: "100%",
        background: "rgba(9,9,9,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}>
        {/* Status bar placeholder height */}
        <div style={{ height: "54px" }} />
        <div style={{
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 8px",
        }}>
          <button style={{ width: 56, height: 64, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round"><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></svg>
          </button>
          {/* Logo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="http://localhost:3845/assets/31c46a81e6d70b0dc33ca60496ecfa043e761f1c.png"
            alt="Canelada"
            style={{ width: 64, height: 64, objectFit: "contain" }}
          />
          <button style={{ width: 56, height: 60, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
          </button>
        </div>
      </header>

      <main style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* ── 1. VOTAÇÃO CARD (topo teal) ── */}
        <section style={{
          background: "var(--color-mvp, #1998ad)",
          borderBottomLeftRadius: "40px",
          borderBottomRightRadius: "40px",
          paddingBottom: "24px",
          paddingLeft: "16px",
          paddingRight: "16px",
          marginTop: "-118px",
          paddingTop: "calc(118px + 16px)",
        }}>
          <div style={{
            background: "white",
            borderRadius: "48px",
            overflow: "hidden",
            padding: "12px",
          }}>
            {/* Campo de futebol */}
            <div style={{
              borderRadius: "40px",
              border: "1px solid #777575",
              background: "#1a3a00",
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 34px, rgba(255,255,255,0.06) 34px, rgba(255,255,255,0.06) 36px)",
              overflow: "hidden",
              padding: "16px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "0",
            }}>
              {/* Info + ação */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "14px", lineHeight: "20px", color: "white", margin: 0 }}>VOTAÇÃO DO</p>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "32px", lineHeight: "32px", color: "white", margin: 0 }}>BABA</p>
                  {rodadaAtiva ? (
                    <div style={{ marginTop: "6px", display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(55,55,55,0.2)", padding: "4px 8px", borderRadius: "100px" }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00ff00" }} />
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "12px", color: "white", letterSpacing: "-0.4px" }}>Votação aberta até às 15h</span>
                    </div>
                  ) : (
                    <div style={{ marginTop: "6px", display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(55,55,55,0.2)", padding: "4px 8px", borderRadius: "100px" }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#888" }} />
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "12px", color: "rgba(255,255,255,0.6)", letterSpacing: "-0.4px" }}>Nenhuma rodada aberta</span>
                    </div>
                  )}
                </div>
                {dataRodada && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                    <div style={{ background: "#1e1e1e", padding: "4px 8px", borderRadius: "48px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9fe870" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "12px", color: "#9fe870", letterSpacing: "-0.48px" }}>{dataRodada}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Silhuetas de jogadores */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", marginTop: "16px" }}>
                {/* Atacante */}
                <PlayerSlot label="VOTE" />
                {/* Meio-campo */}
                <div style={{ display: "flex", justifyContent: "center", gap: "62px", width: "100%" }}>
                  <PlayerSlot label="VOTE" />
                  <PlayerSlot label="VOTE" />
                  <PlayerSlot label="VOTE" />
                </div>
                {/* Zagueiro */}
                <div style={{ borderTop: "1px solid #5e5e5e", width: "292px", paddingTop: "16px", display: "flex", justifyContent: "center" }}>
                  <PlayerSlot label="VOTE" />
                </div>
              </div>

              {/* Botão VOTAR AGORA */}
              {rodadaAtiva && !jaVotou && (
                <Link href="/votacao" style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "16px",
                  padding: "16px 20px",
                  background: "var(--color-accent)",
                  borderRadius: "16px",
                  textDecoration: "none",
                }}>
                  <div>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "16px", color: "#090909", margin: 0 }}>VOTAR AGORA</p>
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(0,0,0,0.5)", margin: 0 }}>Escolha a personagem de cada um</p>
                  </div>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(0,0,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#090909" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                </Link>
              )}
              {!rodadaAtiva && (
                <form action={criarRodada} style={{ marginTop: "16px" }}>
                  <button type="submit" style={{
                    width: "100%",
                    padding: "16px 20px",
                    background: "var(--color-accent)",
                    border: "none",
                    borderRadius: "16px",
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: "16px",
                    color: "#090909",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    justifyContent: "center",
                  }}>
                    ⚽ BABA ROLOU HOJE
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* ── 2. MAIS VOTADOS ── */}
        {maisVotados.length > 0 && (
          <section style={{ margin: "0 8px", background: "#141414", borderRadius: "20px", overflow: "hidden" }}>
            <SectionHeader icon={<TrophyIcon />} title="MAIS VOTADOS" action="Ver mais" />
            <div style={{ padding: "0 17px 17px" }}>
              {maisVotados.map((j, idx) => (
                <LeaderboardRow key={idx} rank={idx + 1} apelido={j.apelido} foto={j.foto} qtd={j.qtd} />
              ))}
            </div>
          </section>
        )}

        {/* ── 3. PERSONAGEM DA SEMANA ── */}
        {personagens.length > 0 && (
          <section style={{ margin: "0 8px", background: "#141414", borderRadius: "20px", overflow: "hidden" }}>
            <SectionHeader icon={<StarIcon />} title="PERSONAGEM DA SEMANA" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              {personagens.map((p, idx) => (
                <PersonagemCard key={p.id} story={p} isLast={idx === personagens.length - 1} />
              ))}
            </div>
          </section>
        )}

        {/* ── 4. MEDALHAS / CONQUISTAS ── */}
        {conquistas.length > 0 && (
          <section style={{ margin: "0 8px", background: "#141414", borderRadius: "20px", overflow: "hidden" }}>
            <SectionHeader icon={<MedalIcon />} title="MEDALHAS" action="Ver todas" />
            {/* Counter */}
            <div style={{ padding: "0 17px 12px", display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "24px" }}>🥇</span>
              <div>
                <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "14px", color: "white", margin: 0 }}>
                  {conquistas.length} de {conquistas.length} jogadores
                </p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(255,255,255,0.4)", margin: 0 }}>
                  já conquistaram uma medalha
                </p>
              </div>
            </div>
            {/* Lista */}
            <div style={{ padding: "0 17px 17px", display: "flex", flexDirection: "column" }}>
              {conquistas.map((c, idx) => (
                <ConquistaRow key={idx} conquista={c} />
              ))}
            </div>
          </section>
        )}

      </main>

      <BottomNav />
    </div>
  );
}

/* ── Sub-components ── */

function PlayerSlot({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{
        width: 48, height: 48,
        background: "#1e1e1e",
        border: "1px solid #555",
        borderRadius: "22px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "-8px",
        boxShadow: "0 5px 7px 4px rgba(0,0,0,0.3)",
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M20.38 3.46L16 2a4 4 0 00-8 0L3.62 3.46a2 2 0 00-1.55 2.022l.29 2.39A18.1 18.1 0 0012 22a18.1 18.1 0 009.64-14.128l.29-2.39a2 2 0 00-1.55-2.022z" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
        </svg>
      </div>
      <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "12px", color: "white", margin: 0, marginTop: "10px" }}>{label}</p>
    </div>
  );
}

function SectionHeader({ icon, title, action }: { icon: React.ReactNode; title: string; action?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "17px 17px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ display: "flex", alignItems: "center", opacity: 0.7 }}>{icon}</span>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "14px", color: "white", letterSpacing: "0.02em" }}>{title}</span>
      </div>
      {action && (
        <button style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", padding: "4px 0" }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>{action}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      )}
    </div>
  );
}

function LeaderboardRow({ rank, apelido, foto, qtd }: { rank: number; apelido: string; foto: string | null; qtd: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", gap: "8px" }}>
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "14px", color: "rgba(255,255,255,0.4)", width: "20px", textAlign: "right" }}>
        {rank}.
      </span>
      <div style={{
        width: 40, height: 40, borderRadius: "12px",
        background: rank === 1 ? "var(--color-accent)" : "#242424",
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden",
        flexShrink: 0,
      }}>
        {foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={foto} alt={apelido} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "16px", color: rank === 1 ? "#090909" : "rgba(255,255,255,0.4)" }}>
            {apelido[0].toUpperCase()}
          </span>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "15px", color: "white", margin: 0 }}>{apelido.toUpperCase()}</p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(255,255,255,0.35)", margin: 0 }}>MVP</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "16px", color: rank === 1 ? "var(--color-accent)" : "rgba(255,255,255,0.5)" }}>{qtd}x</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={rank === 1 ? "var(--color-accent)" : "rgba(255,255,255,0.3)"} strokeWidth="1.8"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      </div>
    </div>
  );
}

function PersonagemCard({ story, isLast }: { story: PersonagemStory; isLast: boolean }) {
  const isMvp = story.tipo === "MVP";
  const date = new Date(story.rodada.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const tipoLabel = isMvp ? "MATADOR" : "BAGRE DA NOITE";
  const tipoColor = isMvp ? "var(--color-accent)" : "var(--color-bagre, #d42020)";

  // Extract player name from story text heuristically
  const nomeMatch = story.texto.match(/^(\w+ ?\w+)/);
  const nome = nomeMatch ? nomeMatch[1] : "Jogador";

  return (
    <div style={{
      padding: "17px",
      borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.06)",
      display: "flex",
      alignItems: "center",
      gap: "17px",
    }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "20px", color: tipoColor, margin: 0, lineHeight: "24px" }}>{tipoLabel}</p>
        <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "15px", color: "white", margin: 0 }}>{nome}</p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "rgba(255,255,255,0.3)", margin: "2px 0 0" }}>
          Votado {isMvp ? "📅" : "🐟"} · {date}
        </p>
        <button style={{
          marginTop: "10px",
          background: "#1e1e1e",
          border: "none",
          borderRadius: "8px",
          padding: "6px 12px",
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "12px",
          color: "rgba(255,255,255,0.6)",
          cursor: "pointer",
        }}>
          Ver mais →
        </button>
      </div>
      <div style={{
        width: 117, height: 117, flexShrink: 0,
        background: "rgba(255,255,255,0.04)",
        borderRadius: "16px",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "64px",
      }}>
        {isMvp ? "⚽" : "🐟"}
      </div>
    </div>
  );
}

function ConquistaRow({ conquista }: { conquista: Conquista }) {
  const date = new Date(conquista.conquista).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "9px 0", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ width: 72, height: 72, borderRadius: "16px", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px", flexShrink: 0 }}>
        {conquista.traitEmoji ?? "🏅"}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>HOJE · NOVA MEDALHA</span>
        </div>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "16px", color: "white", margin: "2px 0 0", lineHeight: "20px" }}>
          {conquista.apelido} destravou &ldquo;{conquista.traitNome}&rdquo;!
        </p>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "rgba(255,255,255,0.3)", margin: "2px 0 0" }}>{date}</p>
      </div>
    </div>
  );
}

function TrophyIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 6 2 6 2 16 8 16"/><polyline points="16 6 22 6 22 16 16 16"/><rect x="8" y="2" width="8" height="20" rx="2"/></svg>;
}

function StarIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
}

function MedalIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>;
}
