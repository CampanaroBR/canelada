import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { criarRodada } from "@/app/votacao/actions";
import { badgesHome } from "@/lib/badges";
import { janelaVotacao, votacaoEncerrada } from "@/lib/votacaoJanela";
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

  // Fallback de resiliência: o cron de encerrar-votacao pode falhar em silêncio
  // (já aconteceu — zero invocações num dia inteiro) e deixar uma rodada aberta
  // muito depois da janela real ter fechado. Corrige o flag aqui, na carga do
  // feed, sem depender só do cron pra fechar a rodada.
  const abertasDoGrupo = await prisma.rodada.findMany({
    where: { grupoId, encerrada: false },
    select: { id: true, data: true },
  });
  const idsParaFechar = abertasDoGrupo.filter((r) => votacaoEncerrada(r.data)).map((r) => r.id);
  if (idsParaFechar.length > 0) {
    await prisma.rodada.updateMany({ where: { id: { in: idsParaFechar } }, data: { encerrada: true } });
  }

  const rodadaAtiva = await prisma.rodada.findFirst({
    where: { grupoId, encerrada: false },
    select: { id: true, data: true, votacaoAberta: true },
    orderBy: { createdAt: "desc" },
  });

  // Quantos jogaram a rodada mas ainda não votaram — usado no botão de cobrança
  // no WhatsApp (só o número, sem citar nomes). Só quem estava presente conta:
  // quem não jogou nem consegue votar, então não é "atraso".
  let faltamVotar = 0;
  if (rodadaAtiva) {
    const [totalPresentes, jaVotaram] = await Promise.all([
      prisma.jogador.count({
        where: { grupoId, rodadasPresente: { some: { id: rodadaAtiva.id } } },
      }),
      prisma.voto.findMany({
        where: { rodadaId: rodadaAtiva.id },
        select: { votanteId: true },
        distinct: ["votanteId"],
      }),
    ]);
    faltamVotar = Math.max(0, totalPresentes - jaVotaram.length);
  }

  const [recentStories, recentTraits, rodadasRecentes] = await Promise.all([
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
    // Últimas 3 rodadas do grupo (id + data) — base das tabs de data do card
    // "Personagem da semana" (cada pill precisa buscar os votos DAQUELA
    // rodada, não só repetir a atual).
    prisma.rodada.findMany({
      where: { grupoId },
      orderBy: { data: "desc" },
      take: 3,
      select: { id: true, data: true },
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
    driblador: "/premio/driblador.jpg", "gol-mais-bonito": "/premio/gol-mais-bonito.jpg",
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

    // Seleção da Rodada: 5 jogadores por placar ponderado (peso do trait × nº
    // de votos, somado entre TODOS os traits do mesmo lado que receberam),
    // não mais "1 vencedor por trait fixo". Pesos definidos junto com o
    // usuário — 3 = decide o jogo sozinho, 2 = impacto real, 1 = mais
    // estilo/comportamento que resultado.
    const POSITIVO_ATIVOS = ["categoria", "matador", "paredao", "xerife", "garcom", "driblador", "gol-mais-bonito"];
    const NEGATIVO_ATIVOS = ["bagre", "frangueiro", "bragueiro", "reclamao", "pregueiro", "paneleiro"];
    const pesoRows = await prisma.trait.findMany({
      where: { slug: { in: [...POSITIVO_ATIVOS, ...NEGATIVO_ATIVOS] } },
      select: { slug: true, peso: true },
    });
    const pesoMap = Object.fromEntries(pesoRows.map(t => [t.slug, t.peso]));

    type ScoreEntry = { score: number; totalVotos: number; bestSlug: string; bestVotos: number };
    const buildScores = (slugs: string[]) => {
      const scores = new Map<string, ScoreEntry>();
      for (const slug of slugs) {
        const e = perTrait.get(slug);
        if (!e) continue;
        const peso = pesoMap[slug] ?? 1;
        for (const [pid, count] of e.players) {
          const cur = scores.get(pid) ?? { score: 0, totalVotos: 0, bestSlug: slug, bestVotos: 0 };
          cur.score += peso * count;
          cur.totalVotos += count;
          if (count > cur.bestVotos) { cur.bestVotos = count; cur.bestSlug = slug; }
          scores.set(pid, cur);
        }
      }
      return scores;
    };
    const scoresPositivo = buildScores(POSITIVO_ATIVOS);
    const scoresNegativo = buildScores(NEGATIVO_ATIVOS);

    // Um jogador só pode estar de um lado: se o score positivo dele é maior
    // que o negativo, vai pros melhores — senão vai pros piores. Sem essa
    // regra, alguém com 1 voto pequeno de trait positivo entrava nos
    // melhores e "sumia" do pool dos piores mesmo tendo um score negativo
    // MUITO maior (ex.: 8 votos de Frangueiro/Bagre) — resultado contrário
    // ao que a pontuação deveria mostrar.
    const ladoPositivo = new Set<string>();
    const ladoNegativo = new Set<string>();
    for (const [pid, e] of scoresPositivo) {
      const neg = scoresNegativo.get(pid);
      if (!neg || e.score >= neg.score) ladoPositivo.add(pid);
    }
    for (const [pid, e] of scoresNegativo) {
      if (!ladoPositivo.has(pid)) ladoNegativo.add(pid);
      else {
        const pos = scoresPositivo.get(pid)!;
        if (e.score > pos.score) { ladoPositivo.delete(pid); ladoNegativo.add(pid); }
      }
    }

    // GK: vaga fixa pro trait específico de goleiro (Paredão pros melhores,
    // Frangueiro pros piores) — não pode ser "o 5º com mais pontos" genérico,
    // senão a camisa vermelha de goleiro aparece em quem nem foi votado como
    // tal. Sem ninguém com voto nesse trait, a vaga fica vazia (sem GK).
    const pickGK = (traitSlug: string, lado: Set<string>) => {
      const e = perTrait.get(traitSlug);
      if (!e) return null;
      const peso = pesoMap[traitSlug] ?? 1;
      let best: { pid: string; score: number; votos: number } | null = null;
      for (const [pid, count] of e.players) {
        if (!lado.has(pid)) continue;
        const score = peso * count;
        if (!best || score > best.score || (score === best.score && pid.localeCompare(best.pid) < 0)) {
          best = { pid, score, votos: count };
        }
      }
      return best;
    };
    const topJogadores = (scores: Map<string, ScoreEntry>, lado: Set<string>, n: number, excluir: Set<string>) => {
      const ranked = [...scores.entries()]
        .filter(([pid]) => lado.has(pid) && !excluir.has(pid))
        .sort((a, b) => b[1].score - a[1].score || b[1].totalVotos - a[1].totalVotos || a[0].localeCompare(b[0]))
        .slice(0, n);
      const out: ({ slug: string; vencedorId: string; votos: number } | null)[] = ranked.map(([pid, e]) => (
        { slug: e.bestSlug, vencedorId: pid, votos: e.totalVotos }
      ));
      while (out.length < n) out.push(null);
      return out;
    };

    const usadosMelhores = new Set<string>();
    const gkMelhores = pickGK("paredao", ladoPositivo);
    if (gkMelhores) usadosMelhores.add(gkMelhores.pid);
    const linhaMelhores = topJogadores(scoresPositivo, ladoPositivo, 4, usadosMelhores);
    const selRaw = [
      ...linhaMelhores,
      gkMelhores ? { slug: "paredao", vencedorId: gkMelhores.pid, votos: gkMelhores.votos } : null,
    ];

    const usadosPiores = new Set<string>();
    const gkPiores = pickGK("frangueiro", ladoNegativo);
    if (gkPiores) usadosPiores.add(gkPiores.pid);
    const linhaPiores = topJogadores(scoresNegativo, ladoNegativo, 4, usadosPiores);
    const selRawPiores = [
      ...linhaPiores,
      gkPiores ? { slug: "frangueiro", vencedorId: gkPiores.pid, votos: gkPiores.votos } : null,
    ];

    // Resolve nomes + meta de TODOS (personagens + seleção + piores) numa tacada
    const vIds = [...new Set([
      ...raw.map(r => r.vencedorId),
      ...selRaw.filter(Boolean).map(s => s!.vencedorId),
      ...selRawPiores.filter(Boolean).map(s => s!.vencedorId),
    ])];
    const tSlugs = [...new Set([...raw.map(r => r.slug), ...POSITIVO_ATIVOS, ...NEGATIVO_ATIVOS])];
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
    // trait). Mesmo conjunto de traits ativos usado no placar da Seleção
    // (POSITIVO_ATIVOS/NEGATIVO_ATIVOS), pra não faltar nenhum trait votável.
    const toRankingEntry = (r: { slug: string; vencedorId: string; votos: number }): MaisVotado => ({
      apelido: nmeMap[r.vencedorId] ?? "?",
      qtd: r.votos,
      categoria: r.slug === "categoria" ? "MVP" : (tMeta[r.slug]?.nome ?? r.slug).toUpperCase(),
    });
    maisVotados = raw.filter(r => POSITIVO_ATIVOS.includes(r.slug)).map(toRankingEntry).sort((a, b) => b.qtd - a.qtd);
    maisVotadosPiores = raw.filter(r => NEGATIVO_ATIVOS.includes(r.slug)).map(toRankingEntry).sort((a, b) => b.qtd - a.qtd);
  }

  // ── Personagem da semana por rodada (tabs de data) ──
  // As tabs de data eram só decorativas — sempre mostravam a rodada atual,
  // não importa qual pill estivesse marcada como ativa. Aqui calcula os
  // personagens votados em CADA uma das outras rodadas recentes (a atual já
  // foi calculada acima como `personagensSemana`), pra cada pill mostrar os
  // dados de verdade da rodada que representa.
  const outrasRodadas = rodadasRecentes.filter(r => r.id !== rodadaAtiva?.id);
  const personagensSemanaOutras = new Map<string, PersonagemSemana[]>();
  if (outrasRodadas.length > 0) {
    const votosOutras = await prisma.voto.findMany({
      where: { rodadaId: { in: outrasRodadas.map(r => r.id) }, categoria: "TRAIT", traitSlug: { not: null } },
      select: { rodadaId: true, traitSlug: true, votadoId: true },
    });
    const perRodada = new Map<string, Map<string, { players: Map<string, number> }>>();
    for (const v of votosOutras) {
      const slug = v.traitSlug as string;
      if (!perRodada.has(v.rodadaId)) perRodada.set(v.rodadaId, new Map());
      const perTraitR = perRodada.get(v.rodadaId)!;
      if (!perTraitR.has(slug)) perTraitR.set(slug, { players: new Map() });
      const e = perTraitR.get(slug)!;
      e.players.set(v.votadoId, (e.players.get(v.votadoId) ?? 0) + 1);
    }

    const rawPorRodada = new Map<string, { slug: string; vencedorId: string; votos: number }[]>();
    for (const r of outrasRodadas) {
      const perTraitR = perRodada.get(r.id);
      const rawR: { slug: string; vencedorId: string; votos: number }[] = [];
      if (perTraitR) {
        for (const [slug, e] of perTraitR) {
          const winner = pickWinner(e.players, `${r.id}:${slug}`);
          if (winner && ART_BY_SLUG[slug]) rawR.push({ slug, vencedorId: winner.id, votos: winner.count });
        }
      }
      rawR.sort((a, b) => b.votos - a.votos);
      rawPorRodada.set(r.id, rawR);
    }

    const vIds2 = [...new Set([...rawPorRodada.values()].flat().map(r => r.vencedorId))];
    const tSlugs2 = [...new Set([...rawPorRodada.values()].flat().map(r => r.slug))];
    const [nmeRows2, tRows2] = await Promise.all([
      vIds2.length ? prisma.jogador.findMany({ where: { id: { in: vIds2 } }, select: { id: true, apelido: true } }) : Promise.resolve([]),
      tSlugs2.length ? prisma.trait.findMany({ where: { slug: { in: tSlugs2 } }, select: { slug: true, nome: true, emoji: true, descricao: true } }) : Promise.resolve([]),
    ]);
    const nmeMap2 = Object.fromEntries(nmeRows2.map(j => [j.id, j.apelido]));
    const tMeta2 = Object.fromEntries(tRows2.map(t => [t.slug, t]));

    for (const [rodadaId, rawR] of rawPorRodada) {
      personagensSemanaOutras.set(rodadaId, rawR.map(r => ({
        slug: r.slug,
        nome: tMeta2[r.slug]?.nome ?? r.slug,
        emoji: tMeta2[r.slug]?.emoji ?? null,
        descricao: tMeta2[r.slug]?.descricao ?? null,
        art: ART_BY_SLUG[r.slug],
        vencedor: nmeMap2[r.vencedorId] ?? "?",
        votos: r.votos,
      })));
    }
  }

  // Ordem asc (mais antiga → mais recente) pra bater com datePills (última = ativa)
  const personagensSemanaPorData: PersonagemSemana[][] = rodadasRecentes
    .slice()
    .reverse()
    .map(r => (r.id === rodadaAtiva?.id ? personagensSemana : (personagensSemanaOutras.get(r.id) ?? [])));

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

  // 3 consultas independentes em paralelo (badges do grupo, meu voto, top5)
  const [badgesGrupo, jaVotou, top5VotosRaw] = await Promise.all([
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
  // jogo 20:00 · votação abre 22:30 (mesmo dia) · fecha 20h (dia seguinte)
  const horarioJogo = "20:00";
  const votacao = rodadaAtiva ? (() => {
    const { abre, fecha } = janelaVotacao(rodadaAtiva.data);
    const agora = new Date();
    // votacaoAberta=true (setado pelo cron ou manualmente) sempre vence a janela
    // calculada — evita esse widget divergir de /votacao, que já respeita a flag.
    if (rodadaAtiva.votacaoAberta) return { fase: "aberta" as const, aberta: true, texto: "Votação aberta até às 20h" };
    if (agora < abre)   return { fase: "antes" as const, aberta: false, texto: "Votação abre às 22:30" };
    if (agora >= fecha) return { fase: "encerrada" as const, aberta: false, texto: "Votação encerrada" };
    return { fase: "aberta" as const, aberta: true, texto: "Votação aberta até às 20h" };
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
      isAdmin={jogador.role === "ADMIN" || jogador.role === "SUPER_ADMIN"}
      faltamVotar={faltamVotar}
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
      personagensSemanaPorData={personagensSemanaPorData}
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
