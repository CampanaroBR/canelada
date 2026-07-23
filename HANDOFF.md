# HANDOFF — Canelada

Documento vivo pra continuar o trabalho em novas sessões sem reexplicar tudo.
Atualizar a cada sessão: mover itens de "Em aberto" pra "Feito" e registrar decisões.

> **Dica de custo:** manter poucos MCP ligados (só o que a tarefa pede). O `neon`
> só quando for mexer no banco de produção — e desligar depois. Sessão curta por
> tarefa gasta bem menos token que uma sessão longa.

---

## Contexto do projeto

- **App:** Canelada — app gamificado de votação de baba (pelada). Só por convite.
- **Stack:** Next.js (App Router) + Prisma + Neon (Postgres) + Auth.js v5. Deploy
  automático na **Vercel** quando dá push na branch `main`.
- **Repo:** github.com/CampanaroBR/canelada · **Domínio:** canelada.app.br
- **Grupo em produção:** slug `canelada`, nome "Baba do PJ".
- **Pasta local:** `/Users/arqui/Documents/Claude/Projects/Canelada`
- **Restrição da máquina:** 8GB RAM — evitar rodar dev server/Storybook; validar
  com `npx tsc --noEmit` + `npx vitest run`.

### Banco (Neon)
- Projeto Neon: `odd-river-84426730`.
- **Produção = branch `main` `br-summer-glade-apqpx0xb`.**
- ⚠️ O `.env` local aponta pra uma branch ≠ produção — `db push`/seed local **não**
  chega em produção. Pra mexer em prod, usar o MCP `neon` com o `branchId` da main.
- Backups (branches Neon): `backup-pre-delete-rodadas-fantasma-2026-07-22`.
- **Reconectar o `neon`:** está no `~/.claude.json` (mcpServers). Se não aparecer na
  sessão, reiniciar o Claude Code. Desligar depois pra poupar RAM/token.

---

## Estado atual (feito, já no ar)

- **Seleção da Rodada — Opção B (times independentes)** (`src/lib/selecaoRodada.ts`):
  os dois times agora são "top-5 do próprio placar", cada lado independente. Um
  jogador PODE aparecer nos dois (elogiado num trait, criticado em outro) — é o
  que garante os 5 slots cheios (o pote de votados negativos é pequeno e a
  exclusividade antiga esvaziava o campo dos piores). Única exclusão cruzada que
  sobra: **ninguém é os dois goleiros** (melhor Paredão × pior Frangueiro) — fica
  no gol de mais votos e some do outro lado. Testes reescritos em
  `tests/selecaoRodada.test.ts` (44 passando). ⚠️ **Falta deploy** (push na `main`).
- **Prêmio único por time (Opção A):** cada prêmio aparece 1× por time. Os 5
  jogadores continuam os de maior placar; só o RÓTULO desduplica — quem cai num
  prêmio já usado recebe o próximo prêmio mais votado dele (ex.: 2 "Categoria" →
  o de placar menor vira o próximo dele). Goleiro reserva Paredão/Frangueiro
  primeiro. Também corrigido: `Slot.votos` agora é a contagem do prêmio EXIBIDO
  (antes era o total do jogador no lado → inflava o "eleito por N" do card).
- **Pesos negativos ajustados:** reclamão 2→1 (atitude, não é jogar mal),
  paneleiro 1→2 (panelinha atrapalha o coletivo). Escala: bagre/frangueiro 3;
  bragueiro/pregueiro/paneleiro 2; reclamão/chorão 1. **Já aplicado em produção**
  (Neon, tabela `Trait`) e no `prisma/seed.ts`. Peso negativo só afeta a Seleção
  (não soma no ranking/MVP).


- **Ranking — fonte única de traits** (`src/lib/traits.ts`): polaridade
  (positivo/negativo/social); o VALOR de cada trait é o `peso` da tabela `Trait`.
  Ranking, MVP, Seleção e badges leem daí. Fim das listas duplicadas.
- **Pontuação:** por rodada, quem é o mais votado numa trait "ganha" e leva o
  `peso` dela. Soma no período. Negativas **não descontam** (ranking nunca fica
  negativo). MVP é à parte (maior soma positiva na rodada), só contador.
- **Pesos em produção (aplicados 2026-07-22):** Categoria 4, Garçom 3, Paredão 2,
  Gol Mais Bonito 1 (demais positivas conforme seed).
- **Participação ("rodadas" do ranking):** agora é presença∪votantes
  (`src/lib/badges.ts`) — não só voto. `Rodada.presentes` é a fonte primária,
  votantes é fallback (votar exige presença). **Obs:** em produção `presentes`
  está VAZIO em todas as rodadas → hoje conta pelos votantes.
- **Limpeza de rodadas fantasma (prod):** removidas 3 rodadas encerradas sem
  voto/story (10/07 e duas de 12/07). Restam 5 reais: 06, 08, 13, 15, 20 de julho.
- **Visual do ranking:** medalhas flat (sem degradê), coroa sem sombra, botão
  compartilhar à direita, "X rodadas" no pódio. (`RankingClient.tsx`,
  `RankingPieces.tsx`.)
- **Ícones = Reicon em todo o produto:** hamburguer virou Reicon (`Menu`↔`X`,
  `HamburgerIcon.tsx`); BackButton→`ChevronLeft`; SelecaoCard→`Export`. Não há
  lib de ícone concorrente. SVGs inline que sobram são legítimos (logo WhatsApp,
  anel de progresso de badge, primitivos do DS).

---

## Como o login/convite funciona (importante p/ suporte)

- App é **só por convite** (`src/auth.ts` — callback `signIn`).
- Novo usuário precisa do cookie `convite` == `Grupo.inviteCode`. O cookie é
  gravado ao abrir `/login?convite=<code>` (middleware, server-side).
- **Link de convite:** `https://canelada.app.br/login?convite=<inviteCode>`
  (pega na tela **Grupo**). inviteCode atual do grupo está no banco (`Grupo`).
- **Causa nº1 de "trava no login" (Android):** abrir o link no **navegador
  interno do WhatsApp** — o Google bloqueia OAuth em webview, e o cookie fica no
  navegador errado. Solução: ⋮ → "Abrir no Chrome", conferir que a URL tem
  `?convite=`, e só então logar com Google.

---

## Em aberto / próximos passos

- [ ] **Suporte Vicente Naus (Android):** não consegue cadastrar; provável webview
      do WhatsApp. Instruído a abrir no Chrome com o link completo. Aguardando
      confirmação. Se persistir no Chrome: pedir print + o que acontece ao tocar
      em Google (abre conta Google? volta? erro vermelho?). Checar logs Vercel.
- [ ] **Preencher presença** das 5 rodadas reais em `/votacao/presenca` — só dá
      pra baba **aberta**; rodada encerrada não tem tela de admin. Decisão: deixar
      como está (fallback por voto cobre) OU marcar presença no dia dos próximos
      babas. Feature de editar rodada passada NÃO existe (não vale construir).
- [ ] **Espelhar no Figma** o que for novo de UI/design (regra do usuário).

---

## Convenções / gotchas

- Validar com `npx tsc --noEmit` e `npx vitest run` (41 testes). Não subir dev server.
- `@/` **não** resolve no Storybook — usar import relativo lá.
- DS "Bagre" é **flat** (sem degradê). Stroke cinza padrão `#2c2c2c`.
- Git às vezes dá `Operation not permitted` (TCC do macOS) — precisa Full Disk
  Access no Terminal; hoje já está funcionando.
- Commits: mensagens curtas em pt-BR, estilo dos últimos (ver `git log`).
