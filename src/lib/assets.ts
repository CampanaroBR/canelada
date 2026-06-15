// Ilustrações dos personagens (slugs do Prisma Trait)
export const ILUSTRACOES: Record<string, string> = {
  cone:          "/ilustracoes/cone.png",
  "corpo-mole":  "/ilustracoes/corpo-mole.png",
  flamingo:      "/ilustracoes/flamingo.png",
  panela:        "/ilustracoes/panela.png",
  bulldog:       "/ilustracoes/bulldog.png",
  tubarao:       "/ilustracoes/tubarao.png",
  gato:          "/ilustracoes/gato.png",
  porco:         "/ilustracoes/porco.png",
  rinoceronte:   "/ilustracoes/rinoceronte.png",
  bode:          "/ilustracoes/bode.png",
  foca:          "/ilustracoes/foca.png",
  "peixe-mic":   "/ilustracoes/peixe-mic.png",
  touro:         "/ilustracoes/touro.png",
  bagre:         "/ilustracoes/bagre.png",
  polvo:         "/ilustracoes/polvo.png",
};

// Mapa de categoria de voto → ilustração do personagem principal (PNG com canal alfa)
export const MASCOTE_POR_CATEGORIA: Record<string, string> = {
  MVP:    "/ilustracoes/tubarao.png",
  BAGRE:  "/ilustracoes/bagre.png",
  RACUDO: "/ilustracoes/corpo-mole.png",
};

// Medalhas — badges hexagonais SVG (chave = nome exato da medalha)
export const MEDALHAS: Record<string, string> = {
  "Em chamas":         "/conquistas/Em chamas.svg",
  "Rei do mês":        "/conquistas/Rei do mês.svg",
  "Veterano":          "/conquistas/Veterano.svg",
  "Lenda":             "/conquistas/Lenda.svg",
  "Primeira vitória":  "/conquistas/Primeira vitória.svg",
  "Invicto":           "/conquistas/Invicto.svg",
  "Completo":          "/conquistas/Completo.svg",
  "Troféu Bagre":      "/conquistas/Troféu bagre.svg",
  "Raçudo do mês":     "/conquistas/Raçudo do mês.svg",
  "Alma do Grupo":     "/conquistas/Alma do Grupo.svg",
  "Consistente":       "/conquistas/Consistente.svg",
  "Irregular":         "/conquistas/Irregular.svg",
  "Mais presente":     "/conquistas/Mais presente.svg",
  "Lanterna":          "/conquistas/Lanterna.svg",
  "Rei absoluto":      "/conquistas/Rei absoluto.svg",
  "Má fase":           "/conquistas/Má fase.svg",
  "Só perde":          "/conquistas/Só perde.svg",
  "Jogador invisível": "/conquistas/Jogador invisível.svg",
  "Virada de chave":   "/conquistas/Virada de chave.svg",
};

export function getMedalha(nome: string): string | null {
  return MEDALHAS[nome] ?? null;
}

export const TRAIT_SVG: Record<string, string> = {
  "racudo":        "/traits/Racudo.svg",
  "matador":       "/traits/Matador.svg",
  "paredao":       "/traits/Paredao.svg",
  "categoria":     "/traits/Craque.svg",
  "xerife":        "/traits/Xerife.svg",
  "chorao":        "/traits/Chorao.svg",
  "paneleiro":     "/traits/Paneleiro.svg",
  "fominha":       "/traits/Fominha.svg",
  "resenha-forte": "/traits/So_resenha.svg",
  "bagre":         "/traits/Bagre.svg",
  "cone":          "/traits/Cone.svg",
  "corpo-mole":    "/traits/Corpo_mole.svg",
  "firuleiro":     "/traits/Firuleiro.svg",
  "reclamao":      "/traits/Reclamao.svg",
  "garcom":        "/traits/Garcom.svg",
};
