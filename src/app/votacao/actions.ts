"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { gerarStories } from "@/lib/stories";
import { rateLimit } from "@/lib/ratelimit";

// REMOVIDO: `criarRodada()` sem argumentos.
//
// Criava rodada só com `grupoId` — sem data e sem lista de participantes — e
// era disparada por um botão de largura inteira no meio da Home. Foi a origem
// das rodadas fantasma (0 votos, 0 presentes), duas vezes: a primeira levou a
// uma trava de role, que não resolveu porque o problema nunca foi permissão e
// sim o botão estar ali.
//
// Agora existe UM caminho pra criar rodada: `criarRodada(data, ids, pendentes)`
// em `src/app/pelada/actions.ts`, pela aba Baba, que pede data e participantes.

type VotoInput = {
  categoria: "MVP" | "BAGRE" | "RACUDO" | "RESENHA" | "TRAIT";
  votadoId: string;
  traitSlug?: string;
};

/**
 * Registra os votos da rodada.
 *
 * `jogou` só é perguntado (e só importa) pro dono do grupo votando sem estar na
 * lista de presença — ver a tela de confirmação em VotacaoFlow. "Não joguei"
 * grava os votos com `votanteJogou: false`, e badges.ts ignora esse votante na
 * contagem de participação (não ganha "rodada" no ranking por baba que não
 * jogou). "Joguei" entra na lista de presença de verdade.
 */
export async function submitVotos(rodadaId: string, votos: VotoInput[], jogou = true) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const jogador = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { id: true, grupoId: true, role: true },
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

  // Presença: mesma regra da tela (/votacao). Só o dono do grupo vota sem estar
  // na lista — pra todo o resto, presença é obrigatória. Esta checagem não
  // existia aqui (só na página), então a action aceitava voto de quem não jogou.
  const presente = await prisma.rodada.findFirst({
    where: { id: rodadaId, presentes: { some: { id: jogador.id } } },
    select: { id: true },
  });
  const isSuperAdmin = jogador.role === "SUPER_ADMIN";
  if (!presente && !isSuperAdmin) {
    return { error: "Só quem jogou essa rodada pode votar." };
  }

  // Dono votando fora da lista: a resposta dele decide se conta participação.
  // Se disse que jogou, entra na lista de presença de verdade (fonte primária
  // do ranking); se disse que não, os votos ficam marcados e não pontuam.
  const contaPresenca = presente ? true : jogou;
  if (!presente && isSuperAdmin && jogou) {
    await prisma.rodada.update({
      where: { id: rodadaId },
      data: { presentes: { connect: { id: jogador.id } } },
    });
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
            votanteJogou: contaPresenca,
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

// REMOVIDO: `getPresenca()`. Ficou sem nenhum chamador quando a tela passou a
// carregar os dados direto no server component, e não conhecia convidados —
// era um server action (endpoint exposto) morto e já desatualizado.

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

/**
 * Salva a lista de presença da rodada. Lista vazia = sem restrição (mostra o
 * grupo todo).
 *
 * A ORDEM de `jogadorIds` é a ordem de chegada e vira a tabela `Chegada` — é
 * ela que o sorteio usa pra decidir quem entra na primeira partida ("os
 * primeiros jogam primeiro"). `presentes` continua guardando só QUEM jogou,
 * intocado, porque ranking/badges/feed leem de lá.
 */
export type ItemPresenca = { tipo: "jogador" | "convidado"; id: string };

export async function salvarPresenca(rodadaId: string, itens: ItemPresenca[]) {
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
  const convidados = await prisma.convidado.findMany({
    where: { grupoId: eu.grupoId },
    select: { id: true },
  });
  const validos = {
    jogador: new Set(membros.map((m) => m.id)),
    convidado: new Set(convidados.map((c) => c.id)),
  };

  // dedup preservando a ordem — id repetido bagunçaria a numeração da chegada
  const vistos = new Set<string>();
  const lista = itens.filter((it) => {
    const chave = `${it.tipo}:${it.id}`;
    if (vistos.has(chave) || !validos[it.tipo]?.has(it.id)) return false;
    vistos.add(chave);
    return true;
  });

  // `presentes` (ranking/badges/votação) só conhece jogador cadastrado.
  // Convidado vive só na `Chegada`, que é o que o sorteio lê.
  const jogadorIds = lista.filter((it) => it.tipo === "jogador").map((it) => it.id);

  await prisma.$transaction([
    prisma.rodada.update({
      where: { id: rodadaId },
      data: { presentes: { set: jogadorIds.map((id) => ({ id })) } },
    }),
    // Recria a ordem do zero: mais simples e correto que tentar casar o que
    // mudou (o admin pode ter reordenado, removido e adicionado na mesma edição).
    prisma.chegada.deleteMany({ where: { rodadaId } }),
    prisma.chegada.createMany({
      data: lista.map((it, i) => ({
        rodadaId,
        ordem: i,
        jogadorId: it.tipo === "jogador" ? it.id : null,
        convidadoId: it.tipo === "convidado" ? it.id : null,
      })),
    }),
  ]);

  return { success: true } as const;
}

/**
 * Apaga uma rodada VAZIA. Existe por causa das "rodadas fantasma": o botão
 * "Baba rolou hoje" cria rodada num toque, e sem isto a única forma de desfazer
 * era mexer no banco à mão.
 *
 * Trava de propósito: só o dono do grupo, e só se a rodada não tiver NADA
 * (voto, presença, chegada ou story). Rodada com voto é histórico do grupo —
 * ranking, badges e Seleção leem dela — então não pode sumir por um toque.
 */
export async function excluirRodada(rodadaId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autenticado." } as const;

  const eu = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { grupoId: true, role: true },
  });
  if (!eu) return { error: "Jogador não encontrado." } as const;
  if (eu.role !== "SUPER_ADMIN") return { error: "Só o dono do grupo pode excluir rodada." } as const;

  const rodada = await prisma.rodada.findUnique({
    where: { id: rodadaId },
    select: { grupoId: true, _count: { select: { votos: true, stories: true, chegadas: true, presentes: true } } },
  });
  if (!rodada || rodada.grupoId !== eu.grupoId) return { error: "Rodada inválida." } as const;

  // Mensagem diz o QUE está travando: só "não pode" deixaria o dono sem saber
  // o que limpar. Convidado entra em `chegadas` sem entrar em `presentes`, então
  // os dois precisam ser citados separadamente.
  const { votos, stories, chegadas, presentes } = rodada._count;
  const motivos = [
    votos > 0 && `${votos} voto${votos === 1 ? "" : "s"}`,
    presentes > 0 && `${presentes} presente${presentes === 1 ? "" : "s"}`,
    chegadas > presentes && "convidado na lista",
    stories > 0 && "resultado publicado",
  ].filter(Boolean);
  if (motivos.length > 0) {
    return { error: `Rodada com ${motivos.join(", ")} não pode ser excluída. Limpe a lista de presença primeiro.` } as const;
  }

  await prisma.rodada.delete({ where: { id: rodadaId } });
  return { success: true } as const;
}

