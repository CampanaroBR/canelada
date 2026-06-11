import { prisma } from "./prisma";
import { CategoriaVoto, StoryTipo } from "@prisma/client";

export async function gerarStories(rodadaId: string): Promise<void> {
  const votos = await prisma.voto.findMany({
    where: { rodadaId },
    select: {
      categoria: true,
      votadoId: true,
      traitSlug: true,
      votado: { select: { id: true, apelido: true } },
    },
  });

  if (votos.length === 0) return;

  // Tally votes per category per player
  const tallies = new Map<string, Map<string, number>>();
  for (const v of votos) {
    if (!tallies.has(v.categoria)) tallies.set(v.categoria, new Map());
    const m = tallies.get(v.categoria)!;
    m.set(v.votadoId, (m.get(v.votadoId) ?? 0) + 1);
  }

  const getWinner = (cat: CategoriaVoto) => {
    const m = tallies.get(cat);
    if (!m || m.size === 0) return null;
    const [winnerId, count] = [...m.entries()].sort(([, a], [, b]) => b - a)[0];
    const apelido = votos.find((v) => v.votadoId === winnerId)?.votado.apelido ?? "";
    return { apelido, count };
  };

  const stories: { rodadaId: string; tipo: StoryTipo; texto: string }[] = [];

  const mvp = getWinner(CategoriaVoto.MVP);
  if (mvp) {
    stories.push({
      rodadaId,
      tipo: StoryTipo.MVP,
      texto: `🏆 ${mvp.apelido} foi o CRAQUE DA RODADA com ${mvp.count} voto${mvp.count > 1 ? "s" : ""}!`,
    });
  }

  const bagre = getWinner(CategoriaVoto.BAGRE);
  if (bagre) {
    stories.push({
      rodadaId,
      tipo: StoryTipo.BAGRE,
      texto: `🐟 ${bagre.apelido} levou o BAGRE com ${bagre.count} voto${bagre.count > 1 ? "s" : ""}. Melhor na próxima!`,
    });
  }

  // Trait stories — aggregate by (votadoId, traitSlug)
  const traitVotos = votos.filter((v) => v.categoria === CategoriaVoto.TRAIT && v.traitSlug);
  const traitAgg = new Map<string, { apelido: string; traitSlug: string; count: number }>();
  for (const v of traitVotos) {
    const key = `${v.votadoId}:${v.traitSlug}`;
    const ex = traitAgg.get(key);
    if (ex) ex.count++;
    else traitAgg.set(key, { apelido: v.votado.apelido, traitSlug: v.traitSlug!, count: 1 });
  }
  if (traitAgg.size > 0) {
    const slugs = [...new Set(traitVotos.map((v) => v.traitSlug!))];
    const traits = await prisma.trait.findMany({
      where: { slug: { in: slugs } },
      select: { slug: true, nome: true, emoji: true },
    });
    const traitMap = new Map(traits.map((t) => [t.slug, t]));
    for (const { apelido, traitSlug, count } of traitAgg.values()) {
      const trait = traitMap.get(traitSlug);
      if (trait) {
        stories.push({
          rodadaId,
          tipo: StoryTipo.TRAIT_CONQUISTADA,
          texto: `${trait.emoji ?? "⭐"} ${apelido} conquistou a trait "${trait.nome}"${count > 1 ? ` (${count} votos!)` : "!"}`,
        });
      }
    }
  }

  // SELECAO — top 5 players by total votes (excluding TRAIT)
  const playerTotals = new Map<string, { apelido: string; total: number }>();
  for (const v of votos) {
    if (v.categoria === CategoriaVoto.TRAIT) continue;
    const ex = playerTotals.get(v.votadoId);
    if (ex) ex.total++;
    else playerTotals.set(v.votadoId, { apelido: v.votado.apelido, total: 1 });
  }
  const top5 = [...playerTotals.values()].sort((a, b) => b.total - a.total).slice(0, 5);
  if (top5.length >= 2) {
    stories.push({
      rodadaId,
      tipo: StoryTipo.SELECAO,
      texto: `⭐ Seleção: ${top5.map((p) => p.apelido).join(" · ")}`,
    });
  }

  if (stories.length === 0) return;

  await prisma.$transaction([
    prisma.story.deleteMany({ where: { rodadaId } }),
    prisma.story.createMany({ data: stories }),
  ]);
}
