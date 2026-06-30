"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { gerarStories } from "@/lib/stories";
import { rateLimit } from "@/lib/ratelimit";

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

  if (!(await rateLimit("voto", jogador.id, 8, "1 m")).ok) {
    return { error: "Muitas tentativas. Tente em instantes." };
  }

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

  // Segurança: só permite votar em jogadores do mesmo grupo e nunca em si mesmo.
  const membros = await prisma.jogador.findMany({
    where: { grupoId: jogador.grupoId },
    select: { id: true },
  });
  const validos = new Set(membros.map((m) => m.id));
  const algumInvalido = votos.some((v) => v.votadoId === jogador.id || !validos.has(v.votadoId));
  if (algumInvalido) {
    return { error: "Voto inválido." };
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

    const traitVotos = votos.filter((v) => v.categoria === "TRAIT" && v.traitSlug);
    await Promise.all(
      traitVotos.map((v) =>
        prisma.jogadorTrait.upsert({
          where: {
            jogadorId_traitSlug: {
              jogadorId: v.votadoId,
              traitSlug: v.traitSlug!,
            },
          },
          update: { contador: { increment: 1 } },
          create: { jogadorId: v.votadoId, traitSlug: v.traitSlug! },
        })
      )
    );
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
