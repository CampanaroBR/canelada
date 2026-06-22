import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { computarBadges } from "@/lib/badges";
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

  // Cálculo oficial das 24 badges (docs/gamificacao.md)
  const { unlocked, progress } = await computarBadges(jogador.grupoId, jogador.id);

  return (
    <MedalhasClient
      unlockedSlugs={unlocked}
      progress={progress}
      lastConquista={null}
    />
  );
}
