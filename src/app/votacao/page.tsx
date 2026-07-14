import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BottomNav } from "@/components/layout/BottomNav";
import { VotacaoFlow } from "./VotacaoFlow";
import { criarRodada } from "./actions";
import Link from "next/link";
import Image from "next/image";
import { EmptyState } from "@/ds/components/EmptyState";
import { SoccerBall, CaretLeft, Bell, UsersThree, PencilSimpleLine, Trophy, Skull, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { votacaoAtiva, votacaoEncerrada, MIN_JOGADORES_VOTACAO } from "@/lib/votacaoJanela";

/** Topbar padrão (voltar + logo + sino) pras telas estáticas da votação. */
function VotacaoTopBar({ isAdmin, isSuperAdmin }: { isAdmin?: boolean; isSuperAdmin?: boolean }) {
  return (
    <div className="glass-bar" style={{
      position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)",
      width: "min(100%, 430px)", zIndex: 30, paddingTop: "env(safe-area-inset-top, 0px)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px" }}>
        <Link href="/feed" aria-label="Voltar" style={{ width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", WebkitTapHighlightColor: "transparent" }}>
          <CaretLeft size={22} color="#fff" weight="bold" />
        </Link>
        <div style={{ padding: 4, display: "flex", overflow: "clip" }}>
          <Image alt="Canelada" src="/logo.png" width={48} height={48} priority style={{ objectFit: "cover", borderRadius: "50%" }} />
        </div>
        {isAdmin ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {isSuperAdmin && (
              <Link href="/votacao/admin" aria-label="Editar votos" style={{
                width: 40, height: 40, borderRadius: 14, flexShrink: 0,
                background: "#0d0d0d", border: "1px solid #090909",
                display: "flex", alignItems: "center", justifyContent: "center", WebkitTapHighlightColor: "transparent",
              }}>
                <PencilSimpleLine size={19} color="#fff" weight="bold" />
              </Link>
            )}
            <Link href="/votacao/presenca" aria-label="Editar quem jogou" style={{
              width: 40, height: 40, borderRadius: 14, flexShrink: 0,
              background: "#0d0d0d", border: "1px solid #090909",
              display: "flex", alignItems: "center", justifyContent: "center", WebkitTapHighlightColor: "transparent",
            }}>
              <UsersThree size={19} color="#fff" weight="bold" />
            </Link>
          </div>
        ) : (
          <div aria-hidden style={{ width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bell size={24} color="#fff" weight="bold" />
          </div>
        )}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";

export default async function VotacaoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const jogador = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { id: true, grupoId: true, role: true },
  });
  if (!jogador) redirect("/onboarding");
  const isAdmin = jogador.role === "ADMIN" || jogador.role === "SUPER_ADMIN";
  const isSuperAdmin = jogador.role === "SUPER_ADMIN";

  // Acesso por JANELA DE HORÁRIO (não depende do cron ter flipado votacaoAberta).
  // Pega a rodada aberta mais recente e valida se estamos dentro da janela de votação.
  //
  // Fallback de resiliência: o cron de encerrar-votacao pode falhar em silêncio
  // (já aconteceu — zero invocações num dia inteiro); corrige o flag `encerrada`
  // aqui também, não só no feed, pra quem abre /votacao direto ver estado fresco.
  const abertasDoGrupo = await prisma.rodada.findMany({
    where: { grupoId: jogador.grupoId, encerrada: false },
    select: { id: true, data: true },
  });
  const idsParaFechar = abertasDoGrupo.filter((r) => votacaoEncerrada(r.data)).map((r) => r.id);
  if (idsParaFechar.length > 0) {
    await prisma.rodada.updateMany({ where: { id: { in: idsParaFechar } }, data: { encerrada: true } });
  }

  const rodadaAtiva = await prisma.rodada.findFirst({
    where: { grupoId: jogador.grupoId, encerrada: false },
    orderBy: { createdAt: "desc" },
  });
  let rodada = rodadaAtiva && (rodadaAtiva.votacaoAberta || votacaoAtiva(rodadaAtiva.data))
    ? rodadaAtiva
    : null;

  // Grupo pequeno demais ainda: não libera votação (ficaria vazia/sem graça).
  // Só vale pra quem ainda não foi aberta oficialmente — uma vez aberta
  // (votacaoAberta=true, seja pelo cron ou manualmente), continua valendo até fechar.
  if (rodada && !rodada.votacaoAberta) {
    const totalJogadores = await prisma.jogador.count({ where: { grupoId: jogador.grupoId } });
    if (totalJogadores < MIN_JOGADORES_VOTACAO) rodada = null;
  }

  if (!rodada) {
    return <NoRodadaScreen isAdmin={isAdmin} isSuperAdmin={isSuperAdmin} />;
  }

  const jaVotou = await prisma.voto.findFirst({
    where: { rodadaId: rodada.id, votanteId: jogador.id },
  });

  if (jaVotou) {
    const votos = await prisma.voto.findMany({
      where: { rodadaId: rodada.id, votanteId: jogador.id },
      include: {
        votado: { select: { apelido: true } },
        trait: { select: { nome: true, emoji: true } },
      },
    });
    return <JaVotouScreen votos={votos} isAdmin={isAdmin} isSuperAdmin={isSuperAdmin} />;
  }

  // Só quem foi marcado como presente nessa rodada pode votar OU ser votado —
  // sem esse filtro, gente que acabou de se cadastrar e nunca jogou naquele
  // dia entrava como candidato (e conseguia votar) só por estar no grupo.
  const souPresente = await prisma.rodada.findFirst({
    where: { id: rodada.id, presentes: { some: { id: jogador.id } } },
    select: { id: true },
  });
  if (!souPresente) {
    return <SemPresencaScreen isAdmin={isAdmin} isSuperAdmin={isSuperAdmin} />;
  }

  const [jogadores, traits] = await Promise.all([
    prisma.jogador.findMany({
      where: { grupoId: jogador.grupoId, rodadasPresente: { some: { id: rodada.id } } },
      select: { id: true, apelido: true },
      orderBy: { apelido: "asc" },
    }),
    prisma.trait.findMany({
      select: { slug: true, nome: true, categoria: true, emoji: true, descricao: true },
    }),
  ]);

  return (
    <VotacaoFlow
      rodadaId={rodada.id}
      meuId={jogador.id}
      jogadores={jogadores}
      traits={traits}
      isAdmin={isAdmin}
    />
  );
}

function NoRodadaScreen({ isAdmin, isSuperAdmin }: { isAdmin: boolean; isSuperAdmin: boolean }) {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
      <VotacaoTopBar isAdmin={isAdmin} isSuperAdmin={isSuperAdmin} />

      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "calc(env(safe-area-inset-top, 0px) + 88px) 16px calc(88px + env(safe-area-inset-bottom, 0px))",
      }}>
        <EmptyState
          icon={<SoccerBall size={26} weight="regular" />}
          title="Sem baba ativa"
          description="Quando o dono do grupo marcar que o baba rolou, a votação dos personagens abre aqui."
          action={
            isSuperAdmin ? (
              <form action={criarRodada}>
                <button
                  type="submit"
                  style={{
                    height: 48,
                    padding: "0 24px",
                    background: "#9fe870",
                    color: "#0a1a06",
                    border: "none",
                    borderRadius: 9999,
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: 15,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <SoccerBall size={18} weight="bold" color="#0a1a06" />
                  Baba rolou hoje
                </button>
              </form>
            ) : undefined
          }
        />
      </main>

      <BottomNav />
    </div>
  );
}

function SemPresencaScreen({ isAdmin, isSuperAdmin }: { isAdmin: boolean; isSuperAdmin: boolean }) {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
      <VotacaoTopBar isAdmin={isAdmin} isSuperAdmin={isSuperAdmin} />

      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "calc(env(safe-area-inset-top, 0px) + 88px) 16px calc(88px + env(safe-area-inset-bottom, 0px))",
      }}>
        <EmptyState
          icon={<UsersThree size={26} weight="regular" />}
          title="Você não jogou essa rodada"
          description="Só quem foi marcado como presente pode votar (e ser votado). Se você jogou e não foi marcado, peça pra um admin te adicionar."
          action={isAdmin ? (
            <Link
              href="/votacao/presenca"
              style={{
                height: 48,
                padding: "0 24px",
                background: "#9fe870",
                color: "#0a1a06",
                borderRadius: 9999,
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 15,
                display: "flex",
                alignItems: "center",
                gap: 8,
                textDecoration: "none",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <UsersThree size={18} weight="bold" color="#0a1a06" />
              Marcar presença
            </Link>
          ) : undefined}
        />
      </main>

      <BottomNav />
    </div>
  );
}

