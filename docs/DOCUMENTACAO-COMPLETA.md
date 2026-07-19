# CANELADA — Documentação Completa do Produto

> Documento-mestre consolidado. Reúne visão de produto, regras de negócio,
> sistema de traits, gamificação, design system e stack técnica.
> Fontes: `.claude/docs/product-spec.md`, `docs/gamificacao.md`, `docs/banco.md`,
> `.claude/docs/design.md`, `.claude/docs/ramp-design.md`, `CLAUDE.md` e o código
> (`prisma/seed.ts` = fonte-da-verdade das traits).
> Gerado em 2026-07-19.

---

## SUMÁRIO

1. [Visão do Produto](#1-visão-do-produto)
2. [Problema e Solução](#2-problema-e-solução)
3. [Público-alvo e Posicionamento](#3-público-alvo-e-posicionamento)
4. [Como funciona o baba](#4-como-funciona-o-baba)
5. [Funcionalidades](#5-funcionalidades)
6. [Regras de Negócio](#6-regras-de-negócio)
7. [Sistema de Traits](#7-sistema-de-traits-fonte-da-verdade-prismaseedts)
8. [Gamificação e Badges](#8-gamificação-e-badges)
9. [Cálculo automático de MVP](#9-cálculo-automático-de-mvp-opção-b)
10. [Loop central e métricas](#10-loop-central-e-métricas)
11. [Design System](#11-design-system)
12. [Stack Técnica](#12-stack-técnica)
13. [Banco de Dados](#13-banco-de-dados)
14. [Roadmap](#14-roadmap)

---

## 1. Visão do Produto

**Canelada** é uma **rede social gamificada para grupos de baba** (pelada / society).

O objetivo não é controlar o jogo. É **transformar o baba em uma experiência social contínua**, criando rivalidade, reconhecimento, resenha, memória coletiva e identidade dos jogadores.

> O futebol acontece das 20h às 22h. A resenha continua a semana inteira.

**Proposta de valor:** "Canelada transforma o baba em uma experiência social memorável."

**Pilares:**
1. **Resenha** — a funcionalidade principal
2. **Reconhecimento** — todo mundo quer aparecer
3. **Rivalidade** — mantém o interesse entre os babas
4. **Compartilhamento** — WhatsApp é essencial

---

## 2. Problema e Solução

**Problema:** o baba gera histórias, zoações, rivalidades e momentos memoráveis, mas **tudo desaparece no WhatsApp**. Não existe lugar para guardar a história do grupo, registrar destaques, acompanhar rankings/evolução, gerar conteúdo compartilhável e manter a resenha viva.

**Solução:** Canelada transforma cada noite de baba em rankings sociais, traits e conquistas acumuladas, seleção da rodada, histórias automáticas e um feed social com conteúdo gerado automaticamente.

---

## 3. Público-alvo e Posicionamento

**Primário:** homens entre 35 e 60 anos que jogam baba semanalmente, usam WhatsApp diariamente e gostam de competir e zoar os amigos.

**Motivações:** ser reconhecido, aparecer na seleção, ser MVP, provocar os amigos, compartilhar resultados, participar da resenha.

**Personalidade da marca:** divertido, brasileiro, competitivo, amigável, irreverente, moderno. **Nunca:** infantil, gamer/estética "gaming", exageradamente técnico, complexo.

**Posicionamento:**
- ❌ Não somos: Fut7, SofaScore, gestão esportiva
- ✅ Somos: a **rede social do baba**

---

## 4. Como funciona o baba

**Estrutura:** 5x5 (1 goleiro + 4 de linha).

**Primeiro baba (20h):**
- Os 10 primeiros entram automaticamente
- Dois jogadores batem par ou ímpar e escolhem os times
- Duração: 15 minutos, sem limite de gols

**Demais babas:**
- Duração: 10 minutos ou 2 gols
- Quem vence permanece em quadra
- Quem perde sai; novos jogadores entram por ordem de chegada

---

## 5. Funcionalidades

| # | Funcionalidade | Rota | Status |
|---|---|---|---|
| 5.1 | **Feed** — tela principal, story cards gerados por rodada, FAB "Baba rolou hoje" | `/feed` | ✅ |
| 5.2 | **Votação** (Resumo da Rodada) — fluxo de steps, ~1 min | `/votacao` | ✅ |
| 5.3 | **Perfil do Jogador** — hero, stats, grid hexagonal de traits, histórico | `/perfil/[apelido]` | ✅ |
| 5.4 | **Seleção da Rodada** — 1 goleiro + 4 de linha, automática | (feed) | ✅ card / 🔲 share |
| 5.5 | **Rankings** — tabs por categoria, hero + pódium | `/ranking` | ✅ |
| 5.6 | **Traits** — reputação/personalidade acumuladas | (perfil/votação/feed) | ✅ |
| 5.7 | **Conquistas / Badges** | `/medalhas` | 🔲 parcial |
| 5.8 | **Stories automáticas** — narrativas pós-rodada | (feed) | ✅ |
| 5.9 | **Cards compartilháveis** (WhatsApp) | `/premio/[categoria]` | 🟡 em evolução |

**Votação — perguntas obrigatórias:** MVP, Bagre, Raçudo, Resenha, e qual Trait merece o escolhido. **Opcional (pós-MVP):** gols, assistências.

**Stories — tipos:** `MVP`, `BAGRE`, `TRAIT_CONQUISTADA`, `SELECAO` (implementados); `SEQUENCIA` (pós-MVP). Ex.: *"Arthur encerrou uma sequência de 5 derrotas."*

---

## 6. Regras de Negócio

- Qualquer jogador autenticado pode marcar "Baba rolou hoje".
- Uma rodada fica aberta para votação por **24h**.
- Cada jogador vota **uma vez** por rodada.
- Traits são **acumulativas** — pode-se ter a mesma trait várias vezes.
- A seleção da rodada é gerada **automaticamente** ao fechar a votação.
- **Single-group:** o app força todos no grupo fixo ("canelada"), sem multi-tenant. A entrada é protegida por `inviteCode` (cookie + callback de signIn).
- **Autenticação:** Google OAuth + Email Magic Link (Resend), sessão via Auth.js v5 (JWT). Rotas protegidas: `/feed`, `/votacao`, `/perfil`, `/ranking`, `/onboarding`. Pública: `/login`.

---

## 7. Sistema de Traits (fonte-da-verdade: `prisma/seed.ts`)

As traits são votáveis e acumulativas. Cada uma tem `slug`, `nome`, `categoria` (FUTEBOL / PERSONALIDADE / RESENHA), `emoji`, `descricao` e `peso` (usado no cálculo automático de MVP). Ilustrações SVG em `/public/traits/`, mapeadas em `VotacaoFlow.tsx → TRAIT_SVG`.

### 7.1 Traits votáveis

#### Futebol (positivas)
| Slug | Nome | Emoji | Peso | Descrição |
|---|---|---|---|---|
| `categoria` | Categoria | 👑 | 3 | O dono da bola e do campo. Humilha todo mundo com categoria. |
| `matador` | Matador | ⚽ | 3 | Especialista em finalizar jogadas e balançar as redes. |
| `paredao` | Paredão | 🧤 | 3 | Intransponível na defesa. Salvou o time nos momentos decisivos. |
| `racudo` | Raçudo | 💪 | 2 | Se destaca pela entrega, intensidade e vontade de vencer. |
| `xerife` | Xerife | 👊 | 2 | Lidera dentro de campo, organiza o time e assume responsabilidade. |
| `garcom` | Garçom | 🥂 | 2 | Enxerga o jogo. Cria oportunidades e distribui assistências. |
| `driblador` | Driblador | ⚽💨 | 2 | Desmonta a marcação com dribles, velocidade e habilidade. |
| `gol-mais-bonito` | Gol Mais Bonito | 🎯 | 2 | A pintura da noite. Marcou o gol mais bonito da rodada. |

#### Personalidade
| Slug | Nome | Emoji | Peso | Descrição |
|---|---|---|---|---|
| `resenha-forte` | Só Resenha | 🎤 | 1 | Animação e energia do grupo. E não joga nada! 😂 |
| `delegado` | Delegado | 🔒⚽ | 1 | A bola é dele. O resto do time só acompanha. |
| `chorao` | Chorão | 😭 | 1 | Sempre acha um motivo para lamentar. |
| `reclamao` | Reclamão | 😡 | 2 | Questiona decisões, marcações e jogadas com frequência. |
| `paneleiro` | Paneleiro | 🍳 | 1 | Prefere jogar sempre com os mesmos parceiros. |
| `catimbeiro` | Catimbeiro | 🐢 | — | (zoeira) |
| `fominha` | Fominha | 🐷 | — | (zoeira) |

#### Resenha (negativas + zoeira)
| Slug | Nome | Emoji | Peso | Descrição |
|---|---|---|---|---|
| `bagre` | Bagre da Noite | 🐟 | 3 | A pior atuação da rodada. |
| `frangueiro` | Frangueiro | 🐔 | 3 | Goleiro que toma gol bobo. |
| `firuleiro` | Firuleiro | 🎭 | 1 | Tenta o drible difícil quando o passe simples resolvia. |
| `pregueiro` | Pregueiro | 🦥 | 2 | Corre pouco, economiza energia. |
| `bragueiro` | Bragueiro | 🐴 | 2 | Entrega a bola pro adversário com passe errado. |
| `cone` | Cone | 🚧 | 1 | Pouca participação. A bola bateu e voltou. |
| `corpo-mole` | Corpo Mole | 🛋️ | — | Corre pouco. |
| `perna-de-pau` | Perna de Pau | 💀 | — | (zoeira) |
| `chegou-agora` | Chegou Agora | 🐌 | — | (zoeira) |

### 7.2 Taxonomia (para efeito de badge)
- 🟢 **Positivas:** Categoria, Matador, Paredão, Raçudo, Xerife, Garçom, Driblador (+ Gol Mais Bonito). Contam para MVP, sequências, Querido da Galera, Lenda.
- 🔴 **Negativas de verdade:** Bagre da Noite, Cone, Pregueiro (+ Frangueiro/Bragueiro). Contam para "Virada de Chave" e quebram o Invicto.
- 💬 **Sociais / zoeira:** Só Resenha, Delegado, Chorão, Reclamão, Paneleiro, Firuleiro. Contam para Resenha Forte, **não** dão MVP e **não** quebram o Invicto.

> **Decisão fechada:** Firuleiro é social — conta para Resenha Forte, não dá MVP, não quebra Invicto.
> A aba **"Os piores"** (home) é só agrupamento visual (negativos + sociais); as sociais continuam sociais para badge.

---

## 8. Gamificação e Badges

Fonte única: `docs/gamificacao.md` (v2). São **24 badges** em 5 grupos, com 4 tiers de raridade.

### Fontes de dados por jogador
`participacoes_total`, `participacoes_consecutivas`, `mvps_total`, `mvps_mes`, `streak_traits_positivas`, `streak_part_positiva`, `contagem_traits_positivas`, `contagem_trait_racudo`, `contagem_traits_sociais`, `ultima_trait_negativa_rodada`, `badges_desbloqueadas[]`.

### Matriz das 24 badges
**Presença:** Primeira Pelada (1), Veterano (10), Casca Grossa (25), Mais Presente (100% do mês), Alma do Grupo (80% em 3 meses), Hall da Fama (50), Lenda do Baba (100 part + 5 MVP + 50 positivas).

**Performance (MVP por pontos):** MVP (1x), Rei Absoluto (5), Craque da Galera (10), Rei do Mês (mais MVPs no mês), Craque Histórico (20).

**Sequências:** Em Chamas (3 positivas seguidas), Imparável (5), Invicto (10), Consistente (8 rodadas com presença + positiva), Virada de Chave (negativa → positiva).

**Reconhecimento:** Operário (Raçudo 5x), Raçudo do Mês, Resenha Forte (20 sociais), Querido da Galera (50 positivas).

**Coleção:** Colecionador (8 badges), Mestre da Resenha (16), Completo! (todas).

### Raridades (4 tiers)
| Raridade | Cor | Qtd |
|---|---|---|
| ⚪ Comum | `#9b9b9b` | 9 |
| 🔵 Incomum | `#5aa9e6` | 6 |
| 🟣 Rara | `#a978f0` | 5 |
| 🥇 Épica | `#e2c485` (borda `#7a5c28`) | 4 |

> **Nota de reconciliação:** `prisma/seed.ts` também cadastra badges como traits especiais (em-chamas, rei-do-mes, veterano, lenda, invicto, etc.) para exibição. A regra de negócio canônica das badges é `docs/gamificacao.md`; a lista votável/exibível vive no seed.

---

## 9. Cálculo automático de MVP (Opção B)

Não há votação separada de MVP. O **MVP da rodada** é quem soma **mais pontos de traits positivas** naquela rodada (via `peso`). Não é fixo — muda conforme o desempenho.

**Empate:** vence quem tiver a trait de maior peso (Categoria > Matador/Paredão > demais). Persistindo, **MVP compartilhado**. Lógica de desempate em `src/lib/tieBreak.ts`.

Cadeia de progressão:
```
trait positiva → pontos da rodada → MVP da rodada → Rei Absoluto (5) → Craque da Galera (10) → Craque Histórico (20)
```

---

## 10. Loop central e métricas

```
Baba encerra
→ Qualquer jogador marca "Baba rolou hoje"
→ Janela de votação abre (24h)
→ Cada jogador vota: MVP, Bagre, Raçudo, Resenha, Trait
→ Feed gera stories automáticas
→ Cards compartilháveis são gerados
→ Grupo compartilha no WhatsApp
→ Resenha continua a semana no feed
```

**North Star:** % do grupo que vota após cada baba.
**Secundárias:** retenção semanal, stories compartilhadas no WhatsApp, sessões/semana por usuário.
**Instrumentação:** PostHog (eventos e comportamentos).

---

## 11. Design System

Design System próprio ("Bagre") em `src/ds/` + Storybook. Tokens do Figma (arquivo `cyuao5ahsV5DB07kaiFfPW`). Referência de método: Ramp DESIGN.md (paleta marketing adaptada ao dark).

### Regra de ouro
**Nunca hardcode hex ou px.** Sempre `var(--token)`.

### Tokens (CSS variables)
- **Brand/Green:** `--green #9fe870`, `--green-pale #e2f6d5`, `--green-mid #c5edab`, `--green-deep #163300`
- **Blue:** `--blue #2563EB` · **Orange:** `--orange #f97316` · **Danger:** `--danger #dc2626`
- **Ink (neutros):** `--ink #0e0f0c`, `--ink2 #454745`, `--ink3 #868685`, `--ink4 #c8ccc5`
- **Surface:** `--bg #e8ebe6`, `--card #fff`, `--subtle #f4f6f1`, `--subtle2 #eef0eb`
- **Borders:** `--brd rgba(14,15,12,.07)`, `--brd2 rgba(14,15,12,.14)`
- **Sombras:** `--s1/--s2/--s3` · **Radius:** `--r-sm 8` → `--r-2xl 24` → `--r-pill 9999`

> Observação: coexistem duas fontes de token (o `design.md` de primitivos e o `ramp-design.md`/`tokens.css`). O `tokens.ts` em `src/ds` é o efetivo em runtime.

### Tipografia
**Inter** (Google Fonts). Display 1 56/900, H1 24/800, Body MD 13/400-500, Label MD 13/700, Label XS 10/700.

### Ícones
**Phosphor Icons** (`@phosphor-icons/react`). Não instalar outra biblioteca de ícones.

### Organização
```
src/
  ds/            # Design System (componentes + stories + tokens)
  components/    # ui / feed / layout
  styles/        # tokens.css, base.css
  assets/icons/  # SVGs do Figma
```

---

## 12. Stack Técnica

- **Framework:** Next.js (App Router) + TypeScript
- **UI:** Design System próprio + Storybook, Tailwind/shadcn, Phosphor Icons
- **Auth:** Auth.js v5 (JWT) — Google OAuth + Magic Link (Resend)
- **DB:** Neon Postgres 17 + Prisma (Migrate)
- **Analytics:** PostHog
- **Rate limit:** Upstash (fail-open; só ativa com envs em prod)
- **Push:** Web Push (`src/lib/webpush.ts`, `pushClient.ts`)
- **Deploy:** Vercel (build roda `prisma generate && prisma migrate deploy && next build`)
- **Testes:** Vitest
- **Crons:** Vercel (abrir/encerrar votação)

---

## 12.1 Decisões Técnicas Fixas (do `boilerplate.md`)

> Decisões que alteram padrões default e **não podem ser violadas** sem quebrar build/produção.

1. **Sem trial/paywall no MVP** — Stripe configurado mas não implementado.
2. **Sem landing page no MVP** — primeiro o produto funciona, depois a vitrine.
3. **Middleware leve (Edge < 1MB)** — NUNCA importar Auth.js no middleware; checa o cookie `authjs.session-token` diretamente.
4. **Auth.js v5 env vars** — usar `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_URL`. **NÃO** usar `NEXTAUTH_SECRET`/`GOOGLE_CLIENT_ID`.
5. **Prisma 6** — não subir para Prisma 7 (breaking changes).
6. **Prisma + Neon** — `new PrismaNeon({ connectionString })` via `{ adapter }`.
7. **Toast → Sonner** — o `toast` do shadcn está depreciado; usar `sonner`.
8. **React Compiler: Não** — não ativar o experimental.
9. **`transition: all` proibido** — sempre especificar as propriedades exatas.
10. **`h-screen` proibido** — usar `h-dvh` ou `min-h-[100dvh]`.
11. **Grupo único no MVP** — um grupo fixo.
12. **Sem overall de jogador** — fora do MVP.
13. **Sem gols e assistências** — fora do MVP.
14. **Dark mode exclusivo** — light mode no roadmap pós-MVP.
15. **Vercel via GitHub** — deploy automático no push para `main`.
16. **Stripe lazy init** — proxy pattern para evitar crash no build.
17. **Build script** — `prisma generate && next build` para gerar o cliente no Vercel.

**Pré-requisitos de setup:** Node 18+, npm 9+, Git 2+, GitHub CLI, Claude Code. Contas: GitHub (repo), Vercel (hosting), Neon (Postgres), Google Cloud (OAuth), Resend (magic link), Stripe (configurado, não usado no MVP).

---

## 13. Banco de Dados

- **Projeto Neon:** `canelada` (`odd-river-84426730`), Postgres 17.
- **Schema:** Prisma Migrate (migrations versionadas em `prisma/migrations/`, baseline `0_init`).
- **13 tabelas:** User, Account, Session, VerificationToken, Grupo, Jogador, PushSubscription, Rodada, Voto, Trait, JogadorTrait, Story, BadgeUnlock.

### Fluxo de mudança de schema (o jeito certo)
1. Editar `prisma/schema.prisma`
2. `npx prisma migrate dev --name descricao_curta`
3. Commitar a migration gerada
4. Push → Vercel roda `prisma migrate deploy` e aplica em produção sozinho

❌ **Não usar `db push`** (causava divergência dev/prod).

### ⚠️ Duas branches do Neon
- **DEV** = a do `.env` local · **PROD** = branch padrão (dados reais).
- `migrate deploy` roda no build com env de produção → prod fica em dia automaticamente.

### Emergência (aplicar em prod manual)
```bash
DATABASE_URL="<prod-unpooled>" DIRECT_URL="<prod-unpooled>" npx prisma migrate deploy
```

---

## 14. Roadmap

**Próxima prioridade:**
1. Cards compartilháveis (WhatsApp) — maior alavanca de crescimento orgânico
2. Push notifications — lembrete de votação aberta
3. Gols e assistências na votação
4. Sistema de conquistas/badges
5. Overall do jogador

**Médio prazo:** múltiplos grupos (muda arquitetura), perfil com foto real, comentários no feed.

**Fora do escopo atual:** landing page pública, Stripe/pagamentos, app nativo (iOS/Android).

---

## Arquivos-fonte

| Tema | Arquivo |
|---|---|
| Product spec / PRD | `.claude/docs/product-spec.md` |
| Gamificação (fonte única) | `docs/gamificacao.md` |
| Banco de dados (runbook) | `docs/banco.md` |
| Tokens primitivos | `.claude/docs/design.md` |
| Design system rules | `.claude/docs/ramp-design.md` |
| Instruções do projeto | `CLAUDE.md` |
| Traits (verdade em código) | `prisma/seed.ts` |
| Lógica de badges | `src/lib/badges.ts`, `src/lib/conquistas.ts` |
| Desempate MVP | `src/lib/tieBreak.ts` |
| Stories | `src/lib/stories.ts` |
