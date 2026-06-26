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
