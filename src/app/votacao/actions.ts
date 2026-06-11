"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { gerarStories } from "@/lib/stories";

export async function criarRodada() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const jogador = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { grupoId: true },
  });
  if (!jogador) redirect("/onboarding");

  const existing = await prisma.rodada.findFirst({
    where: { grupoId: jogador.grupoId, encerrada: false },
  });
  if (!existing) {
    await prisma.rodada.create({
      data: { grupoId: jogador.grupoId },
    });
  }

  redirect("/votacao");
}

type VotoInput = {
  categoria: "MVP" | "BAGRE" | "RACUDO" | "RESENHA" | "TRAIT";
  votadoId: string;
  traitSlug?: string;
};

export async function submitVotos(rodadaId: string, votos: VotoInput[]) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const jogador = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { id: true, grupoId: true },
  });
  if (!jogador) return { error: "Jogador não encontrado." };

  const jaVotou = await prisma.voto.findFirst({
    where: { rodadaId, votanteId: jogador.id },
  });
  if (jaVotou) return { error: "Você já votou nesta rodada." };

  const rodada = await prisma.rodada.findUnique({
    where: { id: rodadaId },
    select: { grupoId: true, encerrada: true },
  });
  if (!rodada || rodada.grupoId !== jogador.grupoId || rodada.encerrada) {
    return { error: "Rodada inválida." };
  }

  try {
    await prisma.$transaction(
      votos.map((v) =>
        prisma.voto.create({
          data: {
            rodadaId,
            votanteId: jogador.id,
            votadoId: v.votadoId,
            categoria: v.categoria,
            traitSlug: v.traitSlug ?? null,
          },
        })
      )
    );

    const traitVoto = votos.find((v) => v.categoria === "TRAIT");
    if (traitVoto?.traitSlug) {
      await prisma.jogadorTrait.upsert({
        where: {
          jogadorId_traitSlug: {
            jogadorId: traitVoto.votadoId,
            traitSlug: traitVoto.traitSlug,
          },
        },
        update: { contador: { increment: 1 } },
        create: { jogadorId: traitVoto.votadoId, traitSlug: traitVoto.traitSlug },
      });
    }
  } catch {
    return { error: "Erro ao registrar votos. Tente novamente." };
  }

  try {
    await gerarStories(rodadaId);
  } catch {
    // story generation is non-critical — don't block the response
  }

  return { success: true };
}
