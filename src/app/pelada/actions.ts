"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type ParticipanteImportado = {
  nome: string;
  status: "encontrado" | "nao_encontrado";
  jogadorId?: string;
  apelido?: string;
};

export async function parseLista(lista: string): Promise<ParticipanteImportado[]> {
  const linhas = lista
    .split("\n")
    .map((l) => l.replace(/^\d+[\.\)]\s*/, "").trim()) // remove "1. " ou "1) "
    .filter((l) => l.length > 1);

  const jogadores = await prisma.jogador.findMany({
    select: { id: true, apelido: true, nomeNoBaba: true },
  });

  return linhas.map((nome) => {
    const normalizar = (s: string) =>
      s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

    const nomeNorm = normalizar(nome);
    const encontrado = jogadores.find(
      (j) =>
        normalizar(j.nomeNoBaba ?? "") === nomeNorm ||
        normalizar(j.apelido) === nomeNorm
    );

    return encontrado
      ? { nome, status: "encontrado", jogadorId: encontrado.id, apelido: encontrado.apelido }
      : { nome, status: "nao_encontrado" };
  });
}

export async function criarRodada(data: string, participantesIds: string[]) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const jogador = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { role: true, grupoId: true },
  });

  if (!jogador || (jogador.role !== "ADMIN" && jogador.role !== "SUPER_ADMIN")) {
    return { error: "Apenas administradores podem criar rodadas." };
  }

  // Anti-spam: bloqueia se já existe rodada não encerrada ou criada há menos de 10 min no grupo.
  const dezMinAtras = new Date(Date.now() - 10 * 60 * 1000);
  const recente = await prisma.rodada.findFirst({
    where: { grupoId: jogador.grupoId, OR: [{ encerrada: false }, { createdAt: { gte: dezMinAtras } }] },
    select: { id: true },
  });
  if (recente) {
    return { error: "Já existe uma rodada recente/aberta neste grupo. Aguarde encerrar." };
  }

  const rodada = await prisma.rodada.create({
    data: {
      grupoId: jogador.grupoId,
      data: new Date(data),
    },
  });

  // Notificações serão enviadas automaticamente às 22:30 pelo cron /api/cron/abrir-votacao
  return { rodadaId: rodada.id, totalJogadores: participantesIds.length };
}
