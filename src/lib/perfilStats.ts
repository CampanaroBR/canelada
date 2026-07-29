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
};

const MVP_TRAIT = "categoria";
const BAGRE_TRAIT = "bagre";

export async function perfilStats(jogadorId: string, grupoId: string): Promise<PerfilStats> {
  const rodadasTodas = await prisma.rodada.findMany({
    where: { grupoId },
    orderBy: { data: "desc" },
    select: { id: true, data: true, encerrada: true, presentes: { select: { id: true } } },
  });
  const rodadas = rodadasTodas.filter((r) => votacaoFinalizada(r.data, r.encerrada));
  const vazio: PerfilStats = {
    mvpCount: 0, bagreCount: 0, presencaCount: 0,
    mvps: [], bagres: [], presencas: [],
  };
  if (rodadas.length === 0) return vazio;

  const ids = rodadas.map((r) => r.id);
  const votos = await prisma.voto.findMany({
    where: { rodadaId: { in: ids }, categoria: "TRAIT", traitSlug: { not: null } },
    select: { rodadaId: true, votadoId: true, votanteId: true, traitSlug: true, votanteJogou: true },
  });

  // votos por rodada → trait → jogador (base dos vencedores de cada rodada)
  const porRodada = new Map<string, Map<string, Map<string, number>>>();
  // participação: presentes ∪ votantes que declararam ter jogado (mesma união
  // de badges.ts — `presentes` é a fonte primária, votante é fallback/reforço).
  const participantes = new Map<string, Set<string>>();

  for (const r of rodadas) {
    const s = new Set<string>(r.presentes.map((p) => p.id));
    participantes.set(r.id, s);
  }
  for (const v of votos) {
    const slug = v.traitSlug as string;
    let traits = porRodada.get(v.rodadaId);
    if (!traits) { traits = new Map(); porRodada.set(v.rodadaId, traits); }
    let jogs = traits.get(slug);
    if (!jogs) { jogs = new Map(); traits.set(slug, jogs); }
    jogs.set(v.votadoId, (jogs.get(v.votadoId) ?? 0) + 1);

    if (v.votanteJogou) participantes.get(v.rodadaId)?.add(v.votanteId);
  }

  const titulos = (trait: string): TituloRodada[] => {
    const out: TituloRodada[] = [];
    for (const r of rodadas) {
      const jogs = porRodada.get(r.id)?.get(trait);
      if (!jogs) continue;
      // MESMA seed do story — senão, num empate, perfil e story apontariam
      // vencedores diferentes na mesma rodada.
      const w = pickWinner(jogs, `${r.id}:${trait}`);
      if (w?.id === jogadorId) out.push({ rodadaId: r.id, data: r.data, votos: w.count });
    }
    return out;
  };

  const mvps = titulos(MVP_TRAIT);
  const bagres = titulos(BAGRE_TRAIT);

  const presencas: PresencaRodada[] = rodadas
    .filter((r) => participantes.get(r.id)?.has(jogadorId))
    .map((r) => ({ rodadaId: r.id, data: r.data, participantes: participantes.get(r.id)?.size ?? 0 }));

  return {
    mvpCount: mvps.length,
    bagreCount: bagres.length,
    presencaCount: presencas.length,
    mvps,
    bagres,
    presencas,
  };
}
