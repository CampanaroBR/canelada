/** Hash determinístico simples (FNV-1a) — mesma seed sempre dá o mesmo número. */
function hash(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Escolhe o vencedor de uma contagem de votos, desempatando de forma
 * determinística (mesma `seed` sempre resolve pro mesmo lado, mas sem
 * favorecer sistematicamente quem foi votado primeiro cronologicamente
 * como fazia `Array.sort`/loop sequencial — parece injusto com poucos
 * votos, amostra pequena empata fácil).
 *
 * `seed` deve identificar unicamente essa decisão (ex.: `${rodadaId}:${slug}`)
 * pra não flicker entre requests nem mudar quando outro trait é decidido.
 */
export function pickWinner(counts: Map<string, number>, seed: string): { id: string; count: number } | null {
  let max = 0;
  for (const n of counts.values()) if (n > max) max = n;
  if (max === 0) return null;

  const empatados = [...counts.entries()].filter(([, n]) => n === max).map(([id]) => id).sort();
  const id = empatados[hash(seed) % empatados.length];
  return { id, count: max };
}
