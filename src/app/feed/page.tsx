import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { criarRodada } from "@/app/votacao/actions";
import { HomeClient } from "./HomeClient";
import { getMedalha } from "@/lib/assets";

export const dynamic = "force-dynamic";

type Jogador = { id: string; apelido: string; foto: string | null };
type MaisVotado = { apelido: string; qtd: number; categoria: string };
type Personagem = { tipo: string; apelido: string; texto: string; data: Date };
type Conquista = { apelido: string; traitSlug: string; traitNome: string; traitEmoji: string | null; traitDesc: string | null; data: Date };

export default async function FeedPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const jogador = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { id: true, grupoId: true, grupo: { select: { nome: true } } },
  });
  if (!jogador) redirect("/onboarding");

  const grupoId = jogador.grupoId;
  const grupoNome = jogador.grupo?.nome ?? "";

  const [rodadaAtiva, topVotadosRaw, recentStories, recentConquistas, allJogadores] = await Promise.all([
    prisma.rodada.findFirst({
      where: { grupoId, encerrada: false },
      select: { id: true, data: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.voto.groupBy({
      by: ["votadoId"],
      where: { rodada: { grupoId }, categoria: "MVP" },
      _count: { votadoId: true },
      orderBy: { _count: { votadoId: "desc" } },
      take: 6,
    }),
    prisma.story.findMany({
      where: { rodada: { grupoId }, tipo: { in: ["MVP", "BAGRE"] } },
      include: { rodada: { select: { data: true } } },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.jogadorTrait.findMany({
      where: { jogador: { grupoId } },
      include: {
        jogador: { select: { apelido: true } },
        trait: { select: { nome: true, emoji: true, descricao: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 3,
    }),
    prisma.jogador.findMany({
      where: { grupoId },
      select: { id: true, apelido: true, foto: true },
    }),
  ]);

  // Resolve mais votados names
  const jogMap = Object.fromEntries(allJogadores.map((j: Jogador) => [j.id, j]));
  const maisVotados: MaisVotado[] = topVotadosRaw.map(v => ({
    apelido: jogMap[v.votadoId]?.apelido ?? "?",
    qtd: v._count.votadoId,
    categoria: "MVP",
  }));

  const personagens: Personagem[] = recentStories.map(s => ({
    tipo: s.tipo,
    apelido: s.texto.split(" ").find(w => /\p{L}/u.test(w)) ?? "?",
    texto: s.texto,
    data: s.rodada.data,
  }));

  const conquistas: Conquista[] = recentConquistas
    .filter(c => getMedalha(c.trait.nome) !== null)
    .map(c => ({
      apelido: c.jogador.apelido,
      traitSlug: c.traitSlug,
      traitNome: c.trait.nome,
      traitEmoji: c.trait.emoji,
      traitDesc: c.trait.descricao ?? null,
      data: c.updatedAt,
    }));

  const jaVotou = rodadaAtiva
    ? !!(await prisma.voto.findFirst({
        where: { rodadaId: rodadaAtiva.id, votanteId: jogador.id },
        select: { id: true },
      }))
    : false;

  const dataRodada = rodadaAtiva
    ? new Date(rodadaAtiva.data).toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" })
    : null;

  // Last 3 rodada dates for filter pills
  const ultimasRodadas = await prisma.rodada.findMany({
    where: { grupoId },
    orderBy: { data: "desc" },
    take: 3,
    select: { data: true },
  });
  const datePills = ultimasRodadas.reverse().map(r =>
    new Date(r.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "")
  );

  return (
    <HomeClient
      IMG={{}}
      rodadaId={rodadaAtiva?.id ?? null}
      dataRodada={dataRodada}
      jaVotou={jaVotou}
      maisVotados={maisVotados}
      personagens={personagens}
      conquistas={conquistas}
      datePills={datePills}
      grupoNome={grupoNome}
      criarRodadaAction={criarRodada}
    />
  );
}
