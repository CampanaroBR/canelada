// Lógica pura da "Seleção da Rodada" (melhores/piores) por placar ponderado.
// Extraída de src/app/feed/page.tsx pra poder ser TESTADA — esse cálculo já
// quebrou várias vezes (lado errado, goleiro sem relação com goleiro) e sem
// teste toda rodada com padrão de voto novo reabria o bug. Ver selecaoRodada.test.ts.

/** traitSlug -> (jogadorId -> nº de votos naquele trait). */
export type TraitVotos = Map<string, Map<string, number>>;

export interface SelecaoConfig {
  positivos: string[];
  negativos: string[];
  gkPositivo: string; // trait de goleiro dos melhores (ex.: "paredao")
  gkNegativo: string; // trait de goleiro dos piores  (ex.: "frangueiro")
  pesos: Record<string, number>; // slug -> peso (default 1)
  /** slugs que têm arte (só esses podem preencher vaga). Se undefined, todos valem. */
  comArte?: Set<string>;
  /** mínimo de votos no trait de goleiro pra escalar goleiro (abaixo, gol vazio). Default 1. */
  gkMinVotos?: number;
}

export interface Slot {
  jogadorId: string;
  slug: string; // trait dominante do jogador naquele lado (define a arte)
  votos: number;
  /** true só pro goleiro de verdade (camisa dourada). O 5º slot preenchido por
   *  falta de goleiro real usa false → camisa normal, sem rotular como goleiro. */
  isGoleiro?: boolean;
}

export interface SelecaoResult {
  /** 5 posições: [linha1..linha4, goleiro]. null = vaga vazia. */
  melhores: (Slot | null)[];
  piores: (Slot | null)[];
}

interface ScoreEntry { score: number; totalVotos: number; bestSlug: string; bestVotos: number }

function buildScores(perTrait: TraitVotos, slugs: string[], pesos: Record<string, number>) {
  const scores = new Map<string, ScoreEntry>();
  for (const slug of slugs) {
    const players = perTrait.get(slug);
    if (!players) continue;
    const peso = pesos[slug] ?? 1;
    for (const [pid, count] of players) {
      const cur = scores.get(pid) ?? { score: 0, totalVotos: 0, bestSlug: slug, bestVotos: 0 };
      cur.score += peso * count;
      cur.totalVotos += count;
      if (count > cur.bestVotos) { cur.bestVotos = count; cur.bestSlug = slug; }
      scores.set(pid, cur);
    }
  }
  return scores;
}

