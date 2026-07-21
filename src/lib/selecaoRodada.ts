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

  // Cada jogador aparece em UM lado só — o do maior score. Empate vai pros
  // PIORES (o negativo pesa mais: quem foi tão criticado quanto elogiado conta
  // como pior; e cobre o goleiro empatado em Paredão×Frangueiro, onde Frangueiro
  // vale mais). Assim ninguém aparece nos dois times.
  const ladoPositivo = new Set<string>();
  const ladoNegativo = new Set<string>();
  const todos = new Set<string>([...scoresPositivo.keys(), ...scoresNegativo.keys()]);
  for (const pid of todos) {
    const pos = scoresPositivo.get(pid)?.score ?? 0;
    const neg = scoresNegativo.get(pid)?.score ?? 0;
    if (neg >= pos) ladoNegativo.add(pid);
    else ladoPositivo.add(pid);
  }

  // Goleiro: só quem tem o trait de goleiro como trait DOMINANTE do seu lado.
  // Antes bastava ter o maior score naquele trait entre o lado — o que colocava
  // no gol alguém cujo problema real era outro (ex.: ALABA, dominante em Bagre,
  // com 1 voto de Frangueiro, aparecia de goleiro). Sem ninguém dominante no
  // trait de goleiro, a vaga fica vazia.
  // Goleiro aparece em UM lado só — o de mais votos (Paredão vs Frangueiro).
  // Empate vai pro Frangueiro (vale mais). counterWinsTie=true no lado dos
  // melhores (Frangueiro ganha empate → não é o melhor goleiro); =false no lado
  // dos piores (Paredão precisa ser estritamente maior pra tirar do pior gol).
  const pickGK = (gkTrait: string, lado: Set<string>, scores: Map<string, ScoreEntry>, counterTrait: string, counterWinsTie: boolean) => {
    const players = perTrait.get(gkTrait);
    const counter = perTrait.get(counterTrait);
    if (cfg.comArte && !cfg.comArte.has(gkTrait)) return null;
    let best: Slot | null = null;
    for (const pid of lado) {
      const sc = scores.get(pid);
      if (!sc || sc.bestSlug !== gkTrait) continue; // trait dominante precisa ser o de goleiro
      const gkVotos = players?.get(pid) ?? 0;
      if (gkVotos < (cfg.gkMinVotos ?? 1)) continue; // piso: goleiro fraco (1 voto) deixa o gol vazio
      const counterVotos = counter?.get(pid) ?? 0;
      if (counterWinsTie ? counterVotos >= gkVotos : counterVotos > gkVotos) continue;
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

  // Melhor goleiro: mais Paredão que Frangueiro. Pior goleiro: Frangueiro >=
  // Paredão. Assim o mesmo jogador nunca é os dois. Além do próprio slot, cada
  // goleiro é excluído do OUTRO lado inteiro (linha inclusa) — goleiro aparece
  // só de um lado.
  const gkM = pickGK(cfg.gkPositivo, ladoPositivo, scoresPositivo, cfg.gkNegativo, true);
  const gkP = pickGK(cfg.gkNegativo, ladoNegativo, scoresNegativo, cfg.gkPositivo, false);

  // Sem goleiro de verdade, o 5º slot é preenchido pelo próximo da fila (com
  // camisa normal — isGoleiro:false — pra completar o time sem rotular como
  // goleiro quem não é). Só o goleiro real (pickGK) leva isGoleiro:true.
  const quinto = (scores: Map<string, ScoreEntry>, lado: Set<string>, usados: Set<string>, linha: (Slot | null)[]) => {
    const ja = new Set([...usados, ...linha.filter(Boolean).map(s => s!.jogadorId)]);
    return topLinha(scores, lado, 1, ja)[0];
  };

  const usadosM = new Set<string>();
  if (gkM) usadosM.add(gkM.jogadorId);
  if (gkP) usadosM.add(gkP.jogadorId); // pior goleiro fora da linha dos melhores
  const linhaM = topLinha(scoresPositivo, ladoPositivo, 4, usadosM);
  const melhores = [...linhaM, gkM ?? quinto(scoresPositivo, ladoPositivo, usadosM, linhaM)];

  const usadosP = new Set<string>();
  if (gkP) usadosP.add(gkP.jogadorId);
  if (gkM) usadosP.add(gkM.jogadorId); // melhor goleiro fora do lado dos piores
  const linhaP = topLinha(scoresNegativo, ladoNegativo, 4, usadosP);
  const piores = [...linhaP, gkP ?? quinto(scoresNegativo, ladoNegativo, usadosP, linhaP)];

  return { melhores, piores };
}
