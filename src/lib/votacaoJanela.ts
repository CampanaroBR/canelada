// Janela da votação, ancorada em BRT (UTC-3), a partir da data do baba.
// Baba no dia X → votação abre X 22:30 BRT, fecha (X+1) 20:00 BRT.
// Robusto a timezone: Vercel roda em UTC, então derivamos a data BRT e
// construímos os instantes com Date.UTC (que normaliza horas > 24).

// Grupo pequeno demais (poucos jogadores cadastrados) faz a votação ficar
// vazia/sem graça — só abre automaticamente com esse mínimo de candidatos.
export const MIN_JOGADORES_VOTACAO = 10;

export function janelaVotacao(data: Date): { abre: Date; fecha: Date } {
  // `data` guarda a DATA do baba (form → meia-noite UTC dessa data). Usamos as
  // partes UTC direto: elas já representam o dia-calendário correto do baba.
  const y = data.getUTCFullYear();
  const m = data.getUTCMonth();
  const d = data.getUTCDate();
  // 22:30 BRT = 01:30 UTC do dia seguinte (Date.UTC normaliza a hora 25:30)
  const abre = new Date(Date.UTC(y, m, d, 25, 30, 0, 0));
  // (X+1) 20:00 BRT = (X+1) 23:00 UTC
  const fecha = new Date(Date.UTC(y, m, d + 1, 23, 0, 0, 0));
  return { abre, fecha };
}

export function votacaoAtiva(data: Date, agora: Date = new Date()): boolean {
  const { abre, fecha } = janelaVotacao(data);
  return agora >= abre && agora < fecha;
}

export function votacaoEncerrada(data: Date, agora: Date = new Date()): boolean {
  return agora >= janelaVotacao(data).fecha;
}
