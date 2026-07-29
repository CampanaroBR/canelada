// Arte de cada personagem (prêmio) — fonte ÚNICA. Vivia hardcoded dentro de
// src/app/feed/page.tsx; passou a ser compartilhada quando o perfil também
// precisou das miniaturas. Só slug com arte aqui dentro pode preencher vaga na
// Seleção da Rodada (é o `comArte` de montarSelecao) e virar miniatura.

export const ART_BY_SLUG: Record<string, string> = {
  matador: "/premio/matador.jpg",
  categoria: "/premio/categoria.jpg",
  paredao: "/premio/paredao.jpg",
  racudo: "/premio/racudo.jpg",
  xerife: "/premio/xerife.jpg",
  garcom: "/premio/garcom.jpg",
  driblador: "/premio/driblador.jpg",
  "gol-mais-bonito": "/premio/gol-mais-bonito.jpg",
  "resenha-forte": "/premio/soresenha.jpg",
  delegado: "/premio/delegado.jpg",
  chorao: "/premio/chorao.jpg",
  reclamao: "/premio/reclamao.jpg",
  paneleiro: "/premio/paneleiro.jpg",
  firuleiro: "/premio/firuleiro.jpg",
  pregueiro: "/premio/pregueiro.jpg",
  "corpo-mole": "/premio/pregueiro.jpg",
  cone: "/premio/cone.jpg",
  bagre: "/premio/bagredanoite.jpg",
  frangueiro: "/premio/frangueiro.jpg",
  bragueiro: "/premio/bragueiro.jpg",
};

export const artDoSlug = (slug: string): string | null => ART_BY_SLUG[slug] ?? null;
