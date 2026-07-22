# Changelog

Todas as mudanças relevantes do Canelada são registradas aqui, por versão.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).
Para o histórico detalhado anterior a este arquivo, ver `docs/changelog.md`.

## [Não lançado]

Mudanças já commitadas em `main`, ainda sem tag de versão.

### Ranking / pontuação
- Fonte única de traits (`src/lib/traits.ts`): ranking, MVP, Seleção e badges leem
  a mesma polaridade + pontuação por peso. Acabou a lista de pontos duplicada
  que divergia (Gol Mais Bonito/Frangueiro/etc. não contavam; Raçudo/Cone
  contavam à toa).
- Redesign visual da tela de Ranking (pódio/lista com double-bezel).

### Pesos recalibrados em produção (aplicado 2026-07-22)
Categoria 4 (GOAT), Garçom 3 (assistência), Paredão 2 (poucos goleiros),
Gol Mais Bonito 1 (estilo). Aplicado direto no banco de produção via neon
(o seed local aponta pra branch Neon ≠ produção), refletindo o `prisma/seed.ts`.

### Participação do ranking = presença, não voto
O "rodadas" por jogador passou a usar a lista de presença (`Rodada.presentes`)
em união com os votantes, em vez de só votos — quem jogou e não votou não fica
mais com a contagem a menos. Rodadas antigas sem lista de presença caem no
fallback por votantes (votar exige presença). Ver `src/lib/badges.ts`.

### Limpeza de rodadas fantasma (produção, 2026-07-22)
Removidas 3 rodadas encerradas sem nenhum voto/story (10/07 e duas duplicadas
em 12/07). Backup em branch Neon `backup-pre-delete-rodadas-fantasma-2026-07-22`.
Restam as 5 rodadas reais (06, 08, 13, 15, 20 de julho).

## [1.0.0] — 2026-07-21

Primeira versão marcada com tag — o app já estava em produção e em uso real
pelo grupo antes disso; esta tag apenas passa a dar um marco de referência
pra daqui pra frente (`git checkout v1.0.0` sempre volta pra este estado
exato).

### Resumo do que existe nesta versão
- Votação por traits (16 personagens), com peso por trait e placar ponderado.
- Seleção da Rodada (melhores/piores) com lógica testada (`src/lib/selecaoRodada.ts`).
- Gamificação: badges/medalhas com progresso.
- Cards de prêmio e personagem da semana com compartilhamento (título ao vivo,
  não mais arte assada).
- Design System (Bagre) com Storybook publicado.
- Ranking histórico, presença automática, notificações push.

### Correções recentes de destaque
- Seleção da Rodada: goleiro só aparece de um lado, piso de votos, jogador
  nunca duplicado nos dois times.
- Datas fantasma removidas do "Personagem da Semana"; pills limitadas às
  mais recentes com opção de ver o histórico completo.
- Timezone corrigido nas datas de rodada.

[Não lançado]: https://github.com/CampanaroBR/canelada/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/CampanaroBR/canelada/releases/tag/v1.0.0
