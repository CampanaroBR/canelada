import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { badgesDoJogador } from "@/lib/badges";
import { MedalhasClient } from "./MedalhasClient";

export const dynamic = "force-dynamic";

export default async function MedalhasPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const jogador = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { id: true, grupoId: true },
  });
  if (!jogador) redirect("/onboarding");

  // Cálculo oficial das 24 badges (docs/gamificacao.md) + persistência/novos
  const { unlocked, novos, progress } = await badgesDoJogador(jogador.grupoId, jogador.id);

  return (
    <MedalhasClient
      unlockedSlugs={unlocked}
      novos={novos}
      progress={progress}
    />
  );
}
