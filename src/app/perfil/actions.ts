"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type PerfilInput = {
  nome?: string;
  sobrenome?: string;
  apelido?: string;
  posicao?: string;
  peDominante?: string;
};

export type PerfilResult = { ok: boolean; error?: string; apelido?: string };

/** Atualiza o próprio perfil (nome, sobrenome, apelido, posição, pé). */
export async function atualizarPerfil(input: PerfilInput): Promise<PerfilResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Não autenticado." };

  const jogador = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { id: true, grupoId: true, apelido: true },
  });
  if (!jogador) return { ok: false, error: "Jogador não encontrado." };

  const nome = input.nome?.trim() || null;
  const sobrenome = input.sobrenome?.trim() || null;
  const posicao = input.posicao?.trim() || null;
  const peDominante = input.peDominante?.trim() || null;

  let apelido = input.apelido?.trim();
  if (apelido && apelido !== jogador.apelido) {
    if (apelido.length < 2) return { ok: false, error: "Apelido muito curto (mín. 2)." };
    if (apelido.length > 24) return { ok: false, error: "Apelido muito longo (máx. 24)." };
    const existe = await prisma.jogador.findFirst({
      where: {
        grupoId: jogador.grupoId,
        apelido: { equals: apelido, mode: "insensitive" },
        NOT: { id: jogador.id },
      },
      select: { id: true },
    });
    if (existe) return { ok: false, error: "Esse apelido já está em uso no grupo." };
  } else {
    apelido = jogador.apelido;
  }

  await prisma.jogador.update({
    where: { id: jogador.id },
    data: { nome, sobrenome, posicao, peDominante, apelido },
  });

  // mantém User.name coerente com nome + sobrenome
  const fullName = [nome, sobrenome].filter(Boolean).join(" ") || null;
  if (fullName) {
    await prisma.user.update({ where: { id: session.user.id }, data: { name: fullName } });
  }

  revalidatePath("/perfil");
  revalidatePath(`/perfil/${jogador.apelido}`);
  if (apelido !== jogador.apelido) revalidatePath(`/perfil/${apelido}`);

  return { ok: true, apelido };
}
