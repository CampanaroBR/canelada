import { prisma } from "@/lib/prisma";

/**
 * Cálculo oficial de desbloqueio das 24 badges.
 * Fonte da verdade: docs/gamificacao.md
 *
 * Conceitos:
 * - "Trait vencedora da rodada": jogador mais votado naquela trait na rodada.
 * - MVP da rodada (Opção B): maior soma de pontos de traits positivas vencidas.
 * - Participação: o jogador votou (votante) na rodada.
 */

// Traits positivas + pontuação de MVP
const POINTS: Record<string, number> = {
  categoria: 4, matador: 3, paredao: 3, racudo: 2, xerife: 2, garcom: 2, driblador: 2,
};
const POSITIVE = new Set(Object.keys(POINTS));
const NEGATIVE = new Set(["bagre", "cone", "corpo-mole"]); // corpo-mole = Pregueiro
const SOCIAL = new Set(["chorao", "reclamao", "paneleiro", "firuleiro", "so-resenha", "delegado"]);

export type BadgeResult = {
  unlocked: string[];
  progress: Record<string, { current: number; meta: number }>;
};

export async function computarBadges(grupoId: string, jogadorId: string): Promise<BadgeResult> {
  const rodadas = await prisma.rodada.findMany({
    where: { grupoId, encerrada: true },
    orderBy: { data: "asc" },
    select: { id: true, data: true },
  });
  if (rodadas.length === 0) return { unlocked: [], progress: {} };
  const rodadaIds = rodadas.map(r => r.id);

  const [traitVotos, partRows] = await Promise.all([
    prisma.voto.findMany({
      where: { rodadaId: { in: rodadaIds }, categoria: "TRAIT", traitSlug: { not: null } },
      select: { rodadaId: true, votadoId: true, traitSlug: true },
    }),
    prisma.voto.findMany({
      where: { rodadaId: { in: rodadaIds } },
      select: { rodadaId: true, votanteId: true },
      distinct: ["rodadaId", "votanteId"],
    }),
  ]);

  // contagem[rodada][trait][jogador] = nº de votos
  const contagem = new Map<string, Map<string, Map<string, number>>>();
  for (const v of traitVotos) {
    const t = v.traitSlug as string;
    let porTrait = contagem.get(v.rodadaId);
    if (!porTrait) { porTrait = new Map(); contagem.set(v.rodadaId, porTrait); }
    let porJog = porTrait.get(t);
    if (!porJog) { porJog = new Map(); porTrait.set(t, porJog); }
    porJog.set(v.votadoId, (porJog.get(v.votadoId) ?? 0) + 1);
  }

  // vencedores de cada trait numa rodada → Map<trait, jogadorId>
  const vencedoresDe = (rodadaId: string): Map<string, string> => {
    const res = new Map<string, string>();
    const porTrait = contagem.get(rodadaId);
    if (!porTrait) return res;
    for (const [t, porJog] of porTrait) {
      let melhor: string | null = null, melhorN = 0;
      for (const [pid, n] of porJog) if (n > melhorN) { melhorN = n; melhor = pid; }
      if (melhor) res.set(t, melhor);
    }
    return res;
  };

  // MVP(s) da rodada = maior soma de pontos de positivas vencidas (empate = todos)
  const mvpsDe = (rodadaId: string): Set<string> => {
    const venc = vencedoresDe(rodadaId);
    const pts = new Map<string, number>();
    for (const [t, pid] of venc) if (POINTS[t]) pts.set(pid, (pts.get(pid) ?? 0) + POINTS[t]);
    let max = 0;
    for (const n of pts.values()) max = Math.max(max, n);
    const set = new Set<string>();
    if (max > 0) for (const [pid, n] of pts) if (n === max) set.add(pid);
    return set;
  };

  // participação por rodada
  const partPorRodada = new Map<string, Set<string>>();
  for (const p of partRows) {
    let s = partPorRodada.get(p.rodadaId);
    if (!s) { s = new Set(); partPorRodada.set(p.rodadaId, s); }
    s.add(p.votanteId);
  }
  const participou = (rodadaId: string) => partPorRodada.get(rodadaId)?.has(jogadorId) ?? false;

  const agora = new Date();
  const mesAtual = agora.getMonth(), anoAtual = agora.getFullYear();
  const ehMesAtual = (d: Date) => d.getMonth() === mesAtual && d.getFullYear() === anoAtual;

  // ── Agregação do jogador (rodadas em ordem) ──
  let participacoes = 0, mvps = 0, mvpsMes = 0, positivas = 0, racudo = 0, social = 0;
  let curPos = 0, maxPos = 0;     // streak de positivas consecutivas
  let curCons = 0, maxCons = 0;   // participou E positiva consecutivas
  let virada = false, prevNeg = false;

  // participação por mês (alma do grupo) + MVP/Raçudo do mês (grupo) p/ rei/raçudo do mês
  const porMes = new Map<string, { total: number; part: number }>();
  const mvpMesGrupo = new Map<string, number>();
  const racudoMesGrupo = new Map<string, number>();
  let roundsMes = 0, partMes = 0;

  for (const r of rodadas) {
    const venc = vencedoresDe(r.id);
    const minhas = [...venc.entries()].filter(([, pid]) => pid === jogadorId).map(([t]) => t);
    const minhasPos = minhas.filter(t => POSITIVE.has(t));
    const ganhouNeg = minhas.some(t => NEGATIVE.has(t));
    const part = participou(r.id);
    const ehMvp = mvpsDe(r.id).has(jogadorId);
    const d = new Date(r.data);

    if (part) participacoes++;
    positivas += minhasPos.length;
    racudo += minhas.filter(t => t === "racudo").length;
    social += minhas.filter(t => SOCIAL.has(t)).length;
    if (ehMvp) { mvps++; if (ehMesAtual(d)) mvpsMes++; }

    if (minhasPos.length > 0) { curPos++; maxPos = Math.max(maxPos, curPos); } else curPos = 0;
    if (part && minhasPos.length > 0) { curCons++; maxCons = Math.max(maxCons, curCons); } else curCons = 0;
    if (prevNeg && minhasPos.length > 0) virada = true;
    prevNeg = ganhouNeg;

    // mês
    const k = `${d.getFullYear()}-${d.getMonth()}`;
    let m = porMes.get(k); if (!m) { m = { total: 0, part: 0 }; porMes.set(k, m); }
    m.total++; if (part) m.part++;
    if (ehMesAtual(d)) {
      roundsMes++; if (part) partMes++;
      for (const pid of mvpsDe(r.id)) mvpMesGrupo.set(pid, (mvpMesGrupo.get(pid) ?? 0) + 1);
      const rac = venc.get("racudo"); if (rac) racudoMesGrupo.set(rac, (racudoMesGrupo.get(rac) ?? 0) + 1);
    }
  }

  // Mais Presente: 100% das rodadas do mês
  const maisPresente = roundsMes > 0 && partMes === roundsMes;

  // Rei/Raçudo do Mês: o maior do grupo no mês
  const maxMvpMes = Math.max(0, ...Array.from(mvpMesGrupo.values()));
  const reiDoMes = maxMvpMes > 0 && (mvpMesGrupo.get(jogadorId) ?? 0) === maxMvpMes;
  const maxRacMes = Math.max(0, ...Array.from(racudoMesGrupo.values()));
  const racudoDoMes = maxRacMes > 0 && (racudoMesGrupo.get(jogadorId) ?? 0) === maxRacMes;

  // Alma do Grupo: ≥80% em 3 meses consecutivos
  const ratioPorIdx = new Map<number, number>();
  for (const [k, v] of porMes) {
    const [y, mo] = k.split("-").map(Number);
    ratioPorIdx.set(y * 12 + mo, v.total > 0 ? v.part / v.total : 0);
  }
  let alma = false;
  for (const n of Array.from(ratioPorIdx.keys())) {
    if ((ratioPorIdx.get(n) ?? 0) >= 0.8 && (ratioPorIdx.get(n + 1) ?? 0) >= 0.8 && (ratioPorIdx.get(n + 2) ?? 0) >= 0.8) { alma = true; break; }
  }

  // ── Desbloqueio ──
  const unlocked = new Set<string>();
  const add = (slug: string, cond: boolean) => { if (cond) unlocked.add(slug); };

  add("primeiro-baba", participacoes >= 1);
  add("veterano", participacoes >= 10);
  add("casca-grossa", participacoes >= 25);
  add("hall-da-fama", participacoes >= 50);
  add("mais-presente", maisPresente);
  add("alma-do-grupo", alma);
  add("lenda-do-baba", participacoes >= 100 && mvps >= 5 && positivas >= 50);
  add("mvp", mvps >= 1);
  add("rei-absoluto", mvps >= 5);
  add("craque-da-galera", mvps >= 10);
  add("craque-historico", mvps >= 20);
  add("rei-do-mes", reiDoMes);
  add("em-chamas", maxPos >= 3);
  add("imparavel", maxPos >= 5);
  add("invicto", maxPos >= 10);
  add("consistente", maxCons >= 8);
  add("virada-de-chave", virada);
  add("operario", racudo >= 5);
  add("racudo-do-mes", racudoDoMes);
  add("resenha-forte", social >= 20);
  add("querido-da-galera", positivas >= 50);

  // Coleção (depende das demais)
  if (unlocked.size >= 8) unlocked.add("colecionador");
  if (unlocked.size >= 16) unlocked.add("mestre-da-resenha");
  if (unlocked.size >= 23) unlocked.add("completo");

  const totalUnlocked = unlocked.size;

  // ── Progresso (barras) ──
  const progress: Record<string, { current: number; meta: number }> = {
    veterano: { current: participacoes, meta: 10 },
    "casca-grossa": { current: participacoes, meta: 25 },
    "hall-da-fama": { current: participacoes, meta: 50 },
    "lenda-do-baba": { current: participacoes, meta: 100 },
    "rei-absoluto": { current: mvps, meta: 5 },
    "craque-da-galera": { current: mvps, meta: 10 },
    "craque-historico": { current: mvps, meta: 20 },
    "em-chamas": { current: maxPos, meta: 3 },
    "imparavel": { current: maxPos, meta: 5 },
    invicto: { current: maxPos, meta: 10 },
    consistente: { current: maxCons, meta: 8 },
    operario: { current: racudo, meta: 5 },
    "resenha-forte": { current: social, meta: 20 },
    "querido-da-galera": { current: positivas, meta: 50 },
    colecionador: { current: totalUnlocked, meta: 8 },
    "mestre-da-resenha": { current: totalUnlocked, meta: 16 },
    completo: { current: totalUnlocked, meta: 24 },
  };

  return { unlocked: [...unlocked], progress };
}
