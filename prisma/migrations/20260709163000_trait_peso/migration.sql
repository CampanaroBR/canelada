-- AlterTable
-- IF NOT EXISTS: coluna já foi aplicada direto em produção antes deste
-- migration file existir (mesmo padrão usado nas rodadas anteriores desta
-- sessão) — idempotente pra "prisma migrate deploy" não falhar no próximo
-- build por já existir.
ALTER TABLE "Trait" ADD COLUMN IF NOT EXISTS "peso" INTEGER NOT NULL DEFAULT 1;
