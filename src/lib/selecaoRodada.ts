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

  // Cada jogador fica no lado onde seu score é MAIOR (não no que foi processado
  // primeiro). Empate vai pro positivo. Ver bug 1 do commit 7a7d98d.
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

  // Goleiro: só quem tem o trait de goleiro como trait DOMINANTE do seu lado.
  // Antes bastava ter o maior score naquele trait entre o lado — o que colocava
  // no gol alguém cujo problema real era outro (ex.: ALABA, dominante em Bagre,
  // com 1 voto de Frangueiro, aparecia de goleiro). Sem ninguém dominante no
  // trait de goleiro, a vaga fica vazia.
  const pickGK = (gkTrait: string, lado: Set<string>, scores: Map<string, ScoreEntry>) => {
    const players = perTrait.get(gkTrait);
    let best: Slot | null = null;
    for (const pid of lado) {
      const sc = scores.get(pid);
      if (!sc || sc.bestSlug !== gkTrait) continue; // trait dominante precisa ser o de goleiro
      if (cfg.comArte && !cfg.comArte.has(gkTrait)) continue;
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
  const gkM = pickGK(cfg.gkPositivo, ladoPositivo, scoresPositivo);
  if (gkM) usadosM.add(gkM.jogadorId);
  const melhores = [...topLinha(scoresPositivo, ladoPositivo, 4, usadosM), gkM];

  const usadosP = new Set<string>();
  const gkP = pickGK(cfg.gkNegativo, ladoNegativo, scoresNegativo);
  if (gkP) usadosP.add(gkP.jogadorId);
  const piores = [...topLinha(scoresNegativo, ladoNegativo, 4, usadosP), gkP];

  return { melhores, piores };
}
