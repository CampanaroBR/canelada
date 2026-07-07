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

/** Lista de jogadores do grupo + quem está marcado presente na rodada (pra tela de edição). */
export async function getPresenca(rodadaId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autenticado." } as const;

  const eu = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { grupoId: true, role: true },
  });
  if (!eu) return { error: "Jogador não encontrado." } as const;
  if (eu.role !== "ADMIN" && eu.role !== "SUPER_ADMIN") {
    return { error: "Só admins podem editar a lista de presença." } as const;
  }

  const rodada = await prisma.rodada.findUnique({
    where: { id: rodadaId },
    select: { grupoId: true, presentes: { select: { id: true } }, pendentes: true },
  });
  if (!rodada || rodada.grupoId !== eu.grupoId) return { error: "Rodada inválida." } as const;

  const jogadores = await prisma.jogador.findMany({
    where: { grupoId: eu.grupoId },
    select: { id: true, apelido: true },
    orderBy: { apelido: "asc" },
  });

  return { jogadores, presentesIds: rodada.presentes.map((j) => j.id), pendentes: rodada.pendentes } as const;
}

/**
 * Associa um nome pendente (da lista do baba, sem conta na hora da criação
 * da rodada) a um jogador já cadastrado — some da lista de pendentes e
 * entra na lista de presença. Pode ser usado antes ou durante a votação.
 */
export async function vincularPendente(rodadaId: string, nomePendente: string, jogadorId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autenticado." } as const;

  const eu = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { grupoId: true, role: true },
  });
  if (!eu) return { error: "Jogador não encontrado." } as const;
  if (eu.role !== "ADMIN" && eu.role !== "SUPER_ADMIN") {
    return { error: "Só admins podem vincular jogadores." } as const;
  }

  const rodada = await prisma.rodada.findUnique({
    where: { id: rodadaId },
    select: { grupoId: true, pendentes: true },
  });
  if (!rodada || rodada.grupoId !== eu.grupoId) return { error: "Rodada inválida." } as const;
  if (!rodada.pendentes.includes(nomePendente)) return { error: "Nome já foi vinculado ou removido." } as const;

  const alvo = await prisma.jogador.findUnique({ where: { id: jogadorId }, select: { grupoId: true } });
  if (!alvo || alvo.grupoId !== eu.grupoId) return { error: "Jogador inválido." } as const;

  await prisma.rodada.update({
    where: { id: rodadaId },
    data: {
      pendentes: rodada.pendentes.filter((n) => n !== nomePendente),
      presentes: { connect: { id: jogadorId } },
    },
  });

  return { success: true } as const;
}

/** Salva a lista de presença da rodada. Lista vazia = sem restrição (mostra o grupo todo). */
export async function salvarPresenca(rodadaId: string, jogadorIds: string[]) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autenticado." } as const;

  const eu = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { grupoId: true, role: true },
  });
  if (!eu) return { error: "Jogador não encontrado." } as const;
  if (eu.role !== "ADMIN" && eu.role !== "SUPER_ADMIN") {
    return { error: "Só admins podem editar a lista de presença." } as const;
  }

  const rodada = await prisma.rodada.findUnique({
    where: { id: rodadaId },
    select: { grupoId: true },
  });
  if (!rodada || rodada.grupoId !== eu.grupoId) return { error: "Rodada inválida." } as const;

  // Segurança: só aceita ids de jogadores do próprio grupo.
  const membros = await prisma.jogador.findMany({
    where: { grupoId: eu.grupoId },
    select: { id: true },
  });
  const validos = new Set(membros.map((m) => m.id));
  const ids = jogadorIds.filter((id) => validos.has(id));

  await prisma.rodada.update({
    where: { id: rodadaId },
    data: { presentes: { set: ids.map((id) => ({ id })) } },
  });

  return { success: true } as const;
}
