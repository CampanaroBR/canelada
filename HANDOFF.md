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

- **Perfil: MVP/BAGRE estavam SEMPRE 0** (bug antigo, corrigido). Contavam
  `Voto.categoria = "MVP"/"BAGRE"`, categorias que a votação **não cria mais** —
  os 1006 votos do banco são todos `TRAIT`. Agora `src/lib/perfilStats.ts`
  deriva igual às stories: **MVP = vencedor do trait `categoria` (👑)**,
  **BAGRE = vencedor do trait `bagre` (🐟)**, com o **mesmo `pickWinner`/seed**
  do `stories.ts` (senão, em rodada empatada, perfil e story mostrariam craques
  diferentes — 15/07 e 22/07 tiveram empate). ⚠️ Isso **muda o OVERALL** de quem
  já foi craque/bagre (Arthur: 78 → 83) — decidido com o usuário.
- **Perfil: PRESENÇAS** era "rodadas em que me votaram"; virou a mesma união
  `presentes ∪ votantes(votanteJogou)` do ranking/badges, pra não ter dois
  números de "rodadas" divergentes no app.
- **Perfil: PERSONAGENS = personagens VENCIDOS**, não votos recebidos. Era
  `JogadorTrait.contador` (soma de votos), que inflava tudo — "Driblador 14x"
  quando na real foram **2 rodadas vencidas**. Agora conta rodadas em que o
  jogador foi o mais votado naquele trait (mesmo `pickWinner`/seed do story).
  Quem nunca venceu um personagem não o lista mais. ⚠️ Mexe no OVERALL de novo
  (`traitBonus`): Arthur 14 personagens → **7**, OVR 83 → **82**.
- **Card de compartilhar reescrito** (`src/app/perfil/ShareStoryCard.tsx`): nó
  próprio de **1080×1920 (9:16)**, montado fora da tela só durante a captura.
  Antes o share fazia `toPng` do card da própria tela → saía quase quadrado (o
  Instagram esticava = "muito grande") e **sem a foto**, porque html-to-image não
  embute imagem cross-origin (foto do Google) — vinha só o anel verde vazio.
  Agora a foto é baixada e convertida em **data URI** antes da captura, e o
  código espera `document.fonts.ready` + todas as `<img>` decodificarem.
  Conteúdo novo: grupo, posição, top 3 personagens com miniatura, canelada.app.br.
  **Não usar `pixelRatio` >1** aqui: o nó já está no tamanho final.
- **Copy:** "vitórias" saiu da UI — em app de futebol lia-se como "ganhou X
  jogos". Agora é "7 diferentes · 8x no total".
- **Perfil: sheets de detalhe** (`src/app/perfil/StatSheets.tsx`) — tocar num
  stat abre BottomSheet: Personagens (miniatura + `Nx` de vitórias), Presenças
  (data + nº de participantes), Craque e Bagre (rodadas + votos). PERSONAGENS
  não linka mais pra `/medalhas`.
- **Miniatura = só ilustração**: `/premio/*.jpg` tem o TÍTULO assado na imagem e
  virava borrão em 44px. As sheets usam `personagemArt.ts` — `/premio-bg`
  (fundo sem título) + `/votacao-mascot` (mascote transparente) por cima.
- **`ART_BY_SLUG` virou fonte única** em `src/lib/premioArt.ts` (era hardcoded
  dentro de `feed/page.tsx`).

- **Seleção da Rodada — sem repetir jogador entre os times** (`src/lib/selecaoRodada.ts`):
  ninguém aparece nas duas escalações. Montagem em 2 passadas: (1) cada jogador
  vai pro lado PREFERIDO (maior placar; empate → piores) e cada time monta com
  o pote dele; (2) **preenchimento por sobras** — slot ainda vazio pega o melhor
  jogador livre com voto naquele lado, mesmo que o lado preferido dele seja o
  outro. É isso que mantém 5+5 cheios sem duplicar (só a passada 1, como era no
  começo, esvaziava os piores). `usados` é global e é a garantia do não-repete.
  Testes em `tests/selecaoRodada.test.ts` (48 passando).
  **Limite conhecido:** só entra nos piores quem levou voto negativo — se menos
  de 5 pessoas levaram, sobra vaga vazia (não tem como encher sem inventar).
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

