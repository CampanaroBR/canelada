import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { criarRodada } from "@/app/votacao/actions";
import { HomeClient } from "./HomeClient";

export const dynamic = "force-dynamic";

type MaisVotado = { apelido: string; qtd: number; categoria: string };
type Personagem  = { tipo: string; apelido: string; texto: string; data: Date };
type Conquista   = { apelido: string; traitSlug: string; traitNome: string; traitEmoji: string | null; traitDesc: string | null; data: Date };

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

  const [rodadaAtiva, topTraitsRaw, recentTraits, rodadasComStories] = await Promise.all([
    prisma.rodada.findFirst({
      where: { grupoId, encerrada: false },
      select: { id: true, data: true },
      orderBy: { createdAt: "desc" },
    }),
    // Mais votados: top jogadores por total de traits recebidos
    prisma.jogadorTrait.groupBy({
      by: ["jogadorId"],
      where: { jogador: { grupoId } },
      _sum: { contador: true },
      orderBy: { _sum: { contador: "desc" } },
      take: 6,
    }),
    // Medalhas: só traits que têm badge SVG própria (conquistas, não votação)
    prisma.jogadorTrait.findMany({
      where: {
        jogador: { grupoId },
        traitSlug: { in: [
          "alma-do-grupo", "completo", "consistente", "em-chamas", "invicto",
          "irregular", "jogador-invisivel", "lanterna", "lenda", "ma-fase",
          "mais-presente", "primeira-vitoria", "racudo-do-mes", "rei-absoluto",
          "rei-do-mes", "so-perde", "trofeu-bagre", "veterano", "virada-de-chave",
        ]},
      },
      include: {
        jogador: { select: { apelido: true } },
        trait: { select: { nome: true, emoji: true, descricao: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 3,
    }),
    // Rodadas com personagens: busca até 10 rodadas com suas stories MVP/BAGRE
    prisma.rodada.findMany({
      where: { grupoId },
      orderBy: { data: "desc" },
      take: 10,
      select: {
        id: true,
        data: true,
        stories: {
          where: { tipo: { in: ["MVP", "BAGRE"] } },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
  ]);

  // Resolve nomes dos mais votados por trait
  const jogadoresIds = topTraitsRaw.map(t => t.jogadorId);
  const jogadoresMap = jogadoresIds.length > 0
    ? await prisma.jogador.findMany({
        where: { id: { in: jogadoresIds } },
        select: { id: true, apelido: true },
      }).then(jogs => Object.fromEntries(jogs.map(j => [j.id, j.apelido])))
    : {};

  const maisVotados: MaisVotado[] = topTraitsRaw.map(t => ({
    apelido: jogadoresMap[t.jogadorId] ?? "?",
    qtd: t._sum.contador ?? 0,
    categoria: "MVP",
  }));

  // Monta rodadas com personagens (pills + filtro)
  const rodadas = rodadasComStories
    .filter(r => r.stories.length > 0)
    .reverse()
    .map(r => ({
      id: r.id,
      label: new Date(r.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", ""),
      personagens: r.stories.map(s => ({
        tipo: s.tipo,
        apelido: s.texto.split(" ").find((w: string) => /\p{L}/u.test(w)) ?? "?",
        texto: s.texto,
        data: r.data,
      } as Personagem)),
    }));

  const conquistas: Conquista[] = recentTraits.map(c => ({
    apelido: c.jogador.apelido,
    traitSlug: c.traitSlug,
    traitNome: c.trait.nome,
    traitEmoji: c.trait.emoji,
    traitDesc: c.trait.descricao ?? null,
    data: c.updatedAt,
  }));

  const [jaVotou, top5VotosRaw] = await Promise.all([
    rodadaAtiva
      ? prisma.voto.findFirst({
          where: { rodadaId: rodadaAtiva.id, votanteId: jogador.id },
          select: { id: true },
        }).then(r => !!r)
      : Promise.resolve(false),
    rodadaAtiva
      ? prisma.voto.groupBy({
          by: ["votadoId"],
          where: { rodadaId: rodadaAtiva.id },
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
          take: 5,
        })
      : Promise.resolve([]),
  ]);

  // Resolve nomes dos top5 da rodada
  const top5Ids = top5VotosRaw.map((v: { votadoId: string }) => v.votadoId);
  const top5Jogadores = top5Ids.length > 0
    ? await prisma.jogador.findMany({
        where: { id: { in: top5Ids } },
        select: { id: true, apelido: true },
      })
    : [];
  const top5Map = Object.fromEntries(top5Jogadores.map(j => [j.id, j.apelido]));
  const top5Rodada = top5Ids.map((id: string) => (top5Map[id] ?? "?").toUpperCase());

  const dataRodada = rodadaAtiva
    ? new Date(rodadaAtiva.data).toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" })
    : null;

  return (
    <HomeClient
      IMG={{}}
      rodadaId={rodadaAtiva?.id ?? null}
      dataRodada={dataRodada}
      jaVotou={jaVotou}
      top5Rodada={top5Rodada}
      maisVotados={maisVotados}
      rodadas={rodadas}
      conquistas={conquistas}
      grupoNome={grupoNome}
      criarRodadaAction={criarRodada}
    />
  );
}
