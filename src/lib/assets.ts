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

// Medalhas (slug = nome do Trait no banco) — SVG sem fundo
export const MEDALHAS: Record<string, string> = {
  "Em chamas":         "/conquistas/em-chamas.svg",
  "Rei do mês":        "/conquistas/rei-do-mes.svg",
  "Veterano":          "/conquistas/Veterano.svg",
  "Lenda":             "/conquistas/Lenda.svg",
  "Primeira vitória":  "/conquistas/primeira-vitoria.svg",
  "Invicto":           "/conquistas/Invicto.svg",
  "Completo":          "/conquistas/Completo.svg",
  "Troféu Bagre":      "/conquistas/trofeu-bagre.svg",
  "Raçudo do mês":     "/conquistas/racudo-do-mes.svg",
  "Alma do Grupo":     "/conquistas/alma-do-grupo.svg",
  "Consistente":       "/conquistas/Consistente.svg",
  "Irregular":         "/conquistas/Irregular.svg",
  "Mais presente":     "/conquistas/mais-presente.svg",
  "Lanterna":          "/conquistas/Lanterna.svg",
  "Rei absoluto":      "/conquistas/rei-absoluto.svg",
  "Má fase":           "/conquistas/ma-fase.svg",
  "Só perde":          "/conquistas/so-perde.svg",
  "Jogador invisível": "/conquistas/jogador-invisivel.svg",
  "Virada de chave":   "/conquistas/virada-de-chave.svg",
};

export function getMedalha(traitNome: string): string {
  return MEDALHAS[traitNome] ?? "/medalhas/em-chamas.png";
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
