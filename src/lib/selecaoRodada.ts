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

  // NINGUÉM aparece nos dois times. Cada jogador tem um lado PREFERIDO — aquele
  // onde o placar dele é maior (empate vai pros piores: quem foi tão criticado
  // quanto elogiado conta como pior). Isso sozinho esvaziava o campo dos piores
  // (poucos levam voto negativo, e os melhores puxavam metade deles), então
  // depois da montagem por lado preferido há um PREENCHIMENTO por sobras: slot
  // vazio pega o melhor jogador que ainda não foi usado em NENHUM time e que
  // tenha voto naquele lado. Assim dá pra ter 5+5 sem repetir ninguém.
  const ladoPositivo = new Set<string>();
  const ladoNegativo = new Set<string>();
  for (const pid of new Set<string>([...scoresPositivo.keys(), ...scoresNegativo.keys()])) {
    const pos = scoresPositivo.get(pid)?.score ?? 0;
    const neg = scoresNegativo.get(pid)?.score ?? 0;
    if (neg >= pos) ladoNegativo.add(pid);
    else ladoPositivo.add(pid);
  }

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

  // Cada PRÊMIO aparece uma vez por time. Os 5 jogadores continuam sendo os de
  // maior placar (não muda quem entra); só o RÓTULO é desduplicado: se o trait
  // dominante de alguém já foi usado no time, ele recebe o próximo trait mais
  // votado dele que ainda está livre (ex.: 2 "Categoria" → o de placar menor vira
  // o próximo prêmio dele). O goleiro reserva seu trait (Paredão/Frangueiro)
  // primeiro; o 5º slot (filler) é desduplicado por último. `votos` passa a ser a
  // contagem do prêmio EXIBIDO — antes era o total do jogador no lado, o que
  // inflava o "eleito por N jogadores" do card de compartilhar.
  const traitsDoJogador = (pid: string, slugs: string[]) => {
    const arr: { slug: string; count: number }[] = [];
    for (const slug of slugs) {
      if (cfg.comArte && !cfg.comArte.has(slug)) continue;
      const c = perTrait.get(slug)?.get(pid) ?? 0;
      if (c > 0) arr.push({ slug, count: c });
    }
    // próximo prêmio = mais votado (count); empate → maior peso, depois slug.
    arr.sort((a, b) => b.count - a.count || (cfg.pesos[b.slug] ?? 1) - (cfg.pesos[a.slug] ?? 1) || a.slug.localeCompare(b.slug));
    return arr;
  };
  const contaPremio = (pid: string, slug: string, fallback: number) => perTrait.get(slug)?.get(pid) ?? fallback;
  const semRepetir = (slot: Slot | null, taken: Set<string>, slugs: string[]): Slot | null => {
    if (!slot) return slot;
    if (!taken.has(slot.slug)) { taken.add(slot.slug); return { ...slot, votos: contaPremio(slot.jogadorId, slot.slug, slot.votos) }; }
    for (const t of traitsDoJogador(slot.jogadorId, slugs)) {
      if (!taken.has(t.slug)) { taken.add(t.slug); return { ...slot, slug: t.slug, votos: t.count }; }
    }
    return { ...slot, votos: contaPremio(slot.jogadorId, slot.slug, slot.votos) }; // sem prêmio livre: mantém (dup raríssimo)
  };
  const montarTime = (linha: (Slot | null)[], gk: Slot | null, quintoSlot: Slot | null, slugs: string[]) => {
    const taken = new Set<string>();
    if (gk) taken.add(gk.slug);                                  // goleiro real reserva Paredão/Frangueiro
    const linha2 = linha.map((s) => semRepetir(s, taken, slugs));
    return [...linha2, gk ?? semRepetir(quintoSlot, taken, slugs)]; // filler desduplicado por último
  };

  // `usados` é GLOBAL (vale pros dois times) — é o que garante que ninguém
  // apareça nas duas escalações. Toda escolha passa por aqui e marca o jogador.
  const usados = new Set<string>();
  /** Pega os N melhores ainda livres. pool=null → qualquer um com voto no lado (sobras). */
  const pegar = (scores: Map<string, ScoreEntry>, pool: Set<string> | null, n: number): Slot[] => {
    if (n <= 0) return [];
    const ranked = [...scores.entries()]
      .filter(([pid, e]) => !usados.has(pid) && (!pool || pool.has(pid)) && (!cfg.comArte || cfg.comArte.has(e.bestSlug)))
      .sort((a, b) => b[1].score - a[1].score || b[1].totalVotos - a[1].totalVotos || a[0].localeCompare(b[0]))
      .slice(0, n);
    for (const [pid] of ranked) usados.add(pid);
    return ranked.map(([pid, e]) => ({ jogadorId: pid, slug: e.bestSlug, votos: e.totalVotos, isGoleiro: false }));
  };

  // Goleiros primeiro (reservam a vaga). Como os lados são disjuntos, é
  // impossível o mesmo jogador ser o melhor E o pior goleiro.
  const gkM = pickGK(cfg.gkPositivo, ladoPositivo, scoresPositivo);
  if (gkM) usados.add(gkM.jogadorId);
  const gkP = pickGK(cfg.gkNegativo, ladoNegativo, scoresNegativo);
  if (gkP) usados.add(gkP.jogadorId);

  // 1ª passada: cada time monta com quem é DAQUELE lado (lado preferido).
  // Sem goleiro real, o 5º slot é o próximo da fila com camisa normal
  // (isGoleiro:false) — completa o time sem rotular de goleiro quem não é.
  const time = (scores: Map<string, ScoreEntry>, pool: Set<string>, gk: Slot | null) => ({
    gk,
    linha: pegar(scores, pool, 4),
    quinto: gk ? null : (pegar(scores, pool, 1)[0] ?? null),
  });
  const tM = time(scoresPositivo, ladoPositivo, gkM);
  const tP = time(scoresNegativo, ladoNegativo, gkP);

  // 2ª passada: sobras. Slot ainda vazio pega o melhor jogador livre com voto
  // naquele lado, mesmo que o lado preferido dele seja o outro — é o que enche
  // 5+5 sem repetir ninguém. Piores primeiro: é o lado escasso (bem menos gente
  // leva voto negativo), então ele escolhe antes de os melhores consumirem.
  const completar = (t: ReturnType<typeof time>, scores: Map<string, ScoreEntry>) => {
    const faltam = 4 - t.linha.length;
    if (faltam > 0) t.linha.push(...pegar(scores, null, faltam));
    if (!t.gk && !t.quinto) t.quinto = pegar(scores, null, 1)[0] ?? null;
  };
  completar(tP, scoresNegativo);
  completar(tM, scoresPositivo);

  const pad = (arr: Slot[]) => {
    const out: (Slot | null)[] = [...arr];
    while (out.length < 4) out.push(null);
    return out;
  };
  const melhores = montarTime(pad(tM.linha), tM.gk, tM.quinto, cfg.positivos);
  const piores = montarTime(pad(tP.linha), tP.gk, tP.quinto, cfg.negativos);

  return { melhores, piores };
}
