// Fonte única pros cards de compartilhamento "personagem da semana"/"prêmio".
// Em vez de uma arte JPG achatada (fundo + mascote + TÍTULO assado), os cards
// compõem ao vivo: fundo sem título (/votacao-bg) + mascote transparente
// (/votacao-mascot) + título renderizado como texto de verdade. Isso evita o
// título pixelado/serrilhado que aparecia quando a arte era exportada mal.

// Cor do título por card. Não é calculada por luminância — é a cor que a arte
// original de cada prêmio já usava (extraída dos JPGs antigos, onde o título
// era assado). Só frangueiro e gol-mais-bonito são pretos; o resto é branco.
const TITLE_COLOR: Record<string, string> = {
  frangueiro: "#111111",
  "gol-mais-bonito": "#111111",
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
