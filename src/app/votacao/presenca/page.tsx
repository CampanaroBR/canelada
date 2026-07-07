import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PresencaClient } from "./PresencaClient";

export const dynamic = "force-dynamic";

export default async function PresencaPage() {
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
    select: { id: true, presentes: { select: { id: true } } },
  });
  if (!rodada) redirect("/votacao");

  const jogadores = await prisma.jogador.findMany({
    where: { grupoId: jogador.grupoId },
    select: { id: true, apelido: true },
    orderBy: { apelido: "asc" },
  });

  return (
    <PresencaClient
      rodadaId={rodada.id}
      jogadores={jogadores}
      presentesIniciais={rodada.presentes.map((j) => j.id)}
    />
  );
}
