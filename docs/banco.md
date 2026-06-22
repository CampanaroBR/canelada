# Banco de dados (Neon + Prisma) — runbook

## Setup atual (IMPORTANTE)
- Projeto Neon: **canelada** (`odd-river-84426730`).
- O app usa **`db push`** (não Prisma Migrate). Sem pasta `prisma/migrations`.
- ⚠️ **Há duas branches do banco:**
  - **DEV** = a do `.env` local (`ep-summer-meadow-...`). É o que o `npm run db:push` atualiza.
  - **PROD** = a **branch padrão** do projeto Neon (a que o Vercel/produção usa, com os dados reais).
- Por causa disso, `db push` local **NÃO** chega na produção. Já causou erro 500 (tabela inexistente em prod).

## Regra de ouro
Toda alteração de `schema.prisma` precisa ser aplicada **nas duas branches**:
1. **DEV:** `npm run db:push` (usa o `.env`).
2. **PROD:** aplicar o mesmo na branch padrão do Neon (uma das opções abaixo).

## Como aplicar em PROD

### Opção A — Neon MCP (usada hoje, recomendada p/ mudanças aditivas)
Rodar o SQL equivalente direto na branch padrão do projeto `odd-river-84426730` (via `run_sql`), com os nomes que o Prisma espera (`*_pkey`, `*_key`, `*_idx`, `*_fkey`). Conferir antes/depois com `get_database_tables`.

### Opção B — db push apontando pra PROD
1. Pegar a connection string da branch padrão (Neon → Connection Details, ou `vercel env pull` se a CLI estiver instalada).
2. `DATABASE_URL="<url-de-prod>" npx prisma db push`
3. ⚠️ Usar a URL **direta** (sem `-pooler`) para DDL.

## Como evitar a divergência de vez (decidir)
- **Recomendado:** alinhar — apontar o `.env` local para a **branch padrão** (mesma de prod), ou tratar a branch de dev como descartável e sempre validar prod.
- Alternativa: migrar para **Prisma Migrate** (`migrate deploy` no build do Vercel) — mais robusto, mas exige baseline da branch atual.

## Verificação rápida
- Tabelas em prod: `get_database_tables` no projeto `odd-river-84426730`.
- Tabelas esperadas (13): User, Account, Session, VerificationToken, Grupo, Jogador, PushSubscription, Rodada, Voto, Trait, JogadorTrait, Story, **BadgeUnlock**.

## Histórico
- 22/06/2026: prod estava sem `BadgeUnlock` e `PushSubscription` (divergência de branch). Criadas via Neon MCP. App voltou a 200.
