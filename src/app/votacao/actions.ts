"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { gerarStories } from "@/lib/stories";
import { rateLimit } from "@/lib/ratelimit";
import { isDiaDeBaba } from "@/lib/votacaoJanela";

export async function criarRodada() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const jogador = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { grupoId: true, role: true },
  });
  if (!jogador) redirect("/onboarding");

  // Só o dono do grupo cria rodada. Antes qualquer jogador logado conseguia —
  // o botão "Baba rolou hoje" no feed/votação disparava esta action sem
  // nenhuma checagem de role, e foi assim que rodadas nasceram por engano.
  if (jogador.role !== "SUPER_ADMIN") redirect("/votacao");

  // Baba só em segunda/quarta — bloqueia criação em dia fora do calendário.
  if (!isDiaDeBaba(new Date())) redirect("/votacao");

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

/** Ajusta o contador de JogadorTrait pra refletir um voto TRAIT removido/movido. */
async function ajustarContadorTrait(jogadorId: string, traitSlug: string, delta: 1 | -1) {
  if (delta === 1) {
    await prisma.jogadorTrait.upsert({
      where: { jogadorId_traitSlug: { jogadorId, traitSlug } },
      update: { contador: { increment: 1 } },
      create: { jogadorId, traitSlug },
    });
    return;
  }
  const atual = await prisma.jogadorTrait.findUnique({
    where: { jogadorId_traitSlug: { jogadorId, traitSlug } },
    select: { contador: true },
  });
  if (!atual) return;
  if (atual.contador <= 1) {
    await prisma.jogadorTrait.delete({ where: { jogadorId_traitSlug: { jogadorId, traitSlug } } });
  } else {
    await prisma.jogadorTrait.update({
      where: { jogadorId_traitSlug: { jogadorId, traitSlug } },
      data: { contador: { decrement: 1 } },
    });
  }
}

/** Lista todos os votos da rodada — só o dono do grupo (SUPER_ADMIN) pode editar votação. */
export async function listarVotos(rodadaId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autenticado." } as const;

  const eu = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { grupoId: true, role: true },
  });
  if (!eu) return { error: "Jogador não encontrado." } as const;
  if (eu.role !== "SUPER_ADMIN") return { error: "Só o dono do grupo pode editar votos." } as const;

  const rodada = await prisma.rodada.findUnique({ where: { id: rodadaId }, select: { grupoId: true } });
  if (!rodada || rodada.grupoId !== eu.grupoId) return { error: "Rodada inválida." } as const;

  const [votos, jogadores, traits] = await Promise.all([
    prisma.voto.findMany({
      where: { rodadaId },
      select: {
        id: true, categoria: true, traitSlug: true, votanteId: true, votadoId: true, createdAt: true,
        votante: { select: { apelido: true } },
        votado: { select: { apelido: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.jogador.findMany({ where: { grupoId: eu.grupoId }, select: { id: true, apelido: true }, orderBy: { apelido: "asc" } }),
    prisma.trait.findMany({ select: { slug: true, nome: true, emoji: true } }),
  ]);

  const traitMeta = Object.fromEntries(traits.map((t) => [t.slug, t]));
  return {
    votos: votos.map((v) => ({
      id: v.id,
      categoria: v.categoria,
      traitLabel: v.traitSlug ? (traitMeta[v.traitSlug]?.nome ?? v.traitSlug) : v.categoria,
      traitEmoji: v.traitSlug ? (traitMeta[v.traitSlug]?.emoji ?? null) : null,
      votanteId: v.votanteId,
      votanteApelido: v.votante.apelido,
      votadoId: v.votadoId,
      votadoApelido: v.votado.apelido,
      autovoto: v.votanteId === v.votadoId,
    })),
    jogadores,
  } as const;
}

/** Reatribui um voto a outro jogador (ex.: corrigir autovotação). */
export async function editarVoto(votoId: string, novoVotadoId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autenticado." } as const;

  const eu = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { grupoId: true, role: true },
  });
  if (!eu) return { error: "Jogador não encontrado." } as const;
  if (eu.role !== "SUPER_ADMIN") return { error: "Só o dono do grupo pode editar votos." } as const;

  const voto = await prisma.voto.findUnique({
    where: { id: votoId },
    select: { rodadaId: true, votanteId: true, votadoId: true, categoria: true, traitSlug: true, rodada: { select: { grupoId: true } } },
  });
  if (!voto || voto.rodada.grupoId !== eu.grupoId) return { error: "Voto inválido." } as const;
  if (novoVotadoId === voto.votanteId) return { error: "Não pode votar em si mesmo." } as const;

  const alvo = await prisma.jogador.findUnique({ where: { id: novoVotadoId }, select: { grupoId: true } });
  if (!alvo || alvo.grupoId !== eu.grupoId) return { error: "Jogador inválido." } as const;

  await prisma.voto.update({ where: { id: votoId }, data: { votadoId: novoVotadoId } });

  if (voto.categoria === "TRAIT" && voto.traitSlug) {
    await ajustarContadorTrait(voto.votadoId, voto.traitSlug, -1);
    await ajustarContadorTrait(novoVotadoId, voto.traitSlug, 1);
  }

  await gerarStories(voto.rodadaId);

  return { success: true } as const;
}

/** Exclui um voto (ex.: autovotação que passou pela validação por algum motivo). */
export async function excluirVoto(votoId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autenticado." } as const;

  const eu = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { grupoId: true, role: true },
  });
  if (!eu) return { error: "Jogador não encontrado." } as const;
  if (eu.role !== "SUPER_ADMIN") return { error: "Só o dono do grupo pode editar votos." } as const;

  const voto = await prisma.voto.findUnique({
    where: { id: votoId },
    select: { rodadaId: true, votadoId: true, categoria: true, traitSlug: true, rodada: { select: { grupoId: true } } },
  });
  if (!voto || voto.rodada.grupoId !== eu.grupoId) return { error: "Voto inválido." } as const;

  await prisma.voto.delete({ where: { id: votoId } });

  if (voto.categoria === "TRAIT" && voto.traitSlug) {
    await ajustarContadorTrait(voto.votadoId, voto.traitSlug, -1);
  }

  await gerarStories(voto.rodadaId);

  return { success: true } as const;
}
