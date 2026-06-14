export type ConquistaCategoria = "SEQUENCIA" | "MENSAL" | "HISTORICA";

export interface Conquista {
  slug: string;
  nome: string;
  descricao: string;
  categoria: ConquistaCategoria;
  svg: string;
}

export const CONQUISTAS: Conquista[] = [
  // ── Históricas ────────────────────────────────────────────
  {
    slug: "primeira-vitoria",
    nome: "Primeira Vitória",
    descricao: "Recebeu o primeiro MVP",
    categoria: "HISTORICA",
    svg: "/conquistas/primeira-vitoria.svg",
  },
  {
    slug: "veterano",
    nome: "Veterano",
    descricao: "10+ presenças no grupo",
    categoria: "HISTORICA",
    svg: "/conquistas/veterano.svg",
  },
  {
    slug: "lenda",
    nome: "Lenda",
    descricao: "30+ presenças ou 10+ MVPs",
    categoria: "HISTORICA",
    svg: "/conquistas/lenda.svg",
  },
  {
    slug: "completo",
    nome: "Completo",
    descricao: "8+ traits desbloqueadas",
    categoria: "HISTORICA",
    svg: "/conquistas/completo.svg",
  },
  {
    slug: "invicto",
    nome: "Invicto",
    descricao: "5+ MVPs sem nenhum Bagre",
    categoria: "HISTORICA",
    svg: "/conquistas/invicto.svg",
  },
  {
    slug: "trofeu-bagre",
    nome: "Troféu Bagre",
    descricao: "Colecionou 5+ Bagres",
    categoria: "HISTORICA",
    svg: "/conquistas/trofeu-bagre.svg",
  },
  // ── Mensais ───────────────────────────────────────────────
  {
    slug: "rei-do-mes",
    nome: "Rei do Mês",
    descricao: "3+ MVPs na temporada",
    categoria: "MENSAL",
    svg: "/conquistas/rei-do-mes.svg",
  },
  {
    slug: "lanterna",
    nome: "Lanterna",
    descricao: "3+ Bagres na temporada",
    categoria: "MENSAL",
    svg: "/conquistas/lanterna.svg",
  },
  {
    slug: "racudo-do-mes",
    nome: "Raçudo do Mês",
    descricao: "3+ votos de Raçudo",
    categoria: "MENSAL",
    svg: "/conquistas/racudo-do-mes.svg",
  },
  {
    slug: "alma-do-grupo",
    nome: "Alma do Grupo",
    descricao: "3+ votos de Resenha",
    categoria: "MENSAL",
    svg: "/conquistas/alma-do-grupo.svg",
  },
  {
    slug: "mais-presente",
    nome: "Mais Presente",
    descricao: "8+ presenças no período",
    categoria: "MENSAL",
    svg: "/conquistas/mais-presente.svg",
  },
  {
    slug: "consistente",
    nome: "Consistente",
    descricao: "5+ traits com pelo menos 1 MVP",
    categoria: "MENSAL",
    svg: "/conquistas/consistente.svg",
  },
  {
    slug: "irregular",
    nome: "Irregular",
    descricao: "Aparece mas some sem explicação",
    categoria: "MENSAL",
    svg: "/conquistas/irregular.svg",
  },
  // ── Sequência ─────────────────────────────────────────────
  {
    slug: "rei-absoluto",
    nome: "Rei Absoluto",
    descricao: "5+ MVPs acumulados",
    categoria: "SEQUENCIA",
    svg: "/conquistas/rei-absoluto.svg",
  },
  {
    slug: "em-chamas",
    nome: "Em Chamas",
    descricao: "3+ MVPs consecutivos recentes",
    categoria: "SEQUENCIA",
    svg: "/conquistas/em-chamas.svg",
  },
  {
    slug: "ma-fase",
    nome: "Má Fase",
    descricao: "3+ Bagres seguidos",
    categoria: "SEQUENCIA",
    svg: "/conquistas/ma-fase.svg",
  },
  {
    slug: "so-perde",
    nome: "Só Perde",
    descricao: "Mais Bagres do que MVPs",
    categoria: "SEQUENCIA",
    svg: "/conquistas/so-perde.svg",
  },
  {
    slug: "jogador-invisivel",
    nome: "Jogador Invisível",
    descricao: "Presente mas sem reconhecimento",
    categoria: "SEQUENCIA",
    svg: "/conquistas/jogador-invisivel.svg",
  },
  {
    slug: "virada-de-chave",
    nome: "Virada de Chave",
    descricao: "MVP após sequência de Bagres",
    categoria: "SEQUENCIA",
    svg: "/conquistas/virada-de-chave.svg",
  },
];

export const CAT_CONQUISTA_CONFIG: Record<
  ConquistaCategoria,
  { label: string; color: string; icon: string }
> = {
  SEQUENCIA: { label: "Sequência",  color: "#F59E0B", icon: "🔥" },
  MENSAL:    { label: "Mensais",    color: "#60A5FA", icon: "🏆" },
  HISTORICA: { label: "Históricas", color: "#A78BFA", icon: "🌟" },
};

export interface ConquistaStats {
  mvpCount: number;
  bagreCount: number;
  racudoCount: number;
  resenhaCount: number;
  traitsUnlocked: number;
  presencaCount: number;
}

export function computeConquistas(s: ConquistaStats): Set<string> {
  const u = new Set<string>();

  // Históricas
  if (s.mvpCount >= 1)                                     u.add("primeira-vitoria");
  if (s.presencaCount >= 10)                               u.add("veterano");
  if (s.presencaCount >= 30 || s.mvpCount >= 10)           u.add("lenda");
  if (s.traitsUnlocked >= 8)                               u.add("completo");
  if (s.mvpCount >= 5 && s.bagreCount === 0)               u.add("invicto");
  if (s.bagreCount >= 5)                                   u.add("trofeu-bagre");

  // Mensais
  if (s.mvpCount >= 3)                                     u.add("rei-do-mes");
  if (s.bagreCount >= 3)                                   u.add("lanterna");
  if (s.racudoCount >= 3)                                  u.add("racudo-do-mes");
  if (s.resenhaCount >= 3)                                 u.add("alma-do-grupo");
  if (s.presencaCount >= 8)                                u.add("mais-presente");
  if (s.traitsUnlocked >= 5 && s.mvpCount > 0)            u.add("consistente");
  if (s.traitsUnlocked < 2 && s.presencaCount > 3 && s.mvpCount === 0) u.add("irregular");

  // Sequência
  if (s.mvpCount >= 5)                                     u.add("rei-absoluto");
  if (s.mvpCount >= 3)                                     u.add("em-chamas");
  if (s.bagreCount >= 3)                                   u.add("ma-fase");
  if (s.bagreCount > s.mvpCount && s.bagreCount >= 2)     u.add("so-perde");
  if (s.presencaCount > 5 && s.traitsUnlocked === 0 && s.mvpCount === 0) u.add("jogador-invisivel");
  if (s.mvpCount >= 2 && s.bagreCount >= 2)               u.add("virada-de-chave");

  return u;
}

export function computeOverall(s: ConquistaStats): number {
  const base = 60;
  const mvpBonus   = Math.min(s.mvpCount * 5, 20);
  const traitBonus = Math.min(s.traitsUnlocked * 2, 15);
  const presBonus  = Math.min(s.presencaCount * 0.5, 10);
  const bagrePen   = Math.min(s.bagreCount * 3, 15);
  return Math.min(99, Math.max(50, Math.round(base + mvpBonus + traitBonus + presBonus - bagrePen)));
}
