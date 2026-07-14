"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/ratelimit";
import { isDiaDeBaba } from "@/lib/votacaoJanela";

export type ParticipanteImportado = {
  nome: string;
  status: "encontrado" | "nao_encontrado";
  jogadorId?: string;
  apelido?: string;
};

export type JogadorDoGrupo = { id: string; apelido: string };

export async function parseLista(lista: string): Promise<{
  participantes: ParticipanteImportado[];
  jogadoresGrupo: JogadorDoGrupo[];
}> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const admin = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { grupoId: true },
  });
  if (!admin) redirect("/onboarding");

  const linhas = lista
    .split("\n")
    .map((l) => l.replace(/^\d+[\.\)]\s*/, "").trim()) // remove "1. " ou "1) "
    .filter((l) => l.length > 1);

  // Escopado ao grupo do admin — antes buscava TODOS os jogadores de TODOS os
  // grupos, então em tese um nome podia "casar" com alguém de outro baba.
  const jogadores = await prisma.jogador.findMany({
    where: { grupoId: admin.grupoId },
    select: { id: true, apelido: true, nomeNoBaba: true },
    orderBy: { apelido: "asc" },
  });

  const normalizar = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

  const participantes: ParticipanteImportado[] = linhas.map((nome) => {
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

  return {
    participantes,
    jogadoresGrupo: jogadores.map((j) => ({ id: j.id, apelido: j.apelido })),
  };
}

export async function criarRodada(data: string, participantesIds: string[], pendentesNomes: string[] = []) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const jogador = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { role: true, grupoId: true },
  });

  if (!jogador || jogador.role !== "SUPER_ADMIN") {
    return { error: "Apenas o dono do grupo pode criar rodadas." };
  }

  // Baba só em segunda/quarta — valida a data escolhida no servidor.
  // `data` é uma data-calendário ("2026-07-13"); ancoramos ao meio-dia BRT
  // (15:00 UTC) pra o dia-da-semana não escorregar pro dia anterior no fuso.
  if (!isDiaDeBaba(new Date(`${data}T15:00:00Z`))) {
    return { error: "Rodada só pode ser criada para segunda ou quarta-feira." };
  }

  if (!(await rateLimit("criarRodada", session.user.id, 5, "10 m")).ok) {
    return { error: "Muitas tentativas. Aguarde um pouco." };
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

  // Só ids de jogadores com conta no app entram na lista de presença — os
  // "pendentes" (nome digitado sem conta ainda) não existem como Jogador.
  const rodada = await prisma.rodada.create({
    data: {
      grupoId: jogador.grupoId,
      data: new Date(data),
      pendentes: pendentesNomes,
      ...(participantesIds.length > 0
        ? { presentes: { connect: participantesIds.map((id) => ({ id })) } }
        : {}),
    },
  });

  // Push imediato pra todos do grupo: lista confirmada. (Votação abre às 22:30 via cron.)
  try {
    const membros = await prisma.jogador.findMany({
      where: { grupoId: jogador.grupoId },
      include: { pushSubscriptions: true },
    });
    const subs = membros.flatMap((m) => m.pushSubscriptions);
    if (subs.length > 0) {
      const { sendPushToSubscriptions } = await import("@/lib/webpush");
      await sendPushToSubscriptions(subs, {
        title: "📋 Baba confirmado!",
        body: participantesIds.length > 0
          ? `Lista fechada com ${participantesIds.length} jogador${participantesIds.length > 1 ? "es" : ""}. Votação abre às 22:30!`
          : "Rodada criada! Votação abre às 22:30.",
        url: "/feed",
      });
    }
  } catch { /* push é best-effort — não bloqueia a criação */ }

  return { rodadaId: rodada.id, totalJogadores: participantesIds.length };
}
