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
  // Resiliente: se falhar, a página abre vazia em vez de dar erro de servidor.
  let unlocked: string[] = [], novos: string[] = [], progress: Record<string, { current: number; meta: number }> = {};
  try {
    ({ unlocked, novos, progress } = await badgesDoJogador(jogador.grupoId, jogador.id));
  } catch (e) {
    console.error("badgesDoJogador falhou:", e);
  }

  return (
    <MedalhasClient
      unlockedSlugs={unlocked}
      novos={novos}
      progress={progress}
    />
  );
}
