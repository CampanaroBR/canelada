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

  const [rodadaAtiva, topTraitsRaw, recentStories, recentTraits] = await Promise.all([
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
    // Personagem da semana: stories MVP/BAGRE agrupados por rodada
    prisma.story.findMany({
      where: { rodada: { grupoId }, tipo: { in: ["MVP", "BAGRE"] } },
      include: { rodada: { select: { id: true, data: true } } },
      orderBy: { createdAt: "desc" },
      take: 30,
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

  // Agrupa personagens por rodada
  const gruposMap = new Map<string, { data: Date; personagens: Personagem[] }>();
  for (const s of recentStories) {
    if (!gruposMap.has(s.rodada.id)) {
      gruposMap.set(s.rodada.id, { data: s.rodada.data, personagens: [] });
    }
    gruposMap.get(s.rodada.id)!.personagens.push({
      tipo: s.tipo,
      apelido: s.texto.split(" ").find(w => /\p{L}/u.test(w)) ?? "?",
      texto: s.texto,
      data: s.rodada.data,
    });
  }

  // Ordena por data asc (rodada mais recente fica por último = pill ativa) e pega as últimas 3
  let grupos = [...gruposMap.values()]
    .sort((a, b) => a.data.getTime() - b.data.getTime())
    .slice(-3);

  // Fallback: se não há stories, monta um único grupo com os top traits
  if (grupos.length === 0 && recentTraits.length > 0) {
    grupos = [{
      data: recentTraits[0].updatedAt,
      personagens: recentTraits.slice(0, 3).map((jt, i) => ({
        tipo: i === 0 ? "MVP" : i === 1 ? "BAGRE" : "RACUDO",
        apelido: jt.jogador.apelido,
        texto: `${jt.jogador.apelido} foi o ${PERSONAGEM_TITLES[i === 0 ? "MVP" : i === 1 ? "BAGRE" : "RACUDO"]}`,
        data: jt.updatedAt,
      })),
    }];
  }

  const personagensPorRodada: Personagem[][] = grupos.map(g => g.personagens);

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

  const datePills = grupos.map(g =>
    new Date(g.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "")
  );

  // Próximo baba card
  const proximoBaba = rodadaAtiva ? (() => {
    const d = new Date(rodadaAtiva.data);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    const diasRestantes = Math.ceil((d.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    const dataFormatada = new Date(rodadaAtiva.data).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "short" });
    const hora = "20:00";
    return { dataFormatada, hora, diasRestantes };
  })() : null;

  return (
    <HomeClient
      IMG={{}}
      rodadaId={rodadaAtiva?.id ?? null}
      dataRodada={dataRodada}
      jaVotou={jaVotou}
      top5Rodada={top5Rodada}
      maisVotados={maisVotados}
      personagensPorRodada={personagensPorRodada}
      conquistas={conquistas}
      datePills={datePills}
      grupoNome={grupoNome}
      proximoBaba={proximoBaba}
      criarRodadaAction={criarRodada}
    />
  );
}
