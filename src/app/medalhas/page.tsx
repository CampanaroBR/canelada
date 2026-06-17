import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
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

  // Todos os JogadorTrait do jogador atual
  const jogadorTraits = await prisma.jogadorTrait.findMany({
    where: { jogadorId: jogador.id },
    include: { trait: { select: { nome: true, descricao: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const unlockedSlugs = new Set(jogadorTraits.map(jt => jt.traitSlug));

  const lastConquista = jogadorTraits[0] ?? null;

  return (
    <MedalhasClient
      unlockedSlugs={[...unlockedSlugs]}
      lastConquista={lastConquista ? {
        slug: lastConquista.traitSlug,
        nome: lastConquista.trait.nome,
        descricao: lastConquista.trait.descricao ?? "",
      } : null}
    />
  );
}
