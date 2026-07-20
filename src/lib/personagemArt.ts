// Fonte única pros cards de compartilhamento "personagem da semana"/"prêmio".
// Em vez de uma arte JPG achatada (fundo + mascote + TÍTULO assado), os cards
// compõem ao vivo: fundo sem título (/votacao-bg) + mascote transparente
// (/votacao-mascot) + título renderizado como texto de verdade. Isso evita o
// título pixelado/serrilhado que aparecia quando a arte era exportada mal.

// Cor do título por card, escolhida pela luminância do fundo (preto pra fundo
// claro, branco pra escuro) pra garantir contraste em todos os ~19 cards.
const TITLE_COLOR: Record<string, string> = {
  frangueiro: "#111111",
  bragueiro: "#111111",
  // todos os outros fundos são escuros o suficiente → título branco
};

export function personagemBgSrc(slug: string): string {
  return `/premio-bg/${slug}.png`;
}

export function personagemMascotSrc(slug: string): string {
  return `/votacao-mascot/${slug}.png`;
}

export function personagemTitleColor(slug: string): string {
  return TITLE_COLOR[slug] ?? "#ffffff";
}
