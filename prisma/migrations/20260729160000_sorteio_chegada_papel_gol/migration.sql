-- Sorteio de times: ordem de chegada + papel no gol.
--
-- Escrita de forma IDEMPOTENTE de propósito. Motivo: a coluna
-- `Voto.votanteJogou` foi aplicada direto em produção (hotfix, sem migração),
-- então produção já a tem e um ambiente novo não. Com IF NOT EXISTS a mesma
-- migração serve pros dois e o histórico volta a bater.

-- 1) Alinha o hotfix de votanteJogou (já existe em produção).
ALTER TABLE "Voto" ADD COLUMN IF NOT EXISTS "votanteJogou" BOOLEAN NOT NULL DEFAULT true;

-- 2) Papel no gol. FIXO = goleiro de verdade; CURINGA = linha que pega o gol.
DO $$ BEGIN
  CREATE TYPE "PapelGol" AS ENUM ('FIXO', 'CURINGA');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Jogador" ADD COLUMN IF NOT EXISTS "papelGol" "PapelGol";

-- 3) Ordem de chegada. Tabela À PARTE de `_RodadaPresentes` (que tem ~105
--    linhas e é lida por ranking/badges/feed/votação) — aditivo, sem tocar no
--    que já funciona.
CREATE TABLE IF NOT EXISTS "Chegada" (
    "id" TEXT NOT NULL,
    "rodadaId" TEXT NOT NULL,
    "jogadorId" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "chegouEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chegada_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Chegada_rodadaId_jogadorId_key" ON "Chegada"("rodadaId", "jogadorId");
CREATE INDEX IF NOT EXISTS "Chegada_rodadaId_ordem_idx" ON "Chegada"("rodadaId", "ordem");

DO $$ BEGIN
  ALTER TABLE "Chegada" ADD CONSTRAINT "Chegada_rodadaId_fkey"
    FOREIGN KEY ("rodadaId") REFERENCES "Rodada"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Chegada" ADD CONSTRAINT "Chegada_jogadorId_fkey"
    FOREIGN KEY ("jogadorId") REFERENCES "Jogador"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
