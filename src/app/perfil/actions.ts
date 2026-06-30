"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";

/** Exclui a conta do jogador e todos os dados relacionados (irreversível). */
export async function excluirConta(): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Não autenticado." };
  const uid = session.user.id;

  const jogador = await prisma.jogador.findUnique({ where: { userId: uid }, select: { id: true } });
  try {
    await prisma.$transaction(async (tx) => {
      if (jogador) {
        // Votos não têm cascade → remover os dados e recebidos manualmente
        await tx.voto.deleteMany({ where: { OR: [{ votanteId: jogador.id }, { votadoId: jogador.id }] } });
        await tx.jogadorTrait.deleteMany({ where: { jogadorId: jogador.id } });
        // delete do Jogador cascateia BadgeUnlock + PushSubscription
        await tx.jogador.delete({ where: { id: jogador.id } });
      }
      // delete do User cascateia Account + Session
      await tx.user.delete({ where: { id: uid } });
    });
    return { ok: true };
  } catch (e) {
    console.error("excluirConta falhou:", e);
    return { ok: false, error: "Não foi possível excluir agora. Tente novamente." };
  }
}

/** Upload da foto de perfil (Vercel Blob). */
export async function uploadFoto(formData: FormData): Promise<{ ok: boolean; error?: string; url?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Não autenticado." };
  // Aceita tanto token clássico quanto conexão via OIDC (que injeta BLOB_STORE_ID)
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) {
    return { ok: false, error: "Armazenamento de fotos ainda não configurado." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Arquivo inválido." };
  if (!file.type.startsWith("image/")) return { ok: false, error: "Envie uma imagem." };
  if (file.size > 5 * 1024 * 1024) return { ok: false, error: "Foto muito grande (máx. 5MB)." };

  const jogador = await prisma.jogador.findUnique({ where: { userId: session.user.id }, select: { id: true, apelido: true } });
  if (!jogador) return { ok: false, error: "Jogador não encontrado." };

  // sanitiza a extensão (só letras/números) pra não injetar caminho na key do Blob
  const ext = ((file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg").slice(0, 5);
  try {
    const blob = await put(`avatars/${jogador.id}-${Date.now()}.${ext}`, file, { access: "public", contentType: file.type });
    await prisma.jogador.update({ where: { id: jogador.id }, data: { foto: blob.url } });
    revalidatePath("/perfil");
    revalidatePath(`/perfil/${jogador.apelido}`);
    return { ok: true, url: blob.url };
  } catch {
    return { ok: false, error: "Falha ao enviar a foto. Tente de novo." };
  }
}

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
