import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BottomNav } from "@/components/layout/BottomNav";
import { PerfilCliente } from "../PerfilCliente";
import { BackButton } from "../BackButton";
import { computeConquistas, computeOverall } from "@/lib/conquistas";

export const dynamic = "force-dynamic";

function getInitials(name: string) {
  const p = name.trim().split(/\s+/);
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

const POS_ABBR: Record<string, string> = {
  Goleiro: "GOL", Zagueiro: "ZAG", Lateral: "LAT", Volante: "VOL", Meia: "MEI", Atacante: "ATA",
};

export default async function PerfilPage({ params }: { params: Promise<{ apelido: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { apelido: apelidoParam } = await params;
  const apelido = decodeURIComponent(apelidoParam);

  const jogador = await prisma.jogador.findFirst({
    where: { apelido: { equals: apelido, mode: "insensitive" } },
    select: {
      id: true, userId: true, apelido: true, nome: true, sobrenome: true,
      posicao: true, peDominante: true, foto: true, grupoId: true, createdAt: true, role: true,
      grupo: { select: { nome: true } },
      traitsRecebidas: { select: { traitSlug: true } },
    },
  });

  if (!jogador) {
    return (
      <div style={{ minHeight: "100dvh", background: "#090909", display: "flex", flexDirection: "column" }}>
        <header style={{ height: 56, display: "flex", alignItems: "center", padding: "0 8px" }}>
          <BackButton size={20} />
        </header>
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <p style={{ color: "#7a7a7a", fontFamily: "var(--font-body)", fontSize: 14 }}>Jogador não encontrado.</p>
        </main>
        <BottomNav />
      </div>
    );
  }

  // Só rodadas encerradas contam pras estatísticas de carreira — igual ao
  // Ranking/Badges (lib/badges.ts). Sem isso, votos da rodada em andamento
  // apareciam aqui na hora mas só refletiam no Ranking depois de fechar,
  // dando números divergentes entre as telas.
  const votoEncerrada = { rodada: { encerrada: true } } as const;
  const [mvpCount, bagreCount, presencaRows] = await Promise.all([
    prisma.voto.count({ where: { votadoId: jogador.id, categoria: "MVP", ...votoEncerrada } }),
    prisma.voto.count({ where: { votadoId: jogador.id, categoria: "BAGRE", ...votoEncerrada } }),
    prisma.voto.findMany({ where: { votadoId: jogador.id, ...votoEncerrada }, select: { rodadaId: true }, distinct: ["rodadaId"] }),
  ]);

  const isOwner = jogador.userId === session.user.id;
  const nomeCompleto = [jogador.nome, jogador.sobrenome].filter(Boolean).join(" ");
  const displayName = nomeCompleto || jogador.apelido;
  const initials = getInitials(displayName);
  const traitsUnlocked = jogador.traitsRecebidas.length;
  const presencaCount = presencaRows.length;
  const joinYear = new Date(jogador.createdAt).getFullYear();
  const racudoCount = await prisma.voto.count({ where: { votadoId: jogador.id, categoria: "RACUDO", ...votoEncerrada } });
  const resenhaCount = await prisma.voto.count({ where: { votadoId: jogador.id, categoria: "RESENHA", ...votoEncerrada } });

  const conquiStats = { mvpCount, bagreCount, racudoCount, resenhaCount, traitsUnlocked, presencaCount };
  const overall = computeOverall(conquiStats);
  computeConquistas(conquiStats); // mantém o cálculo coerente (badges vivem na aba Badges)

  const posAbbr = jogador.posicao ? (POS_ABBR[jogador.posicao] ?? jogador.posicao.slice(0, 3).toUpperCase()) : "—";

  const subParts: string[] = [];
  if (nomeCompleto) subParts.push(jogador.apelido);
  if (jogador.peDominante) subParts.push(`Pé ${jogador.peDominante}`);
  const subtitle = subParts.join(" · ");

  const STATS = [
    { label: "PRESENÇAS", value: presencaCount, color: "#9fe870" },
    { label: "MVP's", value: mvpCount, color: "#B5FF4D" },
    { label: "BAGRES", value: bagreCount, color: "#e56767" },
    { label: "PERSONAGENS", value: traitsUnlocked, color: "#A78BFA" },
  ];

  return (
    <div style={{ minHeight: "100dvh", background: "#090909" }}>
      {/* ── Topbar ── */}
      <header className="glass-bar" style={{ position: "sticky", top: 0, zIndex: 30, height: 56, display: "flex", alignItems: "center", padding: "0 8px" }}>
        <BackButton />
      </header>

      <main style={{ padding: "0 8px", paddingBottom: "calc(96px + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column", gap: 16 }}>
        <PerfilCliente
          displayName={displayName}
          overall={overall}
          posAbbr={posAbbr}
          joinYear={joinYear}
          subtitle={subtitle}
          foto={jogador.foto ?? ""}
          initials={initials}
          stats={STATS}
          email={session.user.email ?? ""}
          grupoNome={jogador.grupo?.nome ?? "Canelada"}
          roleLabel={jogador.role === "PLAYER" ? "Jogador" : jogador.role === "SUPER_ADMIN" ? "Dono" : "Admin"}
          isAdmin={jogador.role === "ADMIN" || jogador.role === "SUPER_ADMIN"}
          isOwner={isOwner}
          initial={{ nome: jogador.nome ?? "", sobrenome: jogador.sobrenome ?? "", apelido: jogador.apelido, posicao: jogador.posicao ?? "", peDominante: jogador.peDominante ?? "", foto: jogador.foto ?? "" }}
        />
      </main>

      <BottomNav />
    </div>
  );
}
