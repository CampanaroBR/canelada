"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function renomearGrupo(nome: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const trimmed = nome.trim();
  if (trimmed.length < 2 || trimmed.length > 40) {
    return { ok: false as const, error: "O nome deve ter entre 2 e 40 caracteres." };
  }

  const jogador = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { role: true, grupoId: true },
  });
  if (!jogador) return { ok: false as const, error: "Jogador não encontrado." };
  if (jogador.role !== "ADMIN" && jogador.role !== "SUPER_ADMIN") {
    return { ok: false as const, error: "Apenas administradores podem editar o grupo." };
  }

  await prisma.grupo.update({ where: { id: jogador.grupoId }, data: { nome: trimmed } });
  revalidatePath("/grupo");
  return { ok: true as const };
}

/** Gera um novo código de convite (admin). Links antigos param de funcionar na hora. */
export async function regenerarConvite() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const jogador = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { role: true, grupoId: true },
  });
  if (!jogador) return { ok: false as const, error: "Jogador não encontrado." };
  if (jogador.role !== "ADMIN" && jogador.role !== "SUPER_ADMIN") {
    return { ok: false as const, error: "Apenas administradores podem gerar convites." };
  }

  await prisma.grupo.update({
    where: { id: jogador.grupoId },
    data: { inviteCode: crypto.randomUUID() },
  });
  revalidatePath("/grupo");
  return { ok: true as const };
}

/** Remove um membro do grupo (admin). Apaga o Jogador e dados relacionados; mantém a conta (User). */
export async function removerMembro(apelido: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const eu = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { id: true, role: true, grupoId: true },
  });
  if (!eu) return { ok: false as const, error: "Jogador não encontrado." };
  if (eu.role !== "ADMIN" && eu.role !== "SUPER_ADMIN") {
    return { ok: false as const, error: "Apenas administradores podem remover membros." };
  }

  const alvo = await prisma.jogador.findFirst({
    where: { grupoId: eu.grupoId, apelido: { equals: apelido, mode: "insensitive" } },
    select: { id: true, role: true },
  });
  if (!alvo) return { ok: false as const, error: "Membro não encontrado." };
  if (alvo.id === eu.id) return { ok: false as const, error: "Você não pode remover a si mesmo." };
  if (alvo.role === "SUPER_ADMIN") return { ok: false as const, error: "Não é possível remover o dono do grupo." };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.voto.deleteMany({ where: { OR: [{ votanteId: alvo.id }, { votadoId: alvo.id }] } });
      await tx.jogadorTrait.deleteMany({ where: { jogadorId: alvo.id } });
      // delete do Jogador cascateia BadgeUnlock + PushSubscription
      await tx.jogador.delete({ where: { id: alvo.id } });
    });
  } catch (e) {
    console.error("removerMembro falhou:", e);
    return { ok: false as const, error: "Não foi possível remover agora. Tente novamente." };
  }

  revalidatePath("/grupo");
  return { ok: true as const };
}
