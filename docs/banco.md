# Banco de dados (Neon + Prisma) — runbook

## Setup atual
- Projeto Neon: **canelada** (`odd-river-84426730`), Postgres 17.
- **Gestão de schema = Prisma Migrate** (migrations versionadas em `prisma/migrations/`). Baseline inicial = `0_init`.
- Build do Vercel: `prisma generate && prisma migrate deploy && next build` → **produção aplica as migrations automaticamente** no deploy.
- `prisma.config.ts` define `directUrl` com fallback (`DIRECT_URL` || `DATABASE_URL_UNPOOLED` || `DATABASE_URL`). Migrations no Neon precisam de conexão **direta (unpooled)**.

## Fluxo para mudar o schema (o jeito certo)
1. Editar `prisma/schema.prisma`.
2. `npx prisma migrate dev --name descricao_curta` — cria a migration e aplica na branch de DEV (a do `.env`).
3. Commitar a pasta da migration gerada.
4. Push → o deploy do Vercel roda `prisma migrate deploy` e aplica em **produção** sozinho.

❌ **Não usar `db push`** (causava divergência dev/prod — ver histórico).

## ⚠️ Duas branches do Neon
- **DEV** = a do `.env` local (`ep-summer-meadow-...`).
- **PROD** = branch padrão do projeto (dados reais).
- Como o `migrate deploy` roda no build (com a env de produção), prod fica em dia automaticamente. Não precisa aplicar manualmente.

## Verificação
- Tabelas em prod: `get_database_tables` (Neon MCP) no projeto `odd-river-84426730`.
- Status das migrations: `npx prisma migrate status`.
- Tabelas esperadas (13): User, Account, Session, VerificationToken, Grupo, Jogador, PushSubscription, Rodada, Voto, Trait, JogadorTrait, Story, BadgeUnlock.

## Aplicar em prod manualmente (emergência)
- Pegar a connection string **direta (unpooled)** da branch padrão (Neon console ou `get_connection_string`).
- `DATABASE_URL="<prod-unpooled>" DIRECT_URL="<prod-unpooled>" npx prisma migrate deploy`

## Histórico
- 22/06/2026: prod estava sem `BadgeUnlock`/`PushSubscription` (divergência de branch + `db push` só em dev). Tabelas criadas em prod via Neon MCP; depois adotado **Prisma Migrate** (baseline `0_init` resolvido em dev e prod) → divergência resolvida de vez.
