import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { criarRodada } from "@/app/votacao/actions";
import { badgesHome } from "@/lib/badges";
import { janelaVotacao } from "@/lib/votacaoJanela";
import { pickWinner } from "@/lib/tieBreak";
import { HomeClient } from "./HomeClient";
import { PushAutoEnroll } from "@/components/PushAutoEnroll";
import { InstallPrompt } from "@/components/InstallPrompt";
import { EnableNotificationsPrompt } from "@/components/EnableNotificationsPrompt";

export const dynamic = "force-dynamic";

type MaisVotado = { apelido: string; qtd: number; categoria: string };
type Personagem  = { tipo: string; apelido: string; texto: string; data: Date };
type Conquista   = { apelido: string; traitSlug: string; traitNome: string; traitEmoji: string | null; traitDesc: string | null; data: Date };

export default async function FeedPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const jogador = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { id: true, grupoId: true, role: true, grupo: { select: { nome: true } } },
  });
  if (!jogador) redirect("/onboarding");

  const grupoId = jogador.grupoId;
  const grupoNome = jogador.grupo?.nome ?? "";

  const rodadaAtiva = await prisma.rodada.findFirst({
    where: { grupoId, encerrada: false },
    select: { id: true, data: true, votacaoAberta: true },
    orderBy: { createdAt: "desc" },
  });

  const [recentStories, recentTraits] = await Promise.all([
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

  // maisVotados/maisVotadosPiores são construídos mais abaixo — 1 vencedor
  // por trait (positivo/negativo), cada um com o rótulo certo. Antes vinha de
  // uma query só do trait "categoria" com take:6 rotulando todo mundo "MVP",
  // e ficava restrito aos 5 traits da formação da Seleção (faltava driblador
  // e xerife, que não têm posição no campo mas são traits positivos válidos).
  let maisVotados: MaisVotado[] = [];
  let maisVotadosPiores: MaisVotado[] = [];

  // ── Personagens da Semana: traits mais votados na rodada atual ──
  // Filtro de relevância: líder com ≥40% dos votos do personagem E ≥3 votos.
  const ART_BY_SLUG: Record<string, string> = {
    matador: "/premio/matador.jpg", categoria: "/premio/categoria.jpg", paredao: "/premio/paredao.jpg",
    racudo: "/premio/racudo.jpg", xerife: "/premio/xerife.jpg", garcom: "/premio/garcom.jpg",
    driblador: "/premio/driblador.jpg",
    "resenha-forte": "/premio/soresenha.jpg", delegado: "/premio/delegado.jpg", chorao: "/premio/chorao.jpg", reclamao: "/premio/reclamao.jpg",
    paneleiro: "/premio/paneleiro.jpg", firuleiro: "/premio/firuleiro.jpg",
    pregueiro: "/premio/pregueiro.jpg", "corpo-mole": "/premio/pregueiro.jpg",
    cone: "/premio/cone.jpg", bagre: "/premio/bagredanoite.jpg",
    frangueiro: "/premio/frangueiro.jpg", bragueiro: "/premio/bragueiro.jpg",
  };
  type PersonagemSemana = { slug: string; nome: string; emoji: string | null; descricao: string | null; art: string; vencedor: string; votos: number };
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
      const winner = pickWinner(e.players, `${rodadaAtiva.id}:${slug}`);
      // Relevância: precisa ter arte e pelo menos 1 voto (filtro estrito ≥3+40% pode ser reativado depois)
      if (winner && ART_BY_SLUG[slug]) {
        raw.push({ slug, vencedorId: winner.id, votos: winner.count });
      }
    }
    raw.sort((a, b) => b.votos - a.votos);

    // Seleção da Rodada: 1 vencedor por posição (CF, mid, mid, mid, GK).
    // Sem filtro estrito (basta ≥1 voto) — é a escalação da rodada. Um jogador
    // não pode ocupar 2 posições na mesma escalação — se já foi escalado numa
    // posição anterior, some do pool das seguintes (pega o próximo mais votado).
    const POSITION_TRAITS = ["matador", "categoria", "racudo", "garcom", "paredao"];
    // NEG_TRAITS alimenta a formação fixa de 5 posições da Seleção — não pode
    // crescer sem quebrar o layout. Ranking "Pior da rodada" usa a lista mais
    // ampla NEG_TRAITS_RANKING (abaixo), que inclui frangueiro/bragueiro.
    const NEG_TRAITS = ["bagre", "cone", "chorao", "reclamao", "paneleiro"];
    const NEG_TRAITS_RANKING = [...NEG_TRAITS, "frangueiro", "bragueiro"];
    const topPorTraitSemRepetir = (slugs: string[], usados: Set<string>) => {
      return slugs.map((slug) => {
        const e = perTrait.get(slug);
        if (!e || e.total === 0) return null;
        const disponiveis = new Map([...e.players].filter(([pid]) => !usados.has(pid)));
        const winner = pickWinner(disponiveis, `${rodadaAtiva.id}:${slug}`);
        if (!winner) return null;
        usados.add(winner.id);
        return { slug, vencedorId: winner.id, votos: winner.count };
      });
    };
    // Melhores e piores também não compartilham jogador — quem já ficou numa
    // escalação some do pool da outra (senão a mesma pessoa vira "melhor" e
    // "pior" ao mesmo tempo, o que não faz sentido pro usuário).
    const usadosGeral = new Set<string>();
    const selRaw = topPorTraitSemRepetir(POSITION_TRAITS, usadosGeral);
    const selRawPiores = topPorTraitSemRepetir(NEG_TRAITS, usadosGeral);

    // Resolve nomes + meta de TODOS (personagens + seleção + piores) numa tacada
    const vIds = [...new Set([
      ...raw.map(r => r.vencedorId),
      ...selRaw.filter(Boolean).map(s => s!.vencedorId),
      ...selRawPiores.filter(Boolean).map(s => s!.vencedorId),
    ])];
    const tSlugs = [...new Set([...raw.map(r => r.slug), ...POSITION_TRAITS, ...NEG_TRAITS])];
    // duas buscas independentes → paralelas
    const [nmeRows, tRows] = await Promise.all([
      vIds.length ? prisma.jogador.findMany({ where: { id: { in: vIds } }, select: { id: true, apelido: true } }) : Promise.resolve([]),
      tSlugs.length ? prisma.trait.findMany({ where: { slug: { in: tSlugs } }, select: { slug: true, nome: true, emoji: true, descricao: true } }) : Promise.resolve([]),
    ]);
    const nmeMap = Object.fromEntries(nmeRows.map(j => [j.id, j.apelido]));
    const tMeta = Object.fromEntries(tRows.map(t => [t.slug, t]));
    personagensSemana = raw.map(r => ({
      slug: r.slug,
      nome: tMeta[r.slug]?.nome ?? r.slug,
      emoji: tMeta[r.slug]?.emoji ?? null,
      descricao: tMeta[r.slug]?.descricao ?? null,
      art: ART_BY_SLUG[r.slug],
      vencedor: nmeMap[r.vencedorId] ?? "?",
      votos: r.votos,
    }));
    const toSlot = (s: { slug: string; vencedorId: string; votos: number } | null) =>
      s && ART_BY_SLUG[s.slug] ? {
        slug: s.slug,
        nome: tMeta[s.slug]?.nome ?? s.slug,
        emoji: tMeta[s.slug]?.emoji ?? null,
        descricao: tMeta[s.slug]?.descricao ?? null,
        art: ART_BY_SLUG[s.slug],
        vencedor: nmeMap[s.vencedorId] ?? "?",
        votos: s.votos,
      } : null;
    selecao = selRaw.map(toSlot);
    selecaoPiores = selRawPiores.map(toSlot);

    // Rankings da Home ("Parcial da rodada" / "Pior da rodada"): 1 vencedor
    // por trait, sem exclusão cruzada entre traits (aqui não é formação de
    // time, é lista de conquistas — a mesma pessoa pode liderar mais de um
    // trait). Usa `raw` (todos os traits com arte, já calculado acima) em vez
    // de só os 5 traits da Seleção — senão faltava driblador/xerife, que são
    // positivos mas não têm posição no campo.
    const POSITIVOS_TODOS = ["categoria", "matador", "paredao", "racudo", "xerife", "garcom", "driblador"];
    const toRankingEntry = (r: { slug: string; vencedorId: string; votos: number }): MaisVotado => ({
      apelido: nmeMap[r.vencedorId] ?? "?",
      qtd: r.votos,
      categoria: r.slug === "categoria" ? "MVP" : (tMeta[r.slug]?.nome ?? r.slug).toUpperCase(),
    });
    maisVotados = raw.filter(r => POSITIVOS_TODOS.includes(r.slug)).map(toRankingEntry).sort((a, b) => b.qtd - a.qtd);
    maisVotadosPiores = raw.filter(r => NEG_TRAITS_RANKING.includes(r.slug)).map(toRankingEntry).sort((a, b) => b.qtd - a.qtd);
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

  // Badges reais do grupo (mesma engine da página de medalhas) — quem desbloqueou na última rodada.
  // Resiliente: se falhar, a home carrega sem o card em vez de quebrar a página toda.
  const badgesFallback: { jogadoresComBadge: number; totalJogadores: number; novas: { apelido: string; slug: string; nome: string }[] } =
    { jogadoresComBadge: 0, totalJogadores: 0, novas: [] };

  // 4 consultas independentes em paralelo (badges do grupo, meu voto, top5, rodadas recentes)
  const [badgesGrupo, jaVotou, top5VotosRaw, rodadasRecentes] = await Promise.all([
    badgesHome(grupoId).catch((e) => { console.error("badgesHome falhou:", e); return badgesFallback; }),
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
    prisma.rodada.findMany({
      where: { grupoId },
      orderBy: { data: "desc" },
      take: 3,
      select: { data: true },
    }),
  ]);

  const conquistas: Conquista[] = badgesGrupo.novas.map(n => ({
    apelido: n.apelido,
    traitSlug: n.slug,
    traitNome: n.nome,
    traitEmoji: null,
    traitDesc: "Nova conquista desbloqueada!",
    data: new Date(),
  }));

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
    const { abre, fecha } = janelaVotacao(rodadaAtiva.data);
    const agora = new Date();
    // votacaoAberta=true (setado pelo cron ou manualmente) sempre vence a janela
    // calculada — evita esse widget divergir de /votacao, que já respeita a flag.
    if (rodadaAtiva.votacaoAberta) return { fase: "aberta" as const, aberta: true, texto: "Votação aberta até às 15h" };
    if (agora < abre)   return { fase: "antes" as const, aberta: false, texto: "Votação abre às 22:30" };
    if (agora >= fecha) return { fase: "encerrada" as const, aberta: false, texto: "Votação encerrada" };
    return { fase: "aberta" as const, aberta: true, texto: "Votação aberta até às 15h" };
  })() : null;

  // Tabs de datas da Personagem da Semana: últimas 3 rodadas (asc → última = ativa)
  const datePills = rodadasRecentes
    .slice()
    .reverse()
    .map(r => new Date(r.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", ""));

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
    <>
    <PushAutoEnroll />
    <InstallPrompt />
    <EnableNotificationsPrompt />
    <HomeClient
      isSuperAdmin={jogador.role === "SUPER_ADMIN"}
      rodadaId={rodadaAtiva?.id ?? null}
      dataRodada={dataRodada}
      horarioJogo={horarioJogo}
      votacao={votacao}
      dataCurta={dataCurta}
      jaVotou={jaVotou}
      top5Rodada={top5Rodada}
      maisVotados={maisVotados}
      maisVotadosPiores={maisVotadosPiores}
      personagensPorRodada={personagensPorRodada}
      personagensSemana={personagensSemana}
      selecao={selecao}
      selecaoPiores={selecaoPiores}
      conquistas={conquistas}
      badgesGrupo={{ comBadge: badgesGrupo.jogadoresComBadge, total: badgesGrupo.totalJogadores }}
      datePills={datePills}
      grupoNome={grupoNome}
      proximoBaba={proximoBaba}
      criarRodadaAction={criarRodada}
    />
    </>
  );
}
