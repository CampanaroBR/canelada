"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function saveOnboarding(apelido: string, nomeNoBaba: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const trimmedApelido = apelido.trim();
  const trimmedNome = nomeNoBaba.trim();

  if (trimmedApelido.length < 2 || trimmedApelido.length > 20) {
    return { error: "Apelido deve ter entre 2 e 20 caracteres." };
  }
  if (trimmedNome.length < 2 || trimmedNome.length > 30) {
    return { error: "Nome do baba deve ter entre 2 e 30 caracteres." };
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

  // Portão do convite: entrada só com o código do link (cookie gravado no /login).
  // Não vale pra quem já é membro — só pra criação de jogador novo.
  const cookieStore = await cookies();
  const convite = cookieStore.get("convite")?.value;
  if (!convite || convite !== grupo.inviteCode) {
    return { error: "Entrada só por convite — peça o link ao admin do baba e abra por ele." };
  }

  await prisma.jogador.create({
    data: {
      userId: session.user.id,
      grupoId: grupo.id,
      apelido: trimmedApelido,
      nomeNoBaba: trimmedNome,
    },
  });

  redirect("/feed");
}

// mantém compatibilidade com código antigo
export async function saveApelido(apelido: string) {
  return saveOnboarding(apelido, apelido);
}
