-- Convidados: quem joga o baba mas não tem conta no app.
-- Existem só pro sorteio — não votam, não são votados, não entram em
-- ranking/badges/Seleção.
--
-- Idempotente pelo mesmo motivo da migração anterior: produção recebe o SQL
-- direto (MCP neon) antes do build, e o `prisma migrate deploy` roda depois.

DO $$ BEGIN
  CREATE TYPE "NivelConvidado" AS ENUM ('FRACO', 'MEDIO', 'FORTE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "Convidado" (
    "id" TEXT NOT NULL,
    "grupoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "nivel" "NivelConvidado" NOT NULL DEFAULT 'MEDIO',
    "papelGol" "PapelGol",
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Convidado_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Convidado_grupoId_nome_key" ON "Convidado"("grupoId", "nome");

DO $$ BEGIN
  ALTER TABLE "Convidado" ADD CONSTRAINT "Convidado_grupoId_fkey"
    FOREIGN KEY ("grupoId") REFERENCES "Grupo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Chegada passa a aceitar convidado. `jogadorId` vira opcional: cada linha tem
-- OU jogador OU convidado. A tabela estava vazia, então dropar o NOT NULL é
-- seguro. (No Postgres, NULLs não colidem em índice único — dá pra ter várias
-- linhas de convidado com jogadorId nulo na mesma rodada.)
ALTER TABLE "Chegada" ALTER COLUMN "jogadorId" DROP NOT NULL;
ALTER TABLE "Chegada" ADD COLUMN IF NOT EXISTS "convidadoId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Chegada_rodadaId_convidadoId_key" ON "Chegada"("rodadaId", "convidadoId");

DO $$ BEGIN
  ALTER TABLE "Chegada" ADD CONSTRAINT "Chegada_convidadoId_fkey"
    FOREIGN KEY ("convidadoId") REFERENCES "Convidado"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