/** Cria (ou reativa) um convidado do grupo. Nome é único por grupo. */
export async function criarConvidado(nome: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autenticado." } as const;

  const eu = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { grupoId: true, role: true },
  });
  if (!eu) return { error: "Jogador não encontrado." } as const;
  if (eu.role !== "ADMIN" && eu.role !== "SUPER_ADMIN") {
    return { error: "Só admins podem adicionar convidados." } as const;
  }

  const limpo = nome.trim();
  if (limpo.length < 2) return { error: "Nome muito curto." } as const;
  if (limpo.length > 40) return { error: "Nome muito longo." } as const;

  // Já existe (talvez desativado)? reativa em vez de duplicar.
  const convidado = await prisma.convidado.upsert({
    where: { grupoId_nome: { grupoId: eu.grupoId, nome: limpo } },
    update: { ativo: true },
    create: { grupoId: eu.grupoId, nome: limpo },
    select: { id: true, nome: true, nivel: true, papelGol: true },
  });

  return { success: true, convidado } as const;
}

/** Ajusta nível/gol do convidado, ou desativa quem parou de vir. */
export async function atualizarConvidado(
  convidadoId: string,
  dados: { nivel?: "FRACO" | "MEDIO" | "FORTE"; papelGol?: "FIXO" | "CURINGA" | null; ativo?: boolean },
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autenticado." } as const;

  const eu = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { grupoId: true, role: true },
  });
  if (!eu) return { error: "Jogador não encontrado." } as const;
  if (eu.role !== "ADMIN" && eu.role !== "SUPER_ADMIN") {
    return { error: "Só admins podem editar convidados." } as const;
  }

  const alvo = await prisma.convidado.findUnique({ where: { id: convidadoId }, select: { grupoId: true } });
  if (!alvo || alvo.grupoId !== eu.grupoId) return { error: "Convidado inválido." } as const;

  await prisma.convidado.update({ where: { id: convidadoId }, data: dados });
  return { success: true } as const;
}

/**
 * Marca quem pega o gol. É config do JOGADOR (vale pra todas as rodadas), não
 * da rodada — por isso não entra em `salvarPresenca`.
 *  - "FIXO": goleiro de verdade
 *  - "CURINGA": joga na linha, mas assume o gol se faltar fixo
 *  - null: jogador de linha puro
 */
export async function definirPapelGol(jogadorId: string, papel: "FIXO" | "CURINGA" | null) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autenticado." } as const;

  const eu = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { grupoId: true, role: true },
  });
  if (!eu) return { error: "Jogador não encontrado." } as const;
  if (eu.role !== "ADMIN" && eu.role !== "SUPER_ADMIN") {
    return { error: "Só admins podem definir quem pega o gol." } as const;
  }

  const alvo = await prisma.jogador.findUnique({ where: { id: jogadorId }, select: { grupoId: true } });
  if (!alvo || alvo.grupoId !== eu.grupoId) return { error: "Jogador inválido." } as const;

  await prisma.jogador.update({ where: { id: jogadorId }, data: { papelGol: papel } });
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
