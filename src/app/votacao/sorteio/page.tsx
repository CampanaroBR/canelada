import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notasDoGrupo } from "@/lib/perfilStats";
import { mediaDoGrupo, notaDoConvidado } from "@/lib/convidados";
import { SorteioClient } from "./SorteioClient";

export const dynamic = "force-dynamic";

export default async function SorteioPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const jogador = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { grupoId: true, role: true },
  });
  if (!jogador) redirect("/onboarding");
  if (jogador.role !== "ADMIN" && jogador.role !== "SUPER_ADMIN") redirect("/votacao");

  const rodada = await prisma.rodada.findFirst({
    where: { grupoId: jogador.grupoId, encerrada: false },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (!rodada) redirect("/votacao");

  // A ordem de chegada É a fila do sorteio. Sem chegada marcada não há o que
  // sortear — a tela manda o admin pra /votacao/presenca.
  const [chegadas, notas] = await Promise.all([
    prisma.chegada.findMany({
      where: { rodadaId: rodada.id },
      orderBy: { ordem: "asc" },
      select: {
        jogador: { select: { id: true, apelido: true, foto: true, papelGol: true } },
        convidado: { select: { id: true, nome: true, nivel: true, papelGol: true } },
      },
    }),
    notasDoGrupo(jogador.grupoId),
  ]);

  // Convidado não tem OVR (não é votado): a nota sai da média do grupo ajustada
  // pelo nível que o admin marcou. Ver src/lib/convidados.ts.
  const media = mediaDoGrupo(notas.values());

  // O lib de sorteio usa minúsculo; o enum do banco é maiúsculo.
  const paraGol = (p: "FIXO" | "CURINGA" | null | undefined) =>
    p === "FIXO" ? ("fixo" as const) : p === "CURINGA" ? ("curinga" as const) : undefined;

  const fila = chegadas.flatMap((c) => {
    if (c.jogador) {
      return [{
        id: c.jogador.id,
        apelido: c.jogador.apelido,
        foto: c.jogador.foto ?? "",
        gol: paraGol(c.jogador.papelGol),
        nota: notas.get(c.jogador.id) ?? media,
        convidado: false,
      }];
    }
    if (c.convidado) {
      return [{
        id: c.convidado.id,
        apelido: c.convidado.nome,
        foto: "",
        gol: paraGol(c.convidado.papelGol),
        nota: notaDoConvidado(c.convidado.nivel, media),
        convidado: true,
      }];
    }
    return [];
  });

  return <SorteioClient fila={fila} />;
}
