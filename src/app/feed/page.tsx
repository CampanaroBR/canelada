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

  // ── Personagens da Semana: traits mais votados na rodada atual ──
  // Filtro de relevância: líder com ≥40% dos votos do personagem E ≥3 votos.
  const ART_BY_SLUG: Record<string, string> = {
    matador: "/premio/matador.jpg", categoria: "/premio/categoria.jpg", paredao: "/premio/paredao.jpg",
    racudo: "/premio/racudo.jpg", xerife: "/premio/xerife.jpg", garcom: "/premio/garcom.jpg",
    "resenha-forte": "/premio/soresenha.jpg", chorao: "/premio/chorao.jpg", reclamao: "/premio/reclamao.jpg",
    paneleiro: "/premio/paneleiro.jpg", firuleiro: "/premio/firuleiro.jpg", "corpo-mole": "/premio/pregueiro.jpg",
    cone: "/premio/cone.jpg", bagre: "/premio/bagredanoite.jpg",
  };
  type PersonagemSemana = { slug: string; nome: string; emoji: string | null; art: string; vencedor: string; votos: number };
  let personagensSemana: PersonagemSemana[] = [];
  let selecao: (PersonagemSemana | null)[] = [];
  let selecaoPiores: (PersonagemSemana | null)[] = [];
  if (rodadaAtiva) {
    const votosTrait = await prisma.voto.findMany({
      where: { rodadaId: rodadaAtiva.id, categoria: "TRAIT", traitSlug: { not: null } },
      select: { traitSlug: true, votadoId: true },
    });
    const perTrait = new Map<string, { total: number; players: Map<string, number> }>();
    for (const v of votosTrait) {
      const slug = v.traitSlug as string;
      if (!perTrait.has(slug)) perTrait.set(slug, { total: 0, players: new Map() });
      const e = perTrait.get(slug)!;
      e.total++;
      e.players.set(v.votadoId, (e.players.get(v.votadoId) ?? 0) + 1);
    }
    const raw: { slug: string; vencedorId: string; votos: number }[] = [];
    for (const [slug, e] of perTrait) {
      let topId: string | null = null, topN = 0;
      for (const [pid, n] of e.players) if (n > topN) { topN = n; topId = pid; }
      if (topId && topN >= 3 && topN / e.total >= 0.4 && ART_BY_SLUG[slug]) {
        raw.push({ slug, vencedorId: topId, votos: topN });
      }
    }
    raw.sort((a, b) => b.votos - a.votos);

    // Seleção da Rodada: 1 vencedor por posição (CF, mid, mid, mid, GK).
    // Sem filtro estrito (basta ≥1 voto) — é a escalação da rodada.
    const POSITION_TRAITS = ["matador", "categoria", "racudo", "garcom", "paredao"];
    const NEG_TRAITS = ["bagre", "cone", "chorao", "reclamao", "paneleiro"];
    const topPorTrait = (slug: string) => {
      const e = perTrait.get(slug);
      if (!e || e.total === 0) return null;
      let topId: string | null = null, topN = 0;
      for (const [pid, n] of e.players) if (n > topN) { topN = n; topId = pid; }
      return topId ? { slug, vencedorId: topId, votos: topN } : null;
    };
    const selRaw = POSITION_TRAITS.map(topPorTrait);
    const selRawPiores = NEG_TRAITS.map(topPorTrait);

    // Resolve nomes + meta de TODOS (personagens + seleção + piores) numa tacada
    const vIds = [...new Set([
      ...raw.map(r => r.vencedorId),
      ...selRaw.filter(Boolean).map(s => s!.vencedorId),
      ...selRawPiores.filter(Boolean).map(s => s!.vencedorId),
    ])];
    const nmeMap = vIds.length
      ? Object.fromEntries((await prisma.jogador.findMany({ where: { id: { in: vIds } }, select: { id: true, apelido: true } })).map(j => [j.id, j.apelido]))
      : {};
    const tSlugs = [...new Set([...raw.map(r => r.slug), ...POSITION_TRAITS, ...NEG_TRAITS])];
    const tMeta = tSlugs.length
      ? Object.fromEntries((await prisma.trait.findMany({ where: { slug: { in: tSlugs } }, select: { slug: true, nome: true, emoji: true } })).map(t => [t.slug, t]))
      : {};
    personagensSemana = raw.map(r => ({
      slug: r.slug,
      nome: tMeta[r.slug]?.nome ?? r.slug,
      emoji: tMeta[r.slug]?.emoji ?? null,
      art: ART_BY_SLUG[r.slug],
      vencedor: nmeMap[r.vencedorId] ?? "?",
      votos: r.votos,
    }));
    const toSlot = (s: { slug: string; vencedorId: string; votos: number } | null) =>
      s && ART_BY_SLUG[s.slug] ? {
        slug: s.slug,
        nome: tMeta[s.slug]?.nome ?? s.slug,
        emoji: tMeta[s.slug]?.emoji ?? null,
        art: ART_BY_SLUG[s.slug],
        vencedor: nmeMap[s.vencedorId] ?? "?",
        votos: s.votos,
      } : null;
    selecao = selRaw.map(toSlot);
    selecaoPiores = selRawPiores.map(toSlot);
  }

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

  const dataRodada = rodadaAtiva ? (() => {
    const s = new Date(rodadaAtiva.data).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
    return s.charAt(0).toUpperCase() + s.slice(1);
  })() : null;

  const dataCurta = rodadaAtiva
    ? new Date(rodadaAtiva.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
    : null;

  // Regras de horário (derivadas da data do jogo):
  // jogo 20:00 · votação abre 22:30 (mesmo dia) · fecha 15h (dia seguinte)
  const horarioJogo = "20:00";
  const votacao = rodadaAtiva ? (() => {
    const inicio = new Date(rodadaAtiva.data); inicio.setHours(22, 30, 0, 0);
    const fim = new Date(rodadaAtiva.data); fim.setDate(fim.getDate() + 1); fim.setHours(15, 0, 0, 0);
    const agora = new Date();
    if (agora < inicio) return { fase: "antes" as const, aberta: false, texto: "Votação abre às 22:30" };
    if (agora >= fim)   return { fase: "encerrada" as const, aberta: false, texto: "Votação encerrada" };
    return { fase: "aberta" as const, aberta: true, texto: "Votação aberta até às 15h" };
  })() : null;

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
      horarioJogo={horarioJogo}
      votacao={votacao}
      dataCurta={dataCurta}
      jaVotou={jaVotou}
      top5Rodada={top5Rodada}
      maisVotados={maisVotados}
      personagensPorRodada={personagensPorRodada}
      personagensSemana={personagensSemana}
      selecao={selecao}
      selecaoPiores={selecaoPiores}
      conquistas={conquistas}
      datePills={datePills}
      grupoNome={grupoNome}
      proximoBaba={proximoBaba}
      criarRodadaAction={criarRodada}
    />
  );
}
