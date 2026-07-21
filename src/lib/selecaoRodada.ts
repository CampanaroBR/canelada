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
}

export interface Slot {
  jogadorId: string;
  slug: string; // trait dominante do jogador naquele lado (define a arte)
  votos: number;
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

  // Regra: quem recebeu voto negativo cai nos PIORES — sempre, mesmo tendo voto
  // positivo também. Antes havia uma "exclusividade" (o jogador ia só pro lado
  // de maior score) que sumia com quem levou negativo mas tinha algum positivo
  // — errado. Agora os dois lados são independentes; quem levou dos dois aparece
  // nos dois. A única exclusão fica nos MELHORES: quem é claramente pior (saldo
  // negativo > positivo) não entra nos melhores, pra não repetir o bug de
  // jogador ruim escalado como bom (commit 7a7d98d).
  const ladoNegativo = new Set<string>(scoresNegativo.keys());
  const ladoPositivo = new Set<string>();
  for (const [pid, e] of scoresPositivo) {
    const neg = scoresNegativo.get(pid);
    if (!neg || e.score >= neg.score) ladoPositivo.add(pid);
  }

  // Goleiro: só quem tem o trait de goleiro como trait DOMINANTE do seu lado.
  // Antes bastava ter o maior score naquele trait entre o lado — o que colocava
  // no gol alguém cujo problema real era outro (ex.: ALABA, dominante em Bagre,
  // com 1 voto de Frangueiro, aparecia de goleiro). Sem ninguém dominante no
  // trait de goleiro, a vaga fica vazia.
  // counterTrait: pro MELHOR goleiro (Paredão), o voto de Frangueiro VALE MAIS —
  // um goleiro votado nos dois não pode ser eleito o melhor. Só é melhor goleiro
  // quem teve mais Paredão do que Frangueiro (empate conta como pior, pró-Frangueiro).
  const pickGK = (gkTrait: string, lado: Set<string>, scores: Map<string, ScoreEntry>, counterTrait?: string) => {
    const players = perTrait.get(gkTrait);
    const counter = counterTrait ? perTrait.get(counterTrait) : undefined;
    let best: Slot | null = null;
    for (const pid of lado) {
      const sc = scores.get(pid);
      if (!sc || sc.bestSlug !== gkTrait) continue; // trait dominante precisa ser o de goleiro
      if (cfg.comArte && !cfg.comArte.has(gkTrait)) continue;
      if (counter) {
        const gkVotos = players?.get(pid) ?? 0;
        const counterVotos = counter.get(pid) ?? 0;
        if (counterVotos >= gkVotos) continue; // Frangueiro vale mais → não é o melhor goleiro
      }
      const votos = players?.get(pid) ?? sc.bestVotos;
      if (!best || sc.score > (scores.get(best.jogadorId)!.score) ||
          (sc.score === scores.get(best.jogadorId)!.score && pid.localeCompare(best.jogadorId) < 0)) {
        best = { jogadorId: pid, slug: gkTrait, votos };
      }
    }
    return best;
  };

  const topLinha = (scores: Map<string, ScoreEntry>, lado: Set<string>, n: number, excluir: Set<string>) => {
    const ranked = [...scores.entries()]
      .filter(([pid, e]) => lado.has(pid) && !excluir.has(pid) && (!cfg.comArte || cfg.comArte.has(e.bestSlug)))
      .sort((a, b) => b[1].score - a[1].score || b[1].totalVotos - a[1].totalVotos || a[0].localeCompare(b[0]))
      .slice(0, n);
    const out: (Slot | null)[] = ranked.map(([pid, e]) => ({ jogadorId: pid, slug: e.bestSlug, votos: e.totalVotos }));
    while (out.length < n) out.push(null);
    return out;
  };

  const usadosM = new Set<string>();
  const gkM = pickGK(cfg.gkPositivo, ladoPositivo, scoresPositivo, cfg.gkNegativo);
  if (gkM) usadosM.add(gkM.jogadorId);
  const melhores = [...topLinha(scoresPositivo, ladoPositivo, 4, usadosM), gkM];

  const usadosP = new Set<string>();
  const gkP = pickGK(cfg.gkNegativo, ladoNegativo, scoresNegativo);
  if (gkP) usadosP.add(gkP.jogadorId);
  const piores = [...topLinha(scoresNegativo, ladoNegativo, 4, usadosP), gkP];

  return { melhores, piores };
}
