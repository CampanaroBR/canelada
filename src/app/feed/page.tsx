import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BottomNav } from "@/components/layout/BottomNav";
import Link from "next/link";
import { criarRodada } from "@/app/votacao/actions";
import { HomeClient } from "./HomeClient";

export const dynamic = "force-dynamic";

// Figma asset URLs
const IMG = {
  logo:        "http://localhost:3845/assets/31c46a81e6d70b0dc33ca60496ecfa043e761f1c.png",
  campo:       "http://localhost:3845/assets/a263af27cbe7a4ef6641eae0a2116c73349a78ff.png",
  tshirt:      "http://localhost:3845/assets/b4cbc176d76f942ed9d2e730c598230da33eb369.svg",
  bell:        "http://localhost:3845/assets/85367da42c70e1d5ab7fd44d7b65dddf496bca2b.svg",
  list:        "http://localhost:3845/assets/1b0a8c436f55e4a6e53e98bbd07cc3cfc0bbbb83.svg",
  calendar:    "http://localhost:3845/assets/9fbcd9405a497085e1df88ed009276f1587d787c.svg",
  alarm:       "http://localhost:3845/assets/3171d50ce937795f17f4d5b40bcfcc5f2b35e39f.svg",
  trophy:      "http://localhost:3845/assets/e3f883d17ae67efead123e30b9dec3f2de83035c.svg",
  calendarStar:"http://localhost:3845/assets/e23d845c76452f4c998a4f8f10e56d4c15e127ca.svg",
  medal:       "http://localhost:3845/assets/ad6be823fa87a138055c46b3af3a96875dd76d19.svg",
  caretRight:  "http://localhost:3845/assets/7038802d9fcf108f2f3ad5a4a93d5463281a40c6.svg",
  medal1:      "http://localhost:3845/assets/ed3d245a654a2fbbf71fa008b60c5261a3b492b4.svg",
  medal2:      "http://localhost:3845/assets/5cbc74c5d63a841c4db0d1f95fa614b4b6ccb83e.svg",
  medal3:      "http://localhost:3845/assets/9a1646dc20219cb326579f1d3aa136312f40d036.svg",
  // Personagem mascots
  mascotPreg:  "http://localhost:3845/assets/b663ed68937f38dbe3274350c39786fc36e54346.png",
  mascotMat:   "http://localhost:3845/assets/320508786458480dbbb96170e84a70d16c6f69f9.png",
  mascotBagre: "http://localhost:3845/assets/87fa5599c5cd3975730bfdff7b046d047125b39c.png",
  // Conquista badges
  emChamas:    "http://localhost:3845/assets/3ec226f3c12640cf91318642ba7cb1e93af99fc1.png",
  virada:      "http://localhost:3845/assets/ebc29bb02d6decbb4a455a28707bcd21935d9c0e.png",
  maFase:      "http://localhost:3845/assets/4b0505e234167ce75814365564715857215d2164.png",
};

type Jogador = { id: string; apelido: string; foto: string | null };
type MaisVotado = { apelido: string; qtd: number; categoria: string };
type Personagem = { tipo: string; texto: string; data: Date };
type Conquista = { apelido: string; traitNome: string; traitEmoji: string | null; data: Date };

export default async function FeedPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const jogador = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { id: true, grupoId: true },
  });
  if (!jogador) redirect("/onboarding");

  const grupoId = jogador.grupoId;

  const [rodadaAtiva, topVotadosRaw, recentStories, recentConquistas, allJogadores] = await Promise.all([
    prisma.rodada.findFirst({
      where: { grupoId, encerrada: false },
      select: { id: true, data: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.voto.groupBy({
      by: ["votadoId"],
      where: { rodada: { grupoId }, categoria: "MVP" },
      _count: { votadoId: true },
      orderBy: { _count: { votadoId: "desc" } },
      take: 6,
    }),
    prisma.story.findMany({
      where: { rodada: { grupoId }, tipo: { in: ["MVP", "BAGRE"] } },
      include: { rodada: { select: { data: true } } },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.jogadorTrait.findMany({
      where: { jogador: { grupoId } },
      include: {
        jogador: { select: { apelido: true } },
        trait: { select: { nome: true, emoji: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 3,
    }),
    prisma.jogador.findMany({
      where: { grupoId },
      select: { id: true, apelido: true, foto: true },
    }),
  ]);

  // Resolve mais votados names
  const jogMap = Object.fromEntries(allJogadores.map((j: Jogador) => [j.id, j]));
  const maisVotados: MaisVotado[] = topVotadosRaw.map(v => ({
    apelido: jogMap[v.votadoId]?.apelido ?? "?",
    qtd: v._count.votadoId,
    categoria: "MVP",
  }));

  const personagens: Personagem[] = recentStories.map(s => ({
    tipo: s.tipo,
    texto: s.texto,
    data: s.rodada.data,
  }));

  const conquistas: Conquista[] = recentConquistas.map(c => ({
    apelido: c.jogador.apelido,
    traitNome: c.trait.nome,
    traitEmoji: c.trait.emoji,
    data: c.updatedAt,
  }));

  const jaVotou = rodadaAtiva
    ? !!(await prisma.voto.findFirst({
        where: { rodadaId: rodadaAtiva.id, votanteId: jogador.id },
        select: { id: true },
      }))
    : false;

  const dataRodada = rodadaAtiva
    ? new Date(rodadaAtiva.data).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })
    : null;

  // Last 3 rodada dates for filter pills
  const ultimasRodadas = await prisma.rodada.findMany({
    where: { grupoId },
    orderBy: { data: "desc" },
    take: 3,
    select: { data: true },
  });
  const datePills = ultimasRodadas.reverse().map(r =>
    new Date(r.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "")
  );

  return (
    <HomeClient
      IMG={IMG}
      rodadaId={rodadaAtiva?.id ?? null}
      dataRodada={dataRodada}
      jaVotou={jaVotou}
      maisVotados={maisVotados}
      personagens={personagens}
      conquistas={conquistas}
      datePills={datePills}
      criarRodadaAction={criarRodada}
    />
  );
}
