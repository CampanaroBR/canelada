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
    select: { id: true, presentes: { select: { id: true } }, pendentes: true },
  });
  if (!rodada) redirect("/votacao");

  const [jogadores, chegadas] = await Promise.all([
    prisma.jogador.findMany({
      where: { grupoId: jogador.grupoId },
      select: { id: true, apelido: true, papelGol: true },
      orderBy: { apelido: "asc" },
    }),
    prisma.chegada.findMany({
      where: { rodadaId: rodada.id },
      select: { jogadorId: true },
      orderBy: { ordem: "asc" },
    }),
  ]);

  // Ordem de chegada primeiro. Rodada antiga não tem `Chegada` (tabela nova):
  // esses caem no fim, sem ordem, e o admin reordena na tela se quiser sortear.
  const ordenados = chegadas.map((c) => c.jogadorId);
  const jaOrdenado = new Set(ordenados);
  const presentesIniciais = [
    ...ordenados,
    ...rodada.presentes.map((j) => j.id).filter((id) => !jaOrdenado.has(id)),
  ];

  return (
    <PresencaClient
      rodadaId={rodada.id}
      jogadores={jogadores}
      presentesIniciais={presentesIniciais}
      pendentesIniciais={rodada.pendentes}
      isSuperAdmin={jogador.role === "SUPER_ADMIN"}
    />
  );
}
