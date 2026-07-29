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

export interface JogadorSorteio {
  id: string;
  /** OVR (mesmo número do perfil). */
  nota: number;
  /** Goleiro é distribuído antes de todo mundo — 1 por time. */
  goleiro?: boolean;
}

export interface SorteioConfig {
  /** Quantos times entram na primeira partida. Default 2. */
  times?: number;
  /** Jogadores por time (sem contar reserva). Default 5. */
  porTime?: number;
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
}

const media = (js: JogadorSorteio[]) =>
  js.length ? Math.round(js.reduce((t, j) => t + j.nota, 0) / js.length) : 0;
const total = (js: JogadorSorteio[]) => js.reduce((t, j) => t + j.nota, 0);

/**
 * @param chegada jogadores JÁ na ordem de chegada (primeiro = chegou primeiro).
 */
export function sortearTimes(chegada: JogadorSorteio[], cfg: SorteioConfig = {}): SorteioResult {
  const nTimes = Math.max(2, cfg.times ?? 2);
  const porTime = Math.max(1, cfg.porTime ?? 5);
  const vagas = nTimes * porTime;

  // Corte por ordem de chegada — é a regra 1. Só depois a nota entra em cena.
  const escalados = chegada.slice(0, vagas);
  const fila = chegada.slice(vagas);

  const times: JogadorSorteio[][] = Array.from({ length: nTimes }, () => []);

  // Goleiros primeiro: 1 por time, do melhor pro pior, pra não sobrar time sem
  // goleiro enquanto outro tem dois. Goleiro que sobrar vira jogador de linha
  // no rateio normal.
  const goleiros = escalados.filter((j) => j.goleiro).sort((a, b) => b.nota - a.nota);
  const usados = new Set<string>();
  goleiros.slice(0, nTimes).forEach((g, i) => {
    times[i].push(g);
    usados.add(g.id);
  });

  // Snake draft por nota: 0,1,2 → 2,1,0 → 0,1,2… É o que melhor aproxima as
  // somas. Distribuir em ordem fixa daria o melhor de cada rodada sempre pro
  // mesmo time. O time que já tem menos nota escolhe antes, o que corrige o
  // desbalanço deixado pelos goleiros.
  const linha = escalados.filter((j) => !usados.has(j.id)).sort((a, b) => b.nota - a.nota || a.id.localeCompare(b.id));
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
  };
}
