import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BottomNav } from "@/components/layout/BottomNav";
import { RankingTabs, type RankingEntry, type RankingData } from "./RankingTabs";

export const dynamic = "force-dynamic";

async function getCategoryRanking(categoria: string, grupoId: string): Promise<RankingEntry[]> {
  const votos = await prisma.voto.findMany({
    where: {
      categoria: categoria as "MVP" | "BAGRE" | "RACUDO" | "RESENHA",
      rodada: { grupoId },
    },
    select: {
      votadoId: true,
      votado: { select: { apelido: true } },
    },
  });

  const counts = new Map<string, { apelido: string; count: number }>();
  for (const v of votos) {
    const ex = counts.get(v.votadoId);
    if (ex) ex.count++;
    else counts.set(v.votadoId, { apelido: v.votado.apelido, count: 1 });
  }

  return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 10);
}

export default async function RankingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const jogador = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { grupoId: true, apelido: true, grupo: { select: { nome: true } } },
  });
  if (!jogador) redirect("/onboarding");

  const [mvp, bagre, racudo, resenha] = await Promise.all([
    getCategoryRanking("MVP", jogador.grupoId),
    getCategoryRanking("BAGRE", jogador.grupoId),
    getCategoryRanking("RACUDO", jogador.grupoId),
    getCategoryRanking("RESENHA", jogador.grupoId),
  ]);

  const data: RankingData = { MVP: mvp, BAGRE: bagre, RACUDO: racudo, RESENHA: resenha };

  return (
    <div style={{ minHeight: "100dvh", background: "#090909", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 20px)",
        padding: "calc(env(safe-area-inset-top, 0px) + 20px) 20px 20px",
        display: "flex", flexDirection: "column", gap: 2,
      }}>
        <div style={{
          fontFamily: "var(--font-body)", fontWeight: 600,
          fontSize: 12, letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.3)",
        }}>
          {jogador.grupo.nome}
        </div>
        <h1 style={{
          margin: 0,
          fontFamily: "var(--font-display)", fontWeight: 900,
          fontSize: 48, lineHeight: 0.9,
          letterSpacing: "-0.02em", textTransform: "uppercase",
          color: "#fff",
        }}>
          Ranking
        </h1>
        <div style={{
          fontFamily: "var(--font-body)", fontWeight: 500,
          fontSize: 14, color: "rgba(255,255,255,0.3)",
          marginTop: 4,
        }}>
          Histórico de votos acumulados
        </div>
      </div>

      <main style={{
        flex: 1,
        paddingBottom: "calc(88px + env(safe-area-inset-bottom, 0px))",
      }}>
        <RankingTabs data={data} meuApelido={jogador.apelido} />
      </main>

      <BottomNav />
    </div>
  );
}