type VotoComVotado = {
  id: string;
  categoria: string;
  traitSlug: string | null;
  votado: { apelido: string };
  trait: { nome: string; emoji: string | null } | null;
};

// Categorias legadas (MVP/BAGRE/RAÇUDO/RESENHA) não existem mais na votação
// real (só TRAIT), mas ficam aqui como fallback pra qualquer voto antigo.
const CATEGORIA_LABEL: Record<string, string> = {
  MVP: "MVP", BAGRE: "Bagre", RACUDO: "Raçudo", RESENHA: "Resenha", TRAIT: "Trait",
};

// Mesmo agrupamento usado no fluxo de voto (VotacaoFlow) e na revisão —
// mantém a tela "já votou" com a cara do resto do produto em vez de uma
// lista genérica com emoji solto.
const HERO_SLUGS = ["categoria", "matador", "paredao", "bagre", "gol-mais-bonito"];
const POSITIVO_SLUGS = ["racudo", "xerife", "garcom", "driblador", "resenha-forte"];

function JaVotouScreen({ votos, isAdmin, isSuperAdmin }: { votos: VotoComVotado[]; isAdmin: boolean; isSuperAdmin: boolean }) {
  const grupos = [
    { label: `Os ${HERO_SLUGS.length} da noite`, tone: "#9fe870", border: "#2c2c2c", bg: "rgba(159,232,112,0.08)", icon: <Trophy size={20} color="#9fe870" weight="fill" />, votosIn: votos.filter(v => v.traitSlug && HERO_SLUGS.includes(v.traitSlug)) },
    { label: "Positivo", tone: "#9fe870", border: "#2c2c2c", bg: "rgba(159,232,112,0.08)", icon: <Trophy size={20} color="#9fe870" weight="fill" />, votosIn: votos.filter(v => v.traitSlug && POSITIVO_SLUGS.includes(v.traitSlug)) },
    { label: "Negativo", tone: "#e56767", border: "#3a2424", bg: "rgba(229,103,103,0.08)", icon: <Skull size={20} color="#e56767" weight="fill" />, votosIn: votos.filter(v => v.traitSlug && !HERO_SLUGS.includes(v.traitSlug) && !POSITIVO_SLUGS.includes(v.traitSlug)) },
  ].filter(g => g.votosIn.length > 0);

  return (
    <div style={{ minHeight: "100dvh", background: "#090909", display: "flex", flexDirection: "column" }}>
      <VotacaoTopBar isAdmin={isAdmin} isSuperAdmin={isSuperAdmin} />

      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "calc(env(safe-area-inset-top, 0px) + 88px) 16px calc(88px + env(safe-area-inset-bottom, 0px))",
        textAlign: "center",
        gap: 24,
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%", background: "#9fe870",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          boxShadow: "0 8px 24px rgba(159,232,112,0.25)",
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4 12.5L9.5 18L20 6" stroke="#090909" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "clamp(32px, 9vw, 40px)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
            color: "#fff",
            margin: "0 0 8px",
          }}>
            Já votou <span style={{ color: "#9fe870" }}>hoje.</span>
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: "#8a8a8a", fontFamily: "var(--font-body)" }}>
            Seus votos foram registrados.
          </p>
        </div>

        {grupos.length > 0 && (
          <div style={{ width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 20, textAlign: "left" }}>
            {grupos.map((g) => (
              <div key={g.label}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 8px 10px" }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: "#171717", border: `1px solid ${g.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {g.icon}
                  </div>
                  <h3 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "#fff" }}>
                    {g.label}
                  </h3>
                </div>
                <div style={{ background: "#141414", border: `1px solid ${g.border}`, borderRadius: 20, overflow: "hidden" }}>
                  {g.votosIn.map((v, i) => (
                    <div key={v.id} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 14px", background: g.bg,
                      borderTop: i === 0 ? "none" : "1px solid #1f1f1f",
                    }}>
                      <div style={{ width: 44, height: 44, position: "relative", flexShrink: 0 }}>
                        {v.traitSlug ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img alt="" src={`/votacao-mascot/${v.traitSlug}.png`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }} />
                        ) : (
                          <span style={{ fontSize: 22 }}>{v.trait?.emoji ?? "⚽"}</span>
                        )}
                      </div>
                      <span style={{ flex: 1, minWidth: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14, letterSpacing: "0.04em", color: "#fff", textTransform: "uppercase" }}>
                        {v.trait?.nome ?? CATEGORIA_LABEL[v.categoria] ?? v.categoria}
                      </span>
                      <div style={{
                        flexShrink: 0, display: "flex", alignItems: "center", gap: 6,
                        height: 32, padding: "0 14px", borderRadius: 9999, background: "#9fe870",
                      }}>
                        <span style={{
                          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "#0a1a06",
                          maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {v.votado.apelido}
                        </span>
                        <CheckCircle size={16} color="#0a1a06" weight="fill" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
