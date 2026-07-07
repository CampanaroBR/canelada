-- CreateTable
CREATE TABLE "_RodadaPresentes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RodadaPresentes_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_RodadaPresentes_B_index" ON "_RodadaPresentes"("B");

-- AddForeignKey
ALTER TABLE "_RodadaPresentes" ADD CONSTRAINT "_RodadaPresentes_A_fkey" FOREIGN KEY ("A") REFERENCES "Jogador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RodadaPresentes" ADD CONSTRAINT "_RodadaPresentes_B_fkey" FOREIGN KEY ("B") REFERENCES "Rodada"("id") ON DELETE CASCADE ON UPDATE CASCADE;
