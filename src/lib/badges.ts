import { prisma } from "@/lib/prisma";

/**
 * Cálculo oficial de desbloqueio das 24 badges.
 * Fonte da verdade: docs/gamificacao.md
 *
 * - "Trait vencedora da rodada": jogador mais votado naquela trait na rodada.
 * - MVP da rodada (Opção B): maior soma de pontos de traits positivas vencidas.
 * - Participação: o jogador votou (votante) na rodada.
 */

const POINTS: Record<string, number> = {
  categoria: 4, matador: 3, paredao: 3, racudo: 2, xerife: 2, garcom: 2, driblador: 2,
};
const POSITIVE = new Set(Object.keys(POINTS));
const NEGATIVE = new Set(["bagre", "cone", "corpo-mole"]); // corpo-mole = Pregueiro
const SOCIAL = new Set(["chorao", "reclamao", "paneleiro", "firuleiro", "so-resenha", "delegado"]);

// Nomes das 24 (para o feed da home) — espelha docs/gamificacao.md
const NOME: Record<string, string> = {
  "primeiro-baba": "Primeira Pelada", veterano: "Veterano", "casca-grossa": "Casca Grossa",
  "mais-presente": "Mais Presente", "alma-do-grupo": "Alma do Grupo", "hall-da-fama": "Hall da Fama",
  "lenda-do-baba": "Lenda do Baba", mvp: "MVP", "rei-absoluto": "Rei Absoluto",
  "craque-da-galera": "Craque da Galera", "rei-do-mes": "Rei do Mês", "craque-historico": "Craque Histórico",
  "em-chamas": "Em Chamas", imparavel: "Imparável", invicto: "Invicto", "virada-de-chave": "Virada de Chave",
  consistente: "Consistente", operario: "Operário", "racudo-do-mes": "Raçudo do Mês",
  "resenha-forte": "Resenha Forte", "querido-da-galera": "Querido da Galera",
  colecionador: "Colecionador", "mestre-da-resenha": "Mestre da Resenha", completo: "Completo!",
};

export type BadgeResult = { unlocked: string[]; progress: Record<string, { current: number; meta: number }> };

type Rodada = { id: string; data: Date };
type Ctx = {
  rodadas: Rodada[];
  contagem: Map<string, Map<string, Map<string, number>>>; // rodada -> trait -> jogador -> n
  partPorRodada: Map<string, Set<string>>;
};

// Uma rodada "conta" para badges quando a votação já encerrou (encerrada OU 15h do dia seguinte já passou)
function votacaoFinalizada(data: Date, encerrada: boolean): boolean {
  if (encerrada) return true;
  const fim = new Date(data);
  fim.setDate(fim.getDate() + 1);
  fim.setHours(15, 0, 0, 0);
  return new Date() >= fim;
}

async function carregar(grupoId: string): Promise<Ctx> {
  const todas = await prisma.rodada.findMany({
    where: { grupoId },
    orderBy: { data: "asc" },
    select: { id: true, data: true, encerrada: true },
  });
  const rodadas = todas.filter(r => votacaoFinalizada(r.data, r.encerrada)).map(r => ({ id: r.id, data: r.data }));
  const rodadaIds = rodadas.map(r => r.id);
  const contagem = new Map<string, Map<string, Map<string, number>>>();
  const partPorRodada = new Map<string, Set<string>>();
  if (rodadaIds.length === 0) return { rodadas, contagem, partPorRodada };

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

  for (const v of traitVotos) {
    const t = v.traitSlug as string;
    let porTrait = contagem.get(v.rodadaId);
    if (!porTrait) { porTrait = new Map(); contagem.set(v.rodadaId, porTrait); }
    let porJog = porTrait.get(t);
    if (!porJog) { porJog = new Map(); porTrait.set(t, porJog); }
    porJog.set(v.votadoId, (porJog.get(v.votadoId) ?? 0) + 1);
  }
  for (const p of partRows) {
    let s = partPorRodada.get(p.rodadaId);
    if (!s) { s = new Set(); partPorRodada.set(p.rodadaId, s); }
    s.add(p.votanteId);
  }
  return { rodadas, contagem, partPorRodada };
}

