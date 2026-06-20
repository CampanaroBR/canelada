import { notFound } from "next/navigation";
import { PremioScreen } from "./PremioScreen";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// Categoria slug → config
const CONFIGS: Record<string, {
  title: string;
  bgImg: string;
  bakedImg?: string;
  mascotImg: string;
  glowColor: string;
  nameColor: string;
  footerBorder: string;
  votaCategoria: "MVP" | "BAGRE" | "RACUDO";
}> = {
  matador: {
    title: "MATADOR",
    bgImg:     "/votacao-bg/matador.png",
    bakedImg:  "/premio/matador.jpg",
    mascotImg: "/ilustracoes/tubarao.png",
    glowColor: "#0a5c69",
    nameColor: "#9fe870",
    footerBorder: "#42bace",
    votaCategoria: "MVP",
  },
  categoria: {
    title: "CATEGORIA",
    bgImg:     "/votacao-bg/categoria.png",
    bakedImg:  "/premio/categoria.jpg",
    mascotImg: "/ilustracoes/corpo-mole.png",
    glowColor: "#5f450f",
    nameColor: "#d6ffbc",
    footerBorder: "#c5c5c5",
    votaCategoria: "RACUDO",
  },
  paredao: {
    title: "PAREDÃO",
    bgImg:     "/votacao-bg/paredao.png",
    bakedImg:  "/premio/paredao.jpg",
    mascotImg: "/ilustracoes/bagre.png",
    glowColor: "#5f0005",
    nameColor: "#d6ffbc",
    footerBorder: "#c5c5c5",
    votaCategoria: "BAGRE",
  },
};

export default async function PremioPage({ params }: { params: Promise<{ categoria: string }> }) {
  const { categoria } = await params;
  const config = CONFIGS[categoria];
  if (!config) notFound();

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const jogador = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { grupoId: true, grupo: { select: { nome: true } } },
  });
  if (!jogador) redirect("/onboarding");
  const grupoNome = jogador.grupo?.nome ?? "Baba";

  // Most voted player for this category in the latest closed rodada
  const ultimaRodada = await prisma.rodada.findFirst({
    where: { grupoId: jogador.grupoId, encerrada: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, data: true },
  });

  let vencedor: { apelido: string; qtd: number } | null = null;
  if (ultimaRodada) {
    const top = await prisma.voto.groupBy({
      by: ["votadoId"],
      where: { rodadaId: ultimaRodada.id, categoria: config.votaCategoria },
      _count: { votadoId: true },
      orderBy: { _count: { votadoId: "desc" } },
      take: 1,
    });
    if (top.length > 0) {
      const j = await prisma.jogador.findUnique({
        where: { id: top[0].votadoId },
        select: { apelido: true },
      });
      vencedor = { apelido: j?.apelido ?? "Jogador", qtd: top[0]._count.votadoId };
    }
  }

  const dataStr = ultimaRodada
    ? new Date(ultimaRodada.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "—";

  return (
    <PremioScreen
      title={config.title}
      bgImg={config.bgImg}
      bakedImg={config.bakedImg}
      mascotImg={config.mascotImg}
      glowColor={config.glowColor}
      nameColor={config.nameColor}
      footerBorder={config.footerBorder}
      vencedorNome={vencedor?.apelido ?? "?"}
      vencedorQtd={vencedor?.qtd ?? 0}
      categoriaLabel={config.title.charAt(0) + config.title.slice(1).toLowerCase()}
      grupoNome={grupoNome}
      data={dataStr}
    />
  );
}
