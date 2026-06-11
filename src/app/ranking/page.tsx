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
    select: { grupoId: true },
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
      }}>
        <span style={{
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: "20px",
          letterSpacing: "0.08em",
          color: "var(--color-accent)",
          textTransform: "uppercase",
        }}>
          RANKING
        </span>
      </header>

      <main style={{
        flex: 1,
        paddingBottom: "calc(72px + env(safe-area-inset-bottom, 0px))",
      }}>
        <RankingTabs data={data} />
      </main>

      <BottomNav />
    </div>
  );
}