function vencedoresDe(ctx: Ctx, rodadaId: string): Map<string, string> {
  const res = new Map<string, string>();
  const porTrait = ctx.contagem.get(rodadaId);
  if (!porTrait) return res;
  for (const [t, porJog] of porTrait) {
    let melhor: string | null = null, melhorN = 0;
    for (const [pid, n] of porJog) if (n > melhorN) { melhorN = n; melhor = pid; }
    if (melhor) res.set(t, melhor);
  }
  return res;
}

function mvpsDe(ctx: Ctx, rodadaId: string): Set<string> {
  const venc = vencedoresDe(ctx, rodadaId);
  const pts = new Map<string, number>();
  for (const [t, pid] of venc) if (POINTS[t]) pts.set(pid, (pts.get(pid) ?? 0) + POINTS[t]);
  let max = 0;
  for (const n of pts.values()) max = Math.max(max, n);
  const set = new Set<string>();
  if (max > 0) for (const [pid, n] of pts) if (n === max) set.add(pid);
  return set;
}

/** Agrega um jogador sobre um subconjunto de rodadas e devolve badges desbloqueadas + progresso. */
function agregar(ctx: Ctx, jogadorId: string, rodadas: Rodada[]): BadgeResult {
  if (rodadas.length === 0) return { unlocked: [], progress: {} };
  const participou = (rid: string) => ctx.partPorRodada.get(rid)?.has(jogadorId) ?? false;

  const agora = new Date();
  const mesAtual = agora.getMonth(), anoAtual = agora.getFullYear();
  const ehMesAtual = (d: Date) => d.getMonth() === mesAtual && d.getFullYear() === anoAtual;

  let participacoes = 0, mvps = 0, positivas = 0, racudo = 0, social = 0;
  let curPos = 0, maxPos = 0, curCons = 0, maxCons = 0;
  let virada = false, prevNeg = false;
  let roundsMes = 0, partMes = 0;
  const porMes = new Map<string, { total: number; part: number }>();
  const mvpMesGrupo = new Map<string, number>();
  const racudoMesGrupo = new Map<string, number>();

  for (const r of rodadas) {
    const venc = vencedoresDe(ctx, r.id);
    const minhas = [...venc.entries()].filter(([, pid]) => pid === jogadorId).map(([t]) => t);
    const minhasPos = minhas.filter(t => POSITIVE.has(t));
    const ganhouNeg = minhas.some(t => NEGATIVE.has(t));
    const part = participou(r.id);
    const ehMvp = mvpsDe(ctx, r.id).has(jogadorId);
    const d = new Date(r.data);

    if (part) participacoes++;
    positivas += minhasPos.length;
    racudo += minhas.filter(t => t === "racudo").length;
    social += minhas.filter(t => SOCIAL.has(t)).length;
    if (ehMvp) mvps++;

    if (minhasPos.length > 0) { curPos++; maxPos = Math.max(maxPos, curPos); } else curPos = 0;
    if (part && minhasPos.length > 0) { curCons++; maxCons = Math.max(maxCons, curCons); } else curCons = 0;
    if (prevNeg && minhasPos.length > 0) virada = true;
    prevNeg = ganhouNeg;

    const k = `${d.getFullYear()}-${d.getMonth()}`;
    let m = porMes.get(k); if (!m) { m = { total: 0, part: 0 }; porMes.set(k, m); }
    m.total++; if (part) m.part++;
    if (ehMesAtual(d)) {
      roundsMes++; if (part) partMes++;
      for (const pid of mvpsDe(ctx, r.id)) mvpMesGrupo.set(pid, (mvpMesGrupo.get(pid) ?? 0) + 1);
      const rac = venc.get("racudo"); if (rac) racudoMesGrupo.set(rac, (racudoMesGrupo.get(rac) ?? 0) + 1);
    }
  }

  const maisPresente = roundsMes > 0 && partMes === roundsMes;
  const maxMvpMes = Math.max(0, ...Array.from(mvpMesGrupo.values()));
  const reiDoMes = maxMvpMes > 0 && (mvpMesGrupo.get(jogadorId) ?? 0) === maxMvpMes;
  const maxRacMes = Math.max(0, ...Array.from(racudoMesGrupo.values()));
  const racudoDoMes = maxRacMes > 0 && (racudoMesGrupo.get(jogadorId) ?? 0) === maxRacMes;

  const ratioPorIdx = new Map<number, number>();
  for (const [k, v] of porMes) {
    const [y, mo] = k.split("-").map(Number);
    ratioPorIdx.set(y * 12 + mo, v.total > 0 ? v.part / v.total : 0);
  }
  let alma = false;
  for (const n of Array.from(ratioPorIdx.keys())) {
    if ((ratioPorIdx.get(n) ?? 0) >= 0.8 && (ratioPorIdx.get(n + 1) ?? 0) >= 0.8 && (ratioPorIdx.get(n + 2) ?? 0) >= 0.8) { alma = true; break; }
  }

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
  if (unlocked.size >= 8) unlocked.add("colecionador");
  if (unlocked.size >= 16) unlocked.add("mestre-da-resenha");
  if (unlocked.size >= 23) unlocked.add("completo");
  const total = unlocked.size;

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
    colecionador: { current: total, meta: 8 },
    "mestre-da-resenha": { current: total, meta: 16 },
    completo: { current: total, meta: 24 },
  };

  return { unlocked: [...unlocked], progress };
}

