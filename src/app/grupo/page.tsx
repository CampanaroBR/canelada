import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GrupoClient, type Membro } from "./GrupoClient";

export const dynamic = "force-dynamic";

const POS_ABBR: Record<string, string> = {
  Goleiro: "GOL", Zagueiro: "ZAG", Lateral: "LAT", Volante: "VOL",
  Meia: "MEI", "Meio-Campo": "MEI", Atacante: "ATA",
};

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Admin", ADMIN: "Admin", PLAYER: "Jogador",
};

export default async function GrupoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const eu = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { grupoId: true, role: true },
  });
  if (!eu) redirect("/onboarding");

  const [grupo, jogadores, totalRodadas] = await Promise.all([
    prisma.grupo.findUnique({ where: { id: eu.grupoId }, select: { nome: true, inviteCode: true } }),
    prisma.jogador.findMany({
      where: { grupoId: eu.grupoId },
      select: { apelido: true, nome: true, sobrenome: true, posicao: true, foto: true, role: true, userId: true },
      orderBy: [{ apelido: "asc" }],
    }),
    prisma.rodada.count({ where: { grupoId: eu.grupoId } }),
  ]);

  const souAdmin = eu.role === "ADMIN" || eu.role === "SUPER_ADMIN";
  const membros: Membro[] = jogadores
    .map((j) => ({
      apelido: j.apelido,
      nome: [j.nome, j.sobrenome].filter(Boolean).join(" ") || j.apelido,
      posAbbr: j.posicao ? (POS_ABBR[j.posicao] ?? j.posicao.slice(0, 3).toUpperCase()) : "",
      foto: j.foto ?? "",
      roleLabel: ROLE_LABEL[j.role] ?? "Jogador",
      isAdmin: j.role === "ADMIN" || j.role === "SUPER_ADMIN",
      removivel: souAdmin && j.userId !== session.user!.id && j.role !== "SUPER_ADMIN",
    }))
    // admins primeiro, depois ordem alfabética
    .sort((a, b) => Number(b.isAdmin) - Number(a.isAdmin) || a.apelido.localeCompare(b.apelido));

  return (
    <GrupoClient
      nome={grupo?.nome ?? "Meu Grupo"}
      totalMembros={jogadores.length}
      totalRodadas={totalRodadas}
      membros={membros}
      isAdmin={eu.role === "ADMIN" || eu.role === "SUPER_ADMIN"}
      inviteCode={grupo?.inviteCode ?? ""}
    />
  );
}
