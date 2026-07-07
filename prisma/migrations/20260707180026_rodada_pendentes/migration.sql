-- AlterTable
ALTER TABLE "Rodada" ADD COLUMN     "pendentes" TEXT[] DEFAULT ARRAY[]::TEXT[];