- **SORTEIO DE TIMES** (feito 2026-07-29, pedido do grupo) —
  `src/lib/sorteioTimes.ts` (lógica pura, 14 testes) + tela `/votacao/sorteio`.
  Duas regras que convivem: **ordem de chegada decide QUEM joga** (os primeiros
  entram, o resto vai pra fila NA ORDEM); **nota (OVR) decide EM QUAL time** (o
  time com menos pontos escolhe primeiro). Formação **1 goleiro + 4 de linha**.
  - **Gol tem 2 níveis** (`Jogador.papelGol`): `FIXO` (Raphael, Vitor) e
    `CURINGA` (Bruno, Luiz Junior, Uili — de linha, mas pegam o gol). Curinga só
    vai pro gol se faltar fixo. ⚠️ **Não dá pra inferir goleiro dos votos** —
    quem leva Frangueiro pode ter ido pro gol de brincadeira (a 1ª tentativa
    marcou João Victor e ALABA errado).
  - **Goleiro FIXO fura a fila** pra iniciar (máx. 1 por time; quem cede a vaga é
    o último do corte). Sem isso o goleiro de verdade ficava assistindo.
  - **Ordem de chegada** mora na tabela `Chegada` — ADITIVA, ao lado de
    `_RodadaPresentes` (105 linhas, lida por ranking/badges/feed/votação). Não
    refatorar aquela relação só pra caber ordem.
  - **Convidados** (`model Convidado`): quem joga e não tem conta. **Não vota,
    não é votado, não entra em ranking/badges/Seleção** — só existe na `Chegada`.
    Nota = **média do grupo ± 8** pelo nível (`src/lib/convidados.ts`); usar o
    piso 60 trataria todo convidado como perna-de-pau. Verificado: convidados
    com a mesma nota já se ESPALHAM sozinhos entre os times, não precisou regra.
  - `notasDoGrupo()` (`perfilStats.ts`) calcula o OVR de todos numa passada —
    MESMA fórmula do perfil, senão o sorteio mostraria nota diferente da que o
    jogador vê. "Sortear de novo" usa `seed`: embaralha só quem EMPATA em nota,
    variando a dupla sem piorar o equilíbrio.
  - `salvarPresenca` recebe `ItemPresenca[]` (lista mista ordenada) e renumera
    `Chegada` do zero a cada save.
  - **Entrada:** aba Baba → card da rodada → "Sortear times".


---

### Rodada fantasma (resolvido 2026-07-29)
Rodada criada sem querer (29/07, 0 votos/0 presentes) — **não era o cron**. O
botão "⚽ BABA ROLOU HOJE" (Home e /votacao) criava rodada num TOQUE, sem
confirmação, por um caminho que não pede lista (por isso nasce vazia). É a mesma
origem das fantasmas limpas antes.
- **Correção final:** o botão SAIU da Home e da /votacao. Existe **UM caminho
  só** pra criar rodada: a aba **Baba** (`pelada/actions.ts` →
  `criarRodada(data, ids, pendentes)`), que pede data e lista. A action
  `criarRodada()` sem argumentos de `votacao/actions.ts` foi **deletada** — era
  ela que criava rodada vazia. Na Home ficou só um link "Criar rodada na aba Baba".
- Aproveitado: `getPresenca()` também foi deletada (server action exposta, sem
  chamador desde que a tela passou a carregar dados no server component).
- **Prevenção (mantida):** `BotaoCriarRodada` com confirmação em 2 toques,
  disponível caso algum fluxo volte a precisar.
- **Saída:** `BotaoExcluirRodada` no card da rodada em `/pelada` + action
  `excluirRodada` — só SUPER_ADMIN e só se a rodada estiver VAZIA (sem voto,
  presença, chegada ou story). Rodada com voto é histórico (ranking/badges leem
  dela) e nunca pode sumir por um toque.

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
      Pendente desta sessão: card do perfil redesenhado, sheets de stat, card de
      compartilhar 9:16, tela de presença nova, tela de sorteio.
