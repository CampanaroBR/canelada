import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rankingGrupo } from "@/lib/badges";
import { RankingClient } from "./RankingClient";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const jogador = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { id: true, grupoId: true, apelido: true, grupo: { select: { nome: true } } },
  });
  if (!jogador) redirect("/onboarding");

  const ranking = await rankingGrupo(jogador.grupoId);

  return <RankingClient ranking={ranking} grupoNome={jogador.grupo.nome} meuId={jogador.id} />;
}
