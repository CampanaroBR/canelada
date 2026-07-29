// Estatísticas de carreira do perfil (MVP's, Bagres, Presenças, Personagens).
//
// Por que este arquivo existe: o perfil contava MVP e BAGRE lendo
// `Voto.categoria = "MVP" | "BAGRE"` — categorias que a votação NÃO cria mais.
// Hoje todo voto é `TRAIT`, e os títulos da rodada são derivados:
//   MVP   = quem venceu o trait "categoria" (👑) na rodada
//   BAGRE = quem venceu o trait "bagre"     (🐟) na rodada
// Era o mesmo critério das stories (src/lib/stories.ts), então os contadores
// ficavam sempre 0 pra todo mundo enquanto o story dizia "Fulano foi o CRAQUE".
// Aqui o cálculo é o MESMO do story (inclusive o `pickWinner` com a mesma seed),
// pra o número do perfil bater com o que o grupo viu na Home.

import { prisma } from "./prisma";
import { pickWinner } from "./tieBreak";
import { computeOverall } from "./conquistas";

/** Rodada conta quando a votação encerrou (flag OU 15h do dia seguinte). Mesma
 *  regra de badges.ts — perfil e ranking não podem divergir. */
function votacaoFinalizada(data: Date, encerrada: boolean): boolean {
  if (encerrada) return true;
  const fim = new Date(data);
  fim.setDate(fim.getDate() + 1);
  fim.setHours(15, 0, 0, 0);
  return new Date() >= fim;
}

export type TituloRodada = { rodadaId: string; data: Date; votos: number };
export type PresencaRodada = { rodadaId: string; data: Date; participantes: number };
/** Personagem VENCIDO (foi o mais votado naquele trait na rodada) e quantas vezes.
 *  Não é o total de votos recebidos: levar 14 votos de Driblador espalhados em 6
 *  rodadas sem nunca ser o mais votado = 0 vitórias. */
export type PersonagemVencido = { slug: string; vitorias: number };

export type PerfilStats = {
  mvpCount: number;
  bagreCount: number;
  presencaCount: number;
  /** Rodadas em que foi MVP (pra listar no detalhe). */
  mvps: TituloRodada[];
  /** Rodadas em que levou o Bagre. */
  bagres: TituloRodada[];
  /** Rodadas em que participou, com quanta gente jogou. */
  presencas: PresencaRodada[];
  /** Personagens que venceu ao menos 1x, do mais vencido pro menos. */
  personagens: PersonagemVencido[];
};

const MVP_TRAIT = "categoria";
const BAGRE_TRAIT = "bagre";

type Rodadinha = { id: string; data: Date };
type CtxGrupo = {
  rodadas: Rodadinha[];
  /** rodadaId -> trait -> vencedor daquela rodada naquele trait. */
  vencedores: Map<string, Map<string, { id: string; count: number }>>;
  /** rodadaId -> quem participou (presentes ∪ votantes que jogaram). */
  participantes: Map<string, Set<string>>;
};

/**
 * UMA passada no grupo inteiro. Existe porque a tela de sorteio precisa da nota
 * de ~16 jogadores de uma vez — chamar `perfilStats` por jogador repetiria a
 * mesma query N vezes. `perfilStats` e `notasDoGrupo` derivam daqui, então o
 * número do perfil e o do sorteio são sempre o mesmo.
 */
