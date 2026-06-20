import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MedalhasClient } from "./MedalhasClient";

export const dynamic = "force-dynamic";

export default async function MedalhasPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const jogador = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { id: true, grupoId: true },
  });
  if (!jogador) redirect("/onboarding");

  // Todos os JogadorTrait do jogador atual
  const jogadorTraits = await prisma.jogadorTrait.findMany({
    where: { jogadorId: jogador.id },
    include: { trait: { select: { nome: true, descricao: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const unlockedSlugs = new Set(jogadorTraits.map(jt => jt.traitSlug));

  const lastConquista = jogadorTraits[0] ?? null;

  // ── Progresso de gamificação por badge ──
  // Métricas reais do jogador a partir de votos recebidos/emitidos.
  const [recebidos, rodadasPart] = await Promise.all([
    prisma.voto.groupBy({
      by: ["categoria"],
      where: { votadoId: jogador.id },
      _count: { _all: true },
    }),
    prisma.voto.findMany({
      where: { votanteId: jogador.id },
      select: { rodadaId: true },
      distinct: ["rodadaId"],
    }),
  ]);

  const cnt: Record<string, number> = Object.fromEntries(
    recebidos.map(r => [r.categoria, r._count._all])
  );
  const metricValue: Record<string, number> = {
    rodadas:   rodadasPart.length,
    mvp:       cnt.MVP ?? 0,
    racudo:    cnt.RACUDO ?? 0,
    social:    (cnt.RESENHA ?? 0) + (cnt.TRAIT ?? 0),
    positivos: (cnt.MVP ?? 0) + (cnt.RACUDO ?? 0) + (cnt.RESENHA ?? 0) + (cnt.TRAIT ?? 0),
    badges:    unlockedSlugs.size,
  };

  // slug → métrica + alvo (derivado da regra de cada conquista)
  const BADGE_META: Record<string, { metric: string; meta: number }> = {
    "primeiro-baba":    { metric: "rodadas", meta: 1 },
    "veterano":         { metric: "rodadas", meta: 10 },
    "casca-grossa":     { metric: "rodadas", meta: 25 },
    "hall-da-fama":     { metric: "rodadas", meta: 50 },
    "lenda-do-baba":    { metric: "rodadas", meta: 100 },
    "mvp":              { metric: "mvp", meta: 1 },
    "rei-absoluto":     { metric: "mvp", meta: 5 },
    "craque-da-galera": { metric: "mvp", meta: 10 },
    "craque-historico": { metric: "mvp", meta: 20 },
    "em-chamas":        { metric: "positivos", meta: 3 },
    "imparavel":        { metric: "positivos", meta: 5 },
    "consistente":      { metric: "rodadas", meta: 8 },
    "operario":         { metric: "racudo", meta: 5 },
    "resenha-forte":    { metric: "social", meta: 20 },
    "querido-da-galera":{ metric: "positivos", meta: 50 },
    "colecionador":     { metric: "badges", meta: 8 },
    "mestre-da-resenha":{ metric: "badges", meta: 16 },
    "completo":         { metric: "badges", meta: 24 },
  };

  const progress: Record<string, { current: number; meta: number }> = {};
  for (const [slug, m] of Object.entries(BADGE_META)) {
    progress[slug] = { current: metricValue[m.metric] ?? 0, meta: m.meta };
  }

  return (
    <MedalhasClient
      unlockedSlugs={[...unlockedSlugs]}
      progress={progress}
      lastConquista={lastConquista ? {
        slug: lastConquista.traitSlug,
        nome: lastConquista.trait.nome,
        descricao: lastConquista.trait.descricao ?? "",
      } : null}
    />
  );
}
