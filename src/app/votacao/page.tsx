import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BottomNav } from "@/components/layout/BottomNav";
import { VotacaoFlow } from "./VotacaoFlow";
import { criarRodada } from "./actions";

export const dynamic = "force-dynamic";

export default async function VotacaoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const jogador = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { id: true, grupoId: true },
  });
  if (!jogador) redirect("/onboarding");

  const rodada = await prisma.rodada.findFirst({
    where: { grupoId: jogador.grupoId, encerrada: false },
    orderBy: { createdAt: "desc" },
  });

  if (!rodada) {
    return <NoRodadaScreen />;
  }

  const jaVotou = await prisma.voto.findFirst({
    where: { rodadaId: rodada.id, votanteId: jogador.id },
  });

  if (jaVotou) {
    const votos = await prisma.voto.findMany({
      where: { rodadaId: rodada.id, votanteId: jogador.id },
      include: { votado: { select: { apelido: true } } },
    });
    return <JaVotouScreen votos={votos} />;
  }

  const [jogadores, traits] = await Promise.all([
    prisma.jogador.findMany({
      where: { grupoId: jogador.grupoId },
      select: { id: true, apelido: true },
      orderBy: { apelido: "asc" },
    }),
    prisma.trait.findMany({
      orderBy: [{ categoria: "asc" }, { nome: "asc" }],
      select: { slug: true, nome: true, categoria: true, emoji: true },
    }),
  ]);

  return (
    <VotacaoFlow
      rodadaId={rodada.id}
      meuId={jogador.id}
      jogadores={jogadores}
      traits={traits}
    />
  );
}

function NoRodadaScreen() {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
      <header style={{
        height: "56px",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.05)",
      }}>
        <span style={{
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: "20px",
          letterSpacing: "0.08em",
          color: "var(--color-accent)",
          textTransform: "uppercase",
        }}>
          VOTAÇÃO
        </span>
      </header>

      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 24px calc(88px + env(safe-area-inset-bottom, 0px))",
        textAlign: "center",
        gap: "20px",
      }}>
        <div style={{ fontSize: "72px", opacity: 0.1 }}>🏟️</div>
        <div>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "clamp(42px, 11vw, 56px)",
            lineHeight: 0.88,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
            marginBottom: "12px",
          }}>
            SEM BABA<br />ATIVA.
          </h2>
          <p style={{
            fontSize: "14px",
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-body)",
            opacity: 0.7,
            maxWidth: "240px",
            lineHeight: 1.5,
          }}>
            Quando alguém marcar "Baba rolou hoje", a votação abre aqui.
          </p>
        </div>

        <form action={criarRodada}>
          <button
            type="submit"
            style={{
              marginTop: "8px",
              height: "52px",
              padding: "0 28px",
              background: "var(--color-accent)",
              color: "#0D0D0D",
              border: "none",
              borderRadius: "var(--radius-pill)",
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "14px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <span style={{ fontSize: "16px" }}>⚽</span>
            BABA ROLOU HOJE
          </button>
        </form>
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
};

const CATEGORIA_CONFIG: Record<string, { label: string; color: string }> = {
  MVP:     { label: "MVP",     color: "#9fe870" },
  BAGRE:   { label: "Bagre",   color: "#EF4444" },
  RACUDO:  { label: "Raçudo",  color: "#F59E0B" },
  RESENHA: { label: "Resenha", color: "#60A5FA" },
  TRAIT:   { label: "Trait",   color: "#A78BFA" },
};

function JaVotouScreen({ votos }: { votos: VotoComVotado[] }) {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
      <header style={{
        height: "56px",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.05)",
      }}>
        <span style={{
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: "20px",
          letterSpacing: "0.08em",
          color: "var(--color-accent)",
          textTransform: "uppercase",
        }}>
          VOTAÇÃO
        </span>
      </header>

      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 24px calc(88px + env(safe-area-inset-bottom, 0px))",
        textAlign: "center",
        gap: "24px",
      }}>
        <div style={{ fontSize: "64px", opacity: 0.9 }}>✅</div>
        <div>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "clamp(42px, 11vw, 56px)",
            lineHeight: 0.88,
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            color: "var(--color-text-primary)",
            marginBottom: "10px",
          }}>
            JÁ VOTOU<br />
            <span style={{ color: "var(--color-accent)" }}>HOJE.</span>
          </h2>
          <p style={{
            fontSize: "14px",
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-body)",
            opacity: 0.7,
          }}>
            Seus votos foram registrados.
          </p>
        </div>

        {votos.length > 0 && (
          <div style={{
            width: "100%",
            maxWidth: "320px",
            background: "var(--color-surface-1)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-border)",
            overflow: "hidden",
          }}>
            {votos.map((v, i) => {
              const cfg = CATEGORIA_CONFIG[v.categoria] ?? { label: v.categoria, color: "var(--color-text-muted)" };
              return (
                <div
                  key={v.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    boxShadow: i < votos.length - 1 ? "inset 0 -1px 0 rgba(255,255,255,0.05)" : "none",
                  }}
                >
                  <span style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 900,
                    fontSize: "11px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: cfg.color,
                    minWidth: "64px",
                  }}>
                    {cfg.label}
                  </span>
                  <span style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-primary)",
                  }}>
                    {v.votado.apelido}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
