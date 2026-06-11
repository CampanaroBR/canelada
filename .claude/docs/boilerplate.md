# CANELADA — Build Manual

> Adaptado do BOILERPLATE MANUAL MVP Generator para o contexto do Canelada.
> Etapas de Stripe, trial e paywall removidas — fora do MVP.
> Seguir esta ordem obrigatoriamente.

---

## PRÉ-REQUISITOS

Ferramentas necessárias na máquina:

| Ferramenta | Versão mínima | Como instalar |
|---|---|---|
| Node.js | v18+ | `brew install node` |
| npm | v9+ | Vem com Node.js |
| Git | v2+ | `brew install git` |
| GitHub CLI | v2+ | `brew install gh` |
| Claude Code | latest | `npm i -g @anthropic-ai/claude-code` |

Contas necessárias:

- [GitHub](https://github.com) — repositório
- [Vercel](https://vercel.com) — hosting (login com GitHub)
- [Neon](https://neon.tech) — banco PostgreSQL
- [Google Cloud Console](https://console.cloud.google.com) — OAuth
- [Resend](https://resend.com) — magic link emails
- [Stripe](https://dashboard.stripe.com) — configurado mas não usado no MVP

---

## DECISÕES FIXAS DO PROJETO

> Registra decisões tomadas que alteram padrões do boilerplate original.

1. **Sem trial/paywall no MVP** — Stripe está configurado mas não implementado.
2. **Sem landing page no MVP** — Primeiro o produto funciona, depois a vitrine.
3. **Middleware leve (Edge < 1MB)** — NUNCA importar Auth.js no middleware. Checa cookie `authjs.session-token` diretamente.
4. **Auth.js v5 env vars** — `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_URL`. NÃO usar `NEXTAUTH_SECRET` ou `GOOGLE_CLIENT_ID`.
5. **Prisma 6** — Não usar Prisma 7 (breaking changes).
6. **Prisma + Neon** — `new PrismaNeon({ connectionString })` passado via `{ adapter }`.
7. **Toast → Sonner** — Componente `toast` do shadcn/ui depreciado. Usar `sonner`.
8. **React Compiler: No** — Não ativar React Compiler experimental.
9. **`transition: all` proibido** — Sempre especificar propriedades exatas.
10. **`h-screen` proibido** — Usar `h-dvh` ou `min-h-[100dvh]`.
11. **Grupo único no MVP** — Um grupo fixo para o condomínio.
12. **Sem overall de jogador** — Fora do MVP.
13. **Sem gols e assistências** — Fora do MVP.
14. **Dark mode exclusivo** — Light mode no roadmap pós-MVP.
15. **Vercel via GitHub** — Deploy automático no push para `main`.
16. **Stripe lazy init** — Proxy pattern para evitar crash no build.
17. **Build script** — `prisma generate && next build` para gerar cliente no Vercel.

---

## ETAPAS DE BUILD — ORDEM OBRIGATÓRIA

### ✅ ETAPA 0 — INFRAESTRUTURA
### ✅ ETAPA 1 — SCHEMA DO BANCO (Prisma + Neon)
### ✅ ETAPA 2 — AUTENTICAÇÃO (Auth.js v5)
### ✅ ETAPA 3 — TELA DE LOGIN (`/login`)
### ⏳ ETAPA 4 — ONBOARDING (`/onboarding`)
### ⏳ ETAPA 5 — FEED (`/feed`)
### ⏳ ETAPA 6 — VOTAÇÃO (`/votacao`)
### ⏳ ETAPA 7 — PERFIL (`/perfil/[apelido]`)
### ⏳ ETAPA 8 — RANKING (`/ranking`)
### ⏳ ETAPA 9 — STORIES AUTOMÁTICAS
### ⏳ ETAPA 10 — SELEÇÃO DA RODADA
### ⏳ ETAPA 11 — COMPARTILHAMENTO WHATSAPP
### 🔮 ETAPA 12 — PÓS-MVP
