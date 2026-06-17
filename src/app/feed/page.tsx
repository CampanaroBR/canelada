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

  const [rodadaAtiva, topTraitsRaw, recentStories, recentTraits, ultimasRodadas] = await Promise.all([
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
    // Personagem da semana: stories MVP/BAGRE mais recentes
    prisma.story.findMany({
      where: { rodada: { grupoId }, tipo: { in: ["MVP", "BAGRE"] } },
      include: { rodada: { select: { data: true } } },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    // Medalhas: traits mais recentes dos jogadores do grupo
    prisma.jogadorTrait.findMany({
      where: { jogador: { grupoId } },
      include: {
        jogador: { select: { apelido: true } },
        trait: { select: { nome: true, emoji: true, descricao: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 3,
    }),
    prisma.rodada.findMany({
      where: { grupoId },
      orderBy: { data: "desc" },
      take: 3,
      select: { data: true },
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

  const PERSONAGEM_TITLES: Record<string, string> = {
    MVP:    "MATADOR",
    BAGRE:  "BAGRE DA NOITE",
    RACUDO: "PREGUEIRO",
  };

  const personagens: Personagem[] = recentStories.map(s => ({
    tipo: s.tipo,
    apelido: s.texto.split(" ").find(w => /\p{L}/u.test(w)) ?? "?",
    texto: s.texto,
    data: s.rodada.data,
  }));

  // Fallback: se não há stories, monta personagens dos top traits
  const personagensFinal: Personagem[] = personagens.length > 0
    ? personagens
    : recentTraits.slice(0, 3).map((jt, i) => ({
        tipo: i === 0 ? "MVP" : i === 1 ? "BAGRE" : "RACUDO",
        apelido: jt.jogador.apelido,
        texto: `${jt.jogador.apelido} foi o ${PERSONAGEM_TITLES[i === 0 ? "MVP" : i === 1 ? "BAGRE" : "RACUDO"]}`,
        data: jt.updatedAt,
      }));

  const conquistas: Conquista[] = recentTraits.map(c => ({
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
      personagens={personagensFinal}
      conquistas={conquistas}
      datePills={datePills}
      grupoNome={grupoNome}
      criarRodadaAction={criarRodada}
    />
  );
}
