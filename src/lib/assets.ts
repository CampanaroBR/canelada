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

// Mapa de categoria de voto → ilustração do personagem principal
export const MASCOTE_POR_CATEGORIA: Record<string, string> = {
  MVP:    "/ilustracoes/tubarao.png",   // Matador
  BAGRE:  "/ilustracoes/bagre.png",     // Bagre da Noite
  RACUDO: "/ilustracoes/corpo-mole.png", // Pregueiro/Raçudo
};

// Medalhas (slug = nome do Trait no banco)
export const MEDALHAS: Record<string, string> = {
  "Em chamas":        "/medalhas/em-chamas.png",
  "Rei do mês":       "/medalhas/rei-do-mes.png",
  "Veterano":         "/medalhas/veterano.png",
  "Lenda":            "/medalhas/lenda.png",
  "Primeira vitória": "/medalhas/primeira-vitoria.png",
  "Invicto":          "/medalhas/invicto.png",
  "Completo":         "/medalhas/completo.png",
  "Troféu Bagre":     "/medalhas/trofeu-bagre.png",
  "Raçudo do mês":    "/medalhas/racudo-do-mes.png",
  "Alma do Grupo":    "/medalhas/alma-do-grupo.png",
  "Consistente":      "/medalhas/consistente.png",
  "Irregular":        "/medalhas/irregular.png",
  "Mais presente":    "/medalhas/mais-presente.png",
  "Lanterna":         "/medalhas/lanterna.png",
  "Rei absoluto":     "/medalhas/rei-absoluto.png",
  "Má fase":          "/medalhas/ma-fase.png",
  "Só perde":         "/medalhas/so-perde.png",
  "Jogador invisível":"/medalhas/jogador-invisivel.png",
  "Virada de chave":  "/medalhas/virada-de-chave.png",
};

export function getMedalha(traitNome: string): string {
  return MEDALHAS[traitNome] ?? "/medalhas/em-chamas.png";
}
