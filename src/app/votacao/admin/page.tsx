import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminVotosClient } from "./AdminVotosClient";

export const dynamic = "force-dynamic";

export default async function AdminVotosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const jogador = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { grupoId: true, role: true },
  });
  if (!jogador) redirect("/onboarding");
  if (jogador.role !== "SUPER_ADMIN") redirect("/votacao");

  const rodada = await prisma.rodada.findFirst({
    where: { grupoId: jogador.grupoId, encerrada: false },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (!rodada) redirect("/votacao");

  return <AdminVotosClient rodadaId={rodada.id} />;
}