/** Badges de UM jogador (página de medalhas). */
export async function computarBadges(grupoId: string, jogadorId: string): Promise<BadgeResult> {
  const ctx = await carregar(grupoId);
  return agregar(ctx, jogadorId, ctx.rodadas);
}

export const nomeBadge = (slug: string): string => NOME[slug] ?? slug;

/* ─────────────────────────────────────────────────────────────
 * RANKING (Classificação) — baseado em Personagem da Semana.
 * Mesma base do MVP/badges: vencedor de cada trait por rodada.
 * Pontos: positivas somam (POINTS), negativas descontam (NEG_POINTS).
 * ──────────────────────────────────────────────────────────── */

const NEG_POINTS: Record<string, number> = { bagre: 3, cone: 2, "corpo-mole": 2 };

// Traits em destaque nos cards de "Personagem" do ranking
const RANK_TRAITS_DESTAQUE = ["categoria", "matador", "paredao", "garcom", "racudo", "bagre"];

export type RankRow = {
  jogadorId: string;
  apelido: string;
  pontos: number;
  rodadas: number;
  mvps: number;
};
export type TraitLeader = { slug: string; apelido: string | null; titulos: number };
export type RankingPayload = { classificacao: RankRow[]; lideres: TraitLeader[] };
export type RankingGrupo = { mes: RankingPayload; geral: RankingPayload };

function computarRanking(ctx: Ctx, nome: Map<string, string>, rodadas: Rodada[]): RankingPayload {
  const pts = new Map<string, number>();
  const rod = new Map<string, number>();
  const mvpC = new Map<string, number>();
  const titulos = new Map<string, Map<string, number>>(); // trait -> jogador -> nº títulos

  for (const r of rodadas) {
    const venc = vencedoresDe(ctx, r.id);
    for (const [t, pid] of venc) {
      let m = titulos.get(t);
      if (!m) { m = new Map(); titulos.set(t, m); }
      m.set(pid, (m.get(pid) ?? 0) + 1);
      if (POINTS[t]) pts.set(pid, (pts.get(pid) ?? 0) + POINTS[t]);
      else if (NEG_POINTS[t]) pts.set(pid, (pts.get(pid) ?? 0) - NEG_POINTS[t]);
    }
    for (const pid of mvpsDe(ctx, r.id)) mvpC.set(pid, (mvpC.get(pid) ?? 0) + 1);
    const part = ctx.partPorRodada.get(r.id);
    if (part) for (const pid of part) rod.set(pid, (rod.get(pid) ?? 0) + 1);
  }

  const ids = new Set<string>([...pts.keys(), ...rod.keys(), ...mvpC.keys()]);
  const classificacao: RankRow[] = [...ids]
    .map(pid => ({
      jogadorId: pid,
      apelido: nome.get(pid) ?? "—",
      pontos: pts.get(pid) ?? 0,
      rodadas: rod.get(pid) ?? 0,
      mvps: mvpC.get(pid) ?? 0,
    }))
    .sort((a, b) => b.pontos - a.pontos || b.mvps - a.mvps || a.apelido.localeCompare(b.apelido));

  const lideres: TraitLeader[] = RANK_TRAITS_DESTAQUE.map(slug => {
    const m = titulos.get(slug);
    let best: string | null = null, bestN = 0;
    if (m) for (const [pid, n] of m) if (n > bestN) { bestN = n; best = pid; }
    return { slug, apelido: best ? (nome.get(best) ?? null) : null, titulos: bestN };
  });

  return { classificacao, lideres };
}

