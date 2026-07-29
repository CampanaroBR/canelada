// Sorteio de times equilibrado por nota (OVR) — lógica pura e TESTADA.
// Mesma escolha do selecaoRodada.ts: cálculo que gera discussão no grupo mora
// num lugar só, com teste, pra não regredir a cada ajuste.
//
// Duas regras do baba mandam aqui:
//
// 1. ORDEM DE CHEGADA manda em QUEM joga. Quem chega primeiro entra na primeira
//    partida; o resto fica na fila, na ordem em que chegou. O sorteio NÃO
//    reordena a fila por nota — seria injusto com quem chegou cedo.
// 2. NOTA manda em QUAL time. Entre os escalados, a distribuição busca somas de
//    nota parecidas, senão o "sorteio equilibrado" não equilibra nada.

/**
 * Papel no gol. Existem DOIS níveis porque no baba real existem dois tipos —
 * modelar como booleano dava time sem goleiro ou com dois:
 *  - "fixo":    goleiro de verdade (Raphael, Vitor). Só joga no gol.
 *  - "curinga": jogador de linha que topa pegar (Bruno, Luiz Junior, Uili).
 *               Só vai pro gol se faltar fixo; senão joga na linha normalmente.
 *
 * NÃO dá pra inferir isso dos votos: quem leva Frangueiro numa rodada pode ter
 * ido pro gol de brincadeira, e apareceu como "goleiro" no primeiro teste.
 */
export type PapelGol = "fixo" | "curinga";

export interface JogadorSorteio {
  id: string;
  /** OVR (mesmo número do perfil). */
  nota: number;
  /** Ausente = jogador de linha puro, nunca vai pro gol. */
  gol?: PapelGol;
}

export interface SorteioConfig {
  /** Quantos times entram na primeira partida. Default 2. */
  times?: number;
  /** Jogadores de LINHA por time. Default 4 (formação 1 goleiro + 4 linha). */
  linhaPorTime?: number;
  /**
   * Semente do "sortear de novo". O algoritmo é determinístico de propósito
   * (equilíbrio não é sorte), então sem isto o botão devolveria SEMPRE o mesmo
   * time. A semente só embaralha quem tem a MESMA nota — o equilíbrio fica
   * idêntico, mas a dupla muda. Sem semente, resultado estável.
   */
  seed?: number;
}

export interface TimeSorteado {
  jogadores: JogadorSorteio[];
  /** Soma das notas — base do equilíbrio. */
  total: number;
  /** Média arredondada, é o que a tela mostra. */
  media: number;
}

export interface SorteioResult {
  times: TimeSorteado[];
  /** Quem não entrou na primeira partida, NA ORDEM DE CHEGADA. */
  fila: JogadorSorteio[];
  /** Times que ficaram sem ninguém pro gol — a tela avisa em vez de fingir
   *  que está tudo certo (acontece quando os goleiros chegam atrasados). */
  timesSemGoleiro: number[];
}

const media = (js: JogadorSorteio[]) =>
  js.length ? Math.round(js.reduce((t, j) => t + j.nota, 0) / js.length) : 0;
const total = (js: JogadorSorteio[]) => js.reduce((t, j) => t + j.nota, 0);

/** Hash determinístico (FNV-1a), igual ao tieBreak.ts — mesma seed, mesmo sorteio. */
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}

/**
 * Ordena por nota (desc) e desempata pela seed. Só quem EMPATA em nota muda de
 * posição entre um sorteio e outro — por isso o "sortear de novo" varia o time
 * sem piorar o equilíbrio. Sem seed, desempata por id (estável).
 */
const ordenar = (js: JogadorSorteio[], seed?: number) =>
  [...js].sort((a, b) =>
    b.nota - a.nota ||
    (seed === undefined
      ? a.id.localeCompare(b.id)
      : hash(`${seed}:${a.id}`) - hash(`${seed}:${b.id}`))
  );

/**
 * @param chegada jogadores JÁ na ordem de chegada (primeiro = chegou primeiro).
 */
export function sortearTimes(chegada: JogadorSorteio[], cfg: SorteioConfig = {}): SorteioResult {
  const nTimes = Math.max(2, cfg.times ?? 2);
  const linhaPorTime = Math.max(1, cfg.linhaPorTime ?? 4);
  const porTime = linhaPorTime + 1; // + o gol
  const vagas = nTimes * porTime;

  // Corte por ordem de chegada — é a regra 1. Só depois a nota entra em cena.
  //
  // EXCEÇÃO: goleiro FIXO tem preferência pra iniciar. Sem isso, goleiro que
  // chega atrasado ficava na fila e um jogador de linha ia pro gol enquanto o
  // goleiro de verdade assistia — o que ninguém faz num baba. Ele fura a fila
  // (no máximo 1 por time, na ordem de chegada entre os fixos) e o último
  // colocado do corte cede a vaga.
  const preferencia = new Set(
    chegada.filter((j) => j.gol === "fixo").slice(0, nTimes).map((j) => j.id)
  );
  const restantes = chegada.filter((j) => !preferencia.has(j.id));
  const porChegada = new Set(restantes.slice(0, Math.max(0, vagas - preferencia.size)).map((j) => j.id));
  const entra = (j: JogadorSorteio) => preferencia.has(j.id) || porChegada.has(j.id);

  // mantém a ordem de chegada nas duas listas
  const escalados = chegada.filter(entra);
  const fila = chegada.filter((j) => !entra(j));

  const times: JogadorSorteio[][] = Array.from({ length: nTimes }, () => []);
  const usados = new Set<string>();

  // 1 gol por time. FIXO tem prioridade; curinga só é puxado pro gol se faltar
  // fixo (senão tiraríamos um jogador de linha do jogo à toa). Dentro de cada
  // nível, o de maior nota primeiro.
  const fixos = ordenar(escalados.filter((j) => j.gol === "fixo"), cfg.seed);
  const curingas = ordenar(escalados.filter((j) => j.gol === "curinga"), cfg.seed);
  const paraOGol = [...fixos, ...curingas].slice(0, nTimes);
  paraOGol.forEach((g, i) => {
    times[i].push(g);
    usados.add(g.id);
  });
  const timesSemGoleiro = [...times.keys()].filter((t) => times[t].length === 0);

  // Linha: o time com MENOS pontos escolhe primeiro. Isso aproxima as somas e
  // ainda corrige o desequilíbrio que a escalação dos goleiros deixou (goleiro
  // de nota alta num time, baixa no outro).
  const linha = ordenar(escalados.filter((j) => !usados.has(j.id)), cfg.seed);
  for (const j of linha) {
    const ordem = [...times.keys()]
      .filter((t) => times[t].length < porTime)
      .sort((a, b) => total(times[a]) - total(times[b]) || a - b);
    if (ordem.length === 0) break;
    times[ordem[0]].push(j);
  }

  return {
    times: times.map((jogadores) => ({ jogadores, total: total(jogadores), media: media(jogadores) })),
    fila,
    timesSemGoleiro,
  };
}
