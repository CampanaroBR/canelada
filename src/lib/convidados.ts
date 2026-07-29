// Nota dos convidados (quem joga o baba mas não tem conta no app).
//
// Convidado não é votado, então não tem OVR. Chutar o piso (60) trataria todo
// convidado como perna-de-pau e DESEQUILIBRARIA de verdade quando o cara é bom
// — por isso a base é a MÉDIA do grupo, que é neutra. O admin ajusta em três
// níveis, que é um toque, em vez de digitar número.

export type Nivel = "FRACO" | "MEDIO" | "FORTE";

/** Distância da média por nível. ±8 ≈ meia "faixa" de OVR do grupo. */
const AJUSTE: Record<Nivel, number> = { FRACO: -8, MEDIO: 0, FORTE: 8 };

/** Média usada quando o grupo ainda não tem nota nenhuma (grupo novo). */
const MEDIA_PADRAO = 70;

export function mediaDoGrupo(notas: Iterable<number>): number {
  const arr = [...notas];
  if (arr.length === 0) return MEDIA_PADRAO;
  return Math.round(arr.reduce((t, n) => t + n, 0) / arr.length);
}

/** Nota final do convidado, limitada à mesma faixa do OVR (50–99). */
export function notaDoConvidado(nivel: Nivel, media: number): number {
  return Math.min(99, Math.max(50, media + AJUSTE[nivel]));
}

export const LABEL_NIVEL: Record<Nivel, string> = {
  FRACO: "Fraco",
  MEDIO: "Médio",
  FORTE: "Forte",
};