/** Classificação do grupo — mês atual e geral (histórico). */
export async function rankingGrupo(grupoId: string): Promise<RankingGrupo> {
  const [ctx, jogadores] = await Promise.all([
    carregar(grupoId),
    prisma.jogador.findMany({ where: { grupoId }, select: { id: true, apelido: true } }),
  ]);
  const nome = new Map(jogadores.map(j => [j.id, j.apelido]));

  const agora = new Date();
  const mes = agora.getMonth(), ano = agora.getFullYear();
  const rodadasMes = ctx.rodadas.filter(r => r.data.getMonth() === mes && r.data.getFullYear() === ano);

  return {
    mes: computarRanking(ctx, nome, rodadasMes),
    geral: computarRanking(ctx, nome, ctx.rodadas),
  };
}

/**
 * Persiste novos desbloqueios na tabela BadgeUnlock (idempotente).
 * Chamado no carregamento das páginas e no cron — registra o createdAt do desbloqueio.
 * Retorna os desbloqueios recém-criados (para notificação).
 */
export async function sincronizarBadges(grupoId: string): Promise<{ jogadorId: string; slug: string }[]> {
  const ctx = await carregar(grupoId);
  if (ctx.rodadas.length === 0) return [];
  const [jogadores, existentes] = await Promise.all([
    prisma.jogador.findMany({ where: { grupoId }, select: { id: true } }),
    prisma.badgeUnlock.findMany({ where: { jogador: { grupoId } }, select: { jogadorId: true, slug: true } }),
  ]);
  const jaTem = new Set(existentes.map(e => `${e.jogadorId}:${e.slug}`));
  const novos: { jogadorId: string; slug: string }[] = [];
  for (const j of jogadores) {
    const { unlocked } = agregar(ctx, j.id, ctx.rodadas);
    for (const slug of unlocked) if (!jaTem.has(`${j.id}:${slug}`)) novos.push({ jogadorId: j.id, slug });
  }
  if (novos.length > 0) await prisma.badgeUnlock.createMany({ data: novos, skipDuplicates: true });
  return novos;
}

const NOVO_MS = 7 * 24 * 60 * 60 * 1000; // "NOVO" = desbloqueado nos últimos 7 dias

export type BadgesJogador = BadgeResult & { novos: string[] };

/** Página de medalhas: desbloqueadas (persistidas) + quais são novas + progresso (ao vivo). */
export async function badgesDoJogador(grupoId: string, jogadorId: string): Promise<BadgesJogador> {
  await sincronizarBadges(grupoId);
  const [{ progress }, rows] = await Promise.all([
    computarBadges(grupoId, jogadorId),
    prisma.badgeUnlock.findMany({ where: { jogadorId }, select: { slug: true, createdAt: true } }),
  ]);
  const limite = Date.now() - NOVO_MS;
  return {
    unlocked: rows.map(r => r.slug),
    novos: rows.filter(r => r.createdAt.getTime() >= limite).map(r => r.slug),
    progress,
  };
}

export type BadgeNova = { apelido: string; slug: string; nome: string };
export type BadgesGrupo = { jogadoresComBadge: number; totalJogadores: number; novas: BadgeNova[] };

/** Home: nº de jogadores com badge + últimos desbloqueios do grupo (por data). */
export async function badgesHome(grupoId: string): Promise<BadgesGrupo> {
  await sincronizarBadges(grupoId);
  const [total, comBadgeRows, recentes] = await Promise.all([
    prisma.jogador.count({ where: { grupoId } }),
    prisma.badgeUnlock.findMany({ where: { jogador: { grupoId } }, select: { jogadorId: true }, distinct: ["jogadorId"] }),
    prisma.badgeUnlock.findMany({
      where: { jogador: { grupoId } },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { slug: true, jogador: { select: { apelido: true } } },
    }),
  ]);
  return {
    jogadoresComBadge: comBadgeRows.length,
    totalJogadores: total,
    novas: recentes.map(r => ({ apelido: r.jogador.apelido, slug: r.slug, nome: NOME[r.slug] ?? r.slug })),
  };
}
