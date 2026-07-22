// Fonte ÚNICA da taxonomia dos traits — polaridade (positivo/negativo/social) e
// pontuação. Antes cada lugar tinha sua própria cópia hardcoded (feed:
// POSITIVO_ATIVOS/NEGATIVO_ATIVOS; badges: POINTS/NEG_POINTS/POSITIVE/NEGATIVE),
// e elas divergiram — o ranking parou de contar traits novos (Gol Mais Bonito,
// Frangueiro, etc.) e ainda "escutava" traits já removidos (Raçudo, Cone).
//
// O VALOR de cada trait é o `peso` da tabela Trait no banco (1/2/3/4...), o mesmo
// número usado na Seleção da Rodada. Aqui fica só a POLARIDADE. Assim mudar um
// peso no banco reflete em tudo — ranking, MVP e Seleção — sem tocar em lista.

/** Positivos: somam o peso no ranking/MVP e escalam nos "melhores". */
export const TRAITS_POSITIVOS = [
  "categoria", "matador", "paredao", "xerife", "garcom", "driblador", "gol-mais-bonito",
] as const;

/** Negativos: escalam nos "piores" (Seleção da Rodada) e contam pra badges, mas
 *  NÃO descontam pontos no ranking — decisão do produto: o ranking nunca fica
 *  negativo, só sobe por trait positiva. */
export const TRAITS_NEGATIVOS = [
  "bagre", "frangueiro", "bragueiro", "reclamao", "pregueiro", "paneleiro",
] as const;

/** Goleiro: trait específico de goleiro em cada lado. */
export const GK_POSITIVO = "paredao";
export const GK_NEGATIVO = "frangueiro";

const POS = new Set<string>(TRAITS_POSITIVOS);
const NEG = new Set<string>(TRAITS_NEGATIVOS);

export const ehPositivo = (slug: string): boolean => POS.has(slug);
export const ehNegativo = (slug: string): boolean => NEG.has(slug);

/**
 * Pontos de um trait no ranking/MVP dado o peso do banco: +peso se positivo,
 * 0 caso contrário (negativo ou social). Trait negativa NÃO desconta — o
 * ranking só sobe, nunca fica negativo.
 */
export function pontosTrait(slug: string, peso: number): number {
  return POS.has(slug) ? peso : 0;
}