export function montarSelecao(perTrait: TraitVotos, cfg: SelecaoConfig): SelecaoResult {
  const scoresPositivo = buildScores(perTrait, cfg.positivos, cfg.pesos);
  const scoresNegativo = buildScores(perTrait, cfg.negativos, cfg.pesos);

  // Os dois times são INDEPENDENTES: "os 5 maiores placares positivos" e "os 5
  // maiores placares negativos", cada lado rankeado pelo seu próprio score. Um
  // jogador PODE aparecer nos dois (foi elogiado num trait e criticado em outro)
  // — é isso que garante os 5 slots cheios: o pote de votados negativos é
  // pequeno e a exclusividade antiga (um lado só) esvaziava o campo. A única
  // exceção é o goleiro (ver abaixo): ninguém é o melhor E o pior goleiro.
  const ladoPositivo = new Set<string>(scoresPositivo.keys());
  const ladoNegativo = new Set<string>(scoresNegativo.keys());

  // Goleiro: só quem tem o trait de goleiro como trait DOMINANTE do seu lado
  // (bestSlug). Antes bastava ter o maior score naquele trait — o que colocava
  // no gol alguém cujo problema real era outro (ex.: ALABA, dominante em Bagre,
  // com 1 voto de Frangueiro, virava goleiro). Sem ninguém dominante no trait de
  // goleiro, a vaga fica vazia e o 5º slot é preenchido pela linha (quinto). O
  // piso gkMinVotos evita eleger goleiro com 1 voto.
  const pickGK = (gkTrait: string, lado: Set<string>, scores: Map<string, ScoreEntry>) => {
    if (cfg.comArte && !cfg.comArte.has(gkTrait)) return null;
    const players = perTrait.get(gkTrait);
    let best: Slot | null = null;
    for (const pid of lado) {
      const sc = scores.get(pid);
      if (!sc || sc.bestSlug !== gkTrait) continue; // trait dominante precisa ser o de goleiro
      const gkVotos = players?.get(pid) ?? 0;
      if (gkVotos < (cfg.gkMinVotos ?? 1)) continue; // piso: goleiro fraco (1 voto) deixa o gol vazio
      if (!best || sc.score > (scores.get(best.jogadorId)!.score) ||
          (sc.score === scores.get(best.jogadorId)!.score && pid.localeCompare(best.jogadorId) < 0)) {
        best = { jogadorId: pid, slug: gkTrait, votos: gkVotos, isGoleiro: true };
      }
    }
    return best;
  };

  const topLinha = (scores: Map<string, ScoreEntry>, lado: Set<string>, n: number, excluir: Set<string>) => {
    const ranked = [...scores.entries()]
      .filter(([pid, e]) => lado.has(pid) && !excluir.has(pid) && (!cfg.comArte || cfg.comArte.has(e.bestSlug)))
      .sort((a, b) => b[1].score - a[1].score || b[1].totalVotos - a[1].totalVotos || a[0].localeCompare(b[0]))
      .slice(0, n);
    const out: (Slot | null)[] = ranked.map(([pid, e]) => ({ jogadorId: pid, slug: e.bestSlug, votos: e.totalVotos, isGoleiro: false }));
    while (out.length < n) out.push(null);
    return out;
  };

  // Sem goleiro de verdade, o 5º slot é preenchido pelo próximo da fila (com
  // camisa normal — isGoleiro:false — pra completar o time sem rotular como
  // goleiro quem não é). Só o goleiro real (pickGK) leva isGoleiro:true.
  const quinto = (scores: Map<string, ScoreEntry>, lado: Set<string>, usados: Set<string>, linha: (Slot | null)[]) => {
    const ja = new Set([...usados, ...linha.filter(Boolean).map(s => s!.jogadorId)]);
    return topLinha(scores, lado, 1, ja)[0];
  };

  let gkM = pickGK(cfg.gkPositivo, ladoPositivo, scoresPositivo);
  let gkP = pickGK(cfg.gkNegativo, ladoNegativo, scoresNegativo);

  // Ninguém é os DOIS goleiros: se o mesmo jogador for o melhor Paredão e o pior
  // Frangueiro, fica no gol do lado de mais votos (empate → pior, Frangueiro
  // manda) e some do OUTRO lado inteiro (linha inclusa) — não faz sentido ser
  // goleiro num gol e ainda aparecer no time do outro. É a única exclusão
  // cruzada que sobra; no resto, os times são independentes e overlap é OK.
  const exclPositivo = new Set<string>();
  const exclNegativo = new Set<string>();
  if (gkM && gkP && gkM.jogadorId === gkP.jogadorId) {
    const pid = gkM.jogadorId;
    const paredaoVotos = perTrait.get(cfg.gkPositivo)?.get(pid) ?? 0;
    const frangueiroVotos = perTrait.get(cfg.gkNegativo)?.get(pid) ?? 0;
    if (frangueiroVotos >= paredaoVotos) { gkM = null; exclPositivo.add(pid); } // é o pior goleiro → fora dos melhores
    else { gkP = null; exclNegativo.add(pid); }                                  // é o melhor goleiro → fora dos piores
  }

  const usadosM = new Set<string>(exclPositivo);
  if (gkM) usadosM.add(gkM.jogadorId);
  const linhaM = topLinha(scoresPositivo, ladoPositivo, 4, usadosM);
  const melhores = [...linhaM, gkM ?? quinto(scoresPositivo, ladoPositivo, usadosM, linhaM)];

  const usadosP = new Set<string>(exclNegativo);
  if (gkP) usadosP.add(gkP.jogadorId);
  const linhaP = topLinha(scoresNegativo, ladoNegativo, 4, usadosP);
  const piores = [...linhaP, gkP ?? quinto(scoresNegativo, ladoNegativo, usadosP, linhaP)];

  return { melhores, piores };
}
