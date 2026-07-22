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

### ⚠️ PENDENTE — aplicar no banco de PRODUÇÃO (via neon, precisa restart do Claude Code)
Os pesos foram recalibrados no `prisma/seed.ts`, mas o `db push`/seed local
aponta pra uma branch Neon ≠ produção — então **precisa rodar estes UPDATEs
direto no banco de produção**:

```sql
UPDATE "Trait" SET peso = 4 WHERE slug = 'categoria';       -- GOAT
UPDATE "Trait" SET peso = 3 WHERE slug = 'garcom';          -- assistência
UPDATE "Trait" SET peso = 2 WHERE slug = 'paredao';         -- poucos goleiros
UPDATE "Trait" SET peso = 1 WHERE slug = 'gol-mais-bonito'; -- estilo
```

Depois de aplicar: validar o ranking do grupo antes/depois com os votos reais.
Enquanto os UPDATEs não rodarem, o ranking usa os pesos antigos do banco
(Categoria 3, Paredão 3, Garçom 2, Gol Mais Bonito 2).

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