async function carregarGrupo(grupoId: string): Promise<CtxGrupo> {
  const rodadasTodas = await prisma.rodada.findMany({
    where: { grupoId },
    orderBy: { data: "desc" },
    select: { id: true, data: true, encerrada: true, presentes: { select: { id: true } } },
  });
  const rodadas = rodadasTodas.filter((r) => votacaoFinalizada(r.data, r.encerrada));
  if (rodadas.length === 0) return { rodadas: [], vencedores: new Map(), participantes: new Map() };

  const votos = await prisma.voto.findMany({
    where: { rodadaId: { in: rodadas.map((r) => r.id) }, categoria: "TRAIT", traitSlug: { not: null } },
    select: { rodadaId: true, votadoId: true, votanteId: true, traitSlug: true, votanteJogou: true },
  });

  // participação: presentes ∪ votantes que declararam ter jogado (mesma união
  // de badges.ts — `presentes` é a fonte primária, votante é fallback/reforço).
  const participantes = new Map<string, Set<string>>();
  for (const r of rodadas) participantes.set(r.id, new Set(r.presentes.map((p) => p.id)));

  const contagem = new Map<string, Map<string, Map<string, number>>>();
  for (const v of votos) {
    const slug = v.traitSlug as string;
    let traits = contagem.get(v.rodadaId);
    if (!traits) { traits = new Map(); contagem.set(v.rodadaId, traits); }
    let jogs = traits.get(slug);
    if (!jogs) { jogs = new Map(); traits.set(slug, jogs); }
    jogs.set(v.votadoId, (jogs.get(v.votadoId) ?? 0) + 1);
    if (v.votanteJogou) participantes.get(v.rodadaId)?.add(v.votanteId);
  }

  // Vencedor de cada trait em cada rodada, com a MESMA seed do story — senão,
  // num empate, perfil e story apontariam craques diferentes na mesma rodada.
  const vencedores = new Map<string, Map<string, { id: string; count: number }>>();
  for (const [rodadaId, traits] of contagem) {
    const m = new Map<string, { id: string; count: number }>();
    for (const [slug, jogs] of traits) {
      const w = pickWinner(jogs, `${rodadaId}:${slug}`);
      if (w) m.set(slug, w);
    }
    vencedores.set(rodadaId, m);
  }

  return { rodadas: rodadas.map((r) => ({ id: r.id, data: r.data })), vencedores, participantes };
}

/** Extrai as estatísticas de UM jogador do contexto já carregado. */
function statsDoJogador(jogadorId: string, ctx: CtxGrupo): PerfilStats {
  const titulos = (trait: string): TituloRodada[] =>
    ctx.rodadas.flatMap((r) => {
      const w = ctx.vencedores.get(r.id)?.get(trait);
      return w?.id === jogadorId ? [{ rodadaId: r.id, data: r.data, votos: w.count }] : [];
    });

  const mvps = titulos(MVP_TRAIT);
  const bagres = titulos(BAGRE_TRAIT);

  // Vitórias por personagem: rodadas em que ele foi o mais votado naquele trait.
  // Diferente de `JogadorTrait.contador`, que soma VOTOS recebidos e inflava o
  // perfil ("Driblador 14x" com só 2 rodadas vencidas).
  const vitorias = new Map<string, number>();
  for (const r of ctx.rodadas) {
    for (const [slug, w] of ctx.vencedores.get(r.id) ?? []) {
      if (w.id === jogadorId) vitorias.set(slug, (vitorias.get(slug) ?? 0) + 1);
    }
  }

  const presencas: PresencaRodada[] = ctx.rodadas
    .filter((r) => ctx.participantes.get(r.id)?.has(jogadorId))
    .map((r) => ({ rodadaId: r.id, data: r.data, participantes: ctx.participantes.get(r.id)?.size ?? 0 }));

  return {
    mvpCount: mvps.length,
    bagreCount: bagres.length,
    presencaCount: presencas.length,
    mvps,
    bagres,
    presencas,
    personagens: [...vitorias.entries()]
      .map(([slug, v]) => ({ slug, vitorias: v }))
      .sort((a, b) => b.vitorias - a.vitorias || a.slug.localeCompare(b.slug)),
  };
}

export async function perfilStats(jogadorId: string, grupoId: string): Promise<PerfilStats> {
  return statsDoJogador(jogadorId, await carregarGrupo(grupoId));
}

/**
 * OVR de TODOS os jogadores do grupo, numa passada. É o mesmo número do perfil
 * (mesma fórmula, mesmos dados) — o sorteio não pode usar uma nota diferente da
 * que o jogador vê na tela dele.
 */
export async function notasDoGrupo(grupoId: string): Promise<Map<string, number>> {
  const ctx = await carregarGrupo(grupoId);
  const jogadores = await prisma.jogador.findMany({ where: { grupoId }, select: { id: true } });
  const out = new Map<string, number>();
  for (const j of jogadores) {
    const s = statsDoJogador(j.id, ctx);
    out.set(j.id, computeOverall({
      mvpCount: s.mvpCount,
      bagreCount: s.bagreCount,
      racudoCount: 0,
      resenhaCount: 0,
      traitsUnlocked: s.personagens.length,
      presencaCount: s.presencaCount,
    }));
  }
  return out;
}
