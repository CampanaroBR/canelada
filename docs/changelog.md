# CANELADA — Changelog / Histórico de Evolução

> Linha do tempo real do produto, reconstruída a partir do histórico git.
> **558 commits** entre **10/06/2026** e **17/07/2026** (~5,5 semanas).
> Agrupado por fases e temas, não commit a commit. Gerado em 2026-07-19.

---

## Visão geral das fases

| Fase | Período | Foco |
|---|---|---|
| **0 — Fundação** | 10–13 jun | Infra, Auth, banco, design system inicial |
| **1 — Telas core** | 14–19 jun | Feed, votação, perfil, ranking, medalhas (pixel-perfect Figma) |
| **2 — Prêmios & performance** | 20–22 jun | Seleção da Rodada, arte "premium", otimização pesada, Prisma Migrate |
| **3 — Refino & gamificação** | 23 jun – 06 jul | Badges com progresso, ajustes de UX, estabilização |
| **4 — Produção & feedback real** | 07–17 jul | Reformulação da votação, regras de negócio refinadas, consolidação no DS |

Intensidade: pico de atividade em **07/07 (45 commits)** e **22/06 (35)**. A curva mostra o padrão de um MVP — explosão inicial de construção, depois iterações menores guiadas por uso real.

---

## Fase 0 — Fundação (10–13 jun)

- Init do projeto: **Next.js 16 + Design System Canelada**.
- **Autenticação Auth.js v5** — Google OAuth + Magic Link (Resend), middleware leve (checa cookie, não importa Auth.js).
- Integração **Prisma 6 + Neon** (adapter `PrismaNeon`, WebSocket serverless).
- Primeiras decisões fixas: dark mode exclusivo, tokens dark (`#0a0a0a`/`#141414`), build com `prisma generate`.
- Docs de projeto: `CLAUDE.md`, `product-spec.md`, `boilerplate.md`.
- **Onboarding** — apelido cria Jogador + Grupo.

## Fase 1 — Telas core (14–19 jun)

- **Home/Login redesenhados do Figma** (várias telas pixel-perfect).
- **Fluxo de votação** fullscreen (`/votacao`) com ilustrações SVG por trait.
- **Perfil do jogador** — hero dramático, stats, grid hexagonal de traits, histórico.
- **Ranking** — pódium + tabs por categoria.
- **Stories automáticas** geradas após cada voto.
- **Medalhas** — catálogo de badges, bottom sheets, estados (votou/não votou no campinho).
- **Push notifications** para "votação aberta".
- Migração de assets `localhost:3845` → arquivos locais + **Phosphor Icons**.
- Muitos ajustes de layout mobile (safe-area, glass iOS, overlays `position:fixed`).

## Fase 2 — Prêmios & performance (20–22 jun)

- **Seleção da Rodada** no campinho (posição ↔ trait: GK=Paredão, linha=Matador/Categoria/Raçudo/Garçom).
- Tabs **"Os melhores / Os piores"** (agrupamento visual).
- **Arte "premium" dos prêmios** — 16 artes "baked" (mascote + título) com botão de compartilhar, ~100K cada.
- **Personagem da Semana** — traits mais votadas (filtro ≥40% +3), top 3 + "Ver mais".
- **Performance pesada:**
  - Imagens rasterizadas: `public` de **180 MB → 14 MB**.
  - Migração para **next/image** (webp/avif automático, lazy load).
  - **Fontes self-hosted** via next/font (remove render-blocking do Google Fonts).
  - Modais lazy-loaded via next/dynamic.
- **Prisma Migrate adotado** (baseline `0_init`) — resolve a divergência dev/prod de vez.
- Acessibilidade: pinch-zoom liberado, contraste AA, focus-visible, headings semânticos.

## Fase 3 — Refino & gamificação (23 jun – 06 jul)

- **Badges com barras de progresso** — progresso calculado por métricas de trait/voto.
- Refinamentos de navbar (iOS liquid-glass), badges pixel-perfect, tokens consolidados.
- Estabilização geral e ajustes de fidelidade ao Figma.

## Fase 4 — Produção & feedback real (07–17 jul)

> A fase mais reveladora: com o app no ar e usuários reais, apareceram caminhos que não tinham sido mapeados no início.

**Reformulação do fluxo de votação (guiada por uso):**
- Fluxo **híbrido**: 4 heroes obrigatórios + lista compacta pro resto.
- **Enxugamento de traits por feedback:** 18 → 15 → **12 traits votáveis** (cortes de redundâncias: Raçudo/Firuleiro/Resenha-forte, troca Chorão↔Reclamão).
- Picker vira **bottom sheet em grid 3×**.
- **Seleção da Rodada por placar ponderado** (peso × votos), com cores próprias por time e correção do GK.
- **Regra de presença:** exige presença marcada pra **votar** (não só pra ser votado).

**Regras de negócio novas/refinadas:**
- Fechamento da votação ajustado (15h → **20h do dia seguinte**).
- **Só super-admin cria rodada**, e apenas **segunda/quarta** (com fix de bug de fuso).
- **Gol Mais Bonito** promovido a **5ª pergunta obrigatória** (era opcional).
- **Fallback pra fechar rodada** quando o cron da Vercel falha em silêncio.

**Feed & engajamento:**
- Sino de notificações abre painel com **status da votação**.
- **Cobrar quem não votou** no WhatsApp (admins) — vira item no sino.
- Compartilhar votação aberta; "Votar agora" respeita presença.

**Consolidação no Design System (o marco de arquitetura):**
- **`ShareArtCard` extraído** — `PremioScreen` e `ShareCardModal` eram cópias quase idênticas de lógica de geração/compartilhamento de imagem, fora do DS e sem documentação. Consolidadas num único componente auditado e documentado no Storybook.
- Último ajuste registrado (17/07): correção de **4 pontos do feed/prêmios apontados pelo usuário**.

---

## Números do MVP

- **29 usuários** cadastrados (todos jogadores ativos).
- **558 commits** em ~5,5 semanas.
- `public`: 180 MB → 14 MB (−92%) após otimização.
- Traits votáveis: 18 → 12 (curadoria por feedback real).
- Instrumentação de métricas: **PostHog**.

---

## Aprendizados registrados no código

1. **Não dá pra prever todos os cenários no papel.** As regras mais importantes (presença pra votar, quem cria rodada, quando fecha) só apareceram com o app em produção.
2. **Duplicação custa caro sem design system.** A lógica de card de prêmio vivia duplicada em dois arquivos até virar o `ShareArtCard` — depois disso, gerar um novo prêmio virou consulta, não reinvenção.
3. **Performance é feature.** A redução de 180 MB → 14 MB e o self-host de fontes foram decisões deliberadas, não acidentes.
4. **Curadoria > acumulação.** Cortar de 18 pra 12 traits deixou a votação mais rápida (~1 min) e mais fiel ao que o grupo realmente usa.

> Fonte: `git log` do repositório. Para o detalhe commit a commit, use `git log --oneline` no projeto.