- [ ] **Testar o sorteio num baba real** (seg/qua) — nada foi usado em campo
      ainda. Conferir principalmente se as NOTAS fazem sentido pro grupo; é a
      parte que gera discussão.
- [ ] **Cache do app (PWA)** — ⭐ o que mais atrapalhou nesta sessão. Duas vezes o
      usuário viu versão velha depois do deploy e reportou como bug; a segunda
      me levou a diagnosticar deploy quebrado que NÃO estava quebrado. O `sw.js`
      só faz push (sem `fetch`/`caches`), então é cache do iOS/PWA mesmo.
      Ideia: o app detectar build novo e recarregar (ou avisar "nova versão").
      **Enquanto não existir: sempre fechar e reabrir o app antes de concluir
      que algo não subiu.**
- [ ] **`middleware` deprecado** — Next 16 avisa em todo build que virou `proxy`.
- [ ] **`package.json#prisma` deprecado** — `prisma.config.ts` já existe e
      sobrepõe; é só remover a chave e o warning some.
- [ ] **Lint quebrado (pré-existente)** em `EditarPerfilSheet.tsx`,
      `VotacaoFlow.tsx` e `AdminVotosClient.tsx` (`react-hooks/set-state-in-effect`).
      Suja todo `npx eslint` — hoje só dá pra validar arquivo por arquivo.
- [ ] **`BotaoCriarRodada` ficou sem uso** (o botão saiu da Home e da /votacao).
      Manter pro futuro ou remover — decidir.

---

## Linguagem visual (estabelecida 2026-07-30)

Vale pras telas novas — perfil, presença, sorteio e card de compartilhar:
- **Double-bezel**: casca externa (`rgba(255,255,255,.035)` + hairline) com
  `padding: 5` e o núcleo dentro, com raio menor (26 → 21). Nada de card chapado
  com `1px solid #2c2c2c`.
- **Hairline** `inset 0 0 0 1px rgba(255,255,255,.06-.08)` no lugar de `border`.
- **Números com peso**: OVR/média/nota em `var(--font-numeric)` + `tabular-nums`,
  tamanho grande e cor de destaque. Número é o conteúdo, não legenda.
- **Cor por time** no sorteio (`#9fe870`, `#5cc8ff`, `#f0a44a`, `#c58cff`).
- **Transições** `cubic-bezier(0.32,0.72,0,1)` — nunca `ease-in-out`.
- **Barra de progresso/equilíbrio** em vez de texto solto quando o dado é
  comparativo (quantos faltam, quão parelho está).

## Convenções / gotchas

- Validar com `npx tsc --noEmit` e `npx vitest run` (67 testes). Não subir dev server.
- `@/` **não** resolve no Storybook — usar import relativo lá.
- DS "Bagre" é **flat** (sem degradê). Stroke cinza padrão `#2c2c2c`.
- Git às vezes dá `Operation not permitted` (TCC do macOS) — precisa Full Disk
  Access no Terminal; hoje já está funcionando.
- Commits: mensagens curtas em pt-BR, estilo dos últimos (ver `git log`).
- **Deploy automático FUNCIONA.** Todo push na `main` dispara deploy de produção.
  Nesta sessão eu li mal o `vercel ls` e concluí que estava quebrado — não
  estava, e os deploys manuais que fiz foram desnecessários. Pra checar de
  verdade: `gh api repos/CampanaroBR/canelada/commits/<sha>/status --jq .state`,
  ou `npx vercel alias ls` (mostra qual deploy serve canelada.app.br).
- **Migração em produção:** escrever o SQL IDEMPOTENTE (`IF NOT EXISTS`, `DO
  $$ ... EXCEPTION WHEN duplicate_object`), aplicar em prod pelo MCP `neon`
  ANTES do push, e deixar o `prisma migrate deploy` do build rodar depois. Assim
  build quebrado não derruba o deploy. (Foi assim com `Chegada` e `Convidado`.)
- **Validar UI sem dev server (8GB):** renderizar o componente num HTML estático
  no scratchpad, servir com `python3 -m http.server` e abrir no browser. Pegou
  bugs reais que `tsc` não pega — rótulo estourando a caixa e botão sem
  contraste. **Testar sempre sobre o fundo REAL** (ex.: o gramado `campo.jpg`).
