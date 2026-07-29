import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notasDoGrupo } from "@/lib/perfilStats";
import { SorteioClient } from "./SorteioClient";

export const dynamic = "force-dynamic";

export default async function SorteioPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const jogador = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { grupoId: true, role: true },
  });
  if (!jogador) redirect("/onboarding");
  if (jogador.role !== "ADMIN" && jogador.role !== "SUPER_ADMIN") redirect("/votacao");

  const rodada = await prisma.rodada.findFirst({
    where: { grupoId: jogador.grupoId, encerrada: false },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (!rodada) redirect("/votacao");

  // A ordem de chegada É a fila do sorteio. Sem chegada marcada não há o que
  // sortear — a tela manda o admin pra /votacao/presenca.
  const [chegadas, notas] = await Promise.all([
    prisma.chegada.findMany({
      where: { rodadaId: rodada.id },
      orderBy: { ordem: "asc" },
      select: { jogador: { select: { id: true, apelido: true, foto: true, papelGol: true } } },
    }),
    notasDoGrupo(jogador.grupoId),
  ]);

  const fila = chegadas.map((c) => ({
    id: c.jogador.id,
    apelido: c.jogador.apelido,
    foto: c.jogador.foto ?? "",
    // O lib de sorteio usa minúsculo; o enum do banco é maiúsculo.
    gol: c.jogador.papelGol === "FIXO" ? ("fixo" as const)
       : c.jogador.papelGol === "CURINGA" ? ("curinga" as const)
       : undefined,
    nota: notas.get(c.jogador.id) ?? 60,
  }));

  return <SorteioClient fila={fila} />;
}
