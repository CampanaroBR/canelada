import { notFound } from "next/navigation";
import { PremioScreen } from "./PremioScreen";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { pickWinner } from "@/lib/tieBreak";

export const dynamic = "force-dynamic";

// Categoria slug → config. A rota já É o slug do trait (matador/categoria/
// paredao) — antes isso apontava pra um CategoriaVoto (MVP/BAGRE/RACUDO)
// que nunca existe de verdade (a votação real só usa categoria=TRAIT),
// então o vencedor nunca aparecia.
// Todas as artes seguem o mesmo canvas fixo (786x1704 @2x, igual ao
// ShareCardModal): fundo + mascote + título + emoji. Sem descrição assada —
// vem ao vivo do Trait.descricao, igual ao card de "personagem da semana".
const CONFIGS: Record<string, {
  title: string;
  bakedImg: string;
  nameColor: string;
  footerBorder: string;
}> = {
  matador: {
    title: "MATADOR",
    bakedImg:  "/premio/matador.jpg",
    nameColor: "#9fe870",
    footerBorder: "#42bace",
  },
  categoria: {
    title: "CATEGORIA",
    bakedImg:  "/premio/categoria.jpg",
    nameColor: "#d6ffbc",
    footerBorder: "#c5c5c5",
  },
  paredao: {
    title: "PAREDÃO",
    bakedImg:  "/premio/paredao.jpg",
    nameColor: "#d6ffbc",
    footerBorder: "#c5c5c5",
  },
  frangueiro: {
    title: "FRANGUEIRO",
    bakedImg:  "/premio/frangueiro.jpg",
    nameColor: "#d6ffbc",
    footerBorder: "#c5c5c5",
  },
  bragueiro: {
    title: "BRAGUEIRO",
    bakedImg:  "/premio/bragueiro.jpg",
    nameColor: "#d6ffbc",
    footerBorder: "#c5c5c5",
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

  const trait = await prisma.trait.findUnique({
    where: { slug: categoria },
    select: { descricao: true },
  });

  // Most voted player for this category in the latest closed rodada
  const ultimaRodada = await prisma.rodada.findFirst({
    where: { grupoId: jogador.grupoId, encerrada: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, data: true },
  });

  let vencedor: { apelido: string; qtd: number } | null = null;
  if (ultimaRodada) {
    const votos = await prisma.voto.findMany({
      where: { rodadaId: ultimaRodada.id, categoria: "TRAIT", traitSlug: categoria },
      select: { votadoId: true },
    });
    const contagem = new Map<string, number>();
    for (const v of votos) contagem.set(v.votadoId, (contagem.get(v.votadoId) ?? 0) + 1);
    const winner = pickWinner(contagem, `${ultimaRodada.id}:${categoria}`);
    if (winner) {
      const j = await prisma.jogador.findUnique({
        where: { id: winner.id },
        select: { apelido: true },
      });
      vencedor = { apelido: j?.apelido ?? "Jogador", qtd: winner.count };
    }
  }

  const dataStr = ultimaRodada
    ? new Date(ultimaRodada.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" })
    : "—";

  return (
    <PremioScreen
      slug={categoria}
      title={config.title}
      bakedImg={config.bakedImg}
      nameColor={config.nameColor}
      footerBorder={config.footerBorder}
      descricao={trait?.descricao ?? null}
      vencedorNome={vencedor?.apelido ?? "?"}
      vencedorQtd={vencedor?.qtd ?? 0}
      categoriaLabel={config.title.charAt(0) + config.title.slice(1).toLowerCase()}
      grupoNome={grupoNome}
      data={dataStr}
    />
  );
}
