"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function saveApelido(apelido: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const trimmed = apelido.trim();
  if (trimmed.length < 2 || trimmed.length > 20) {
    return { error: "Apelido deve ter entre 2 e 20 caracteres." };
  }

  const existing = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
  });
  if (existing) redirect("/feed");

  const grupo = await prisma.grupo.upsert({
    where: { slug: "canelada" },
    update: {},
    create: { nome: "Canelada", slug: "canelada" },
  });

  await prisma.jogador.create({
    data: {
      userId: session.user.id,
      grupoId: grupo.id,
      apelido: trimmed,
    },
  });

  redirect("/feed");
}
