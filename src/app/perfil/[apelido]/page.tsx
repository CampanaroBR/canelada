import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BottomNav } from "@/components/layout/BottomNav";
import Link from "next/link";
import { PerfilCliente } from "../PerfilCliente";
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
        <header style={{ height: 56, display: "flex", alignItems: "center", padding: "0 16px" }}>
          <Link href="/feed" style={{ color: "#7a7a7a", display: "flex", alignItems: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </Link>
        </header>
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <p style={{ color: "#7a7a7a", fontFamily: "var(--font-body)", fontSize: 14 }}>Jogador não encontrado.</p>
        </main>
        <BottomNav />
      </div>
    );
  }

  const [mvpCount, bagreCount, presencaRows] = await Promise.all([
    prisma.voto.count({ where: { votadoId: jogador.id, categoria: "MVP" } }),
    prisma.voto.count({ where: { votadoId: jogador.id, categoria: "BAGRE" } }),
    prisma.voto.findMany({ where: { votadoId: jogador.id }, select: { rodadaId: true }, distinct: ["rodadaId"] }),
  ]);

  const initials = getInitials(jogador.apelido);
  const isOwner = jogador.userId === session.user.id;
  const nomeCompleto = [jogador.nome, jogador.sobrenome].filter(Boolean).join(" ");
  const traitsUnlocked = jogador.traitsRecebidas.length;
  const presencaCount = presencaRows.length;
  const joinYear = new Date(jogador.createdAt).getFullYear();
  const racudoCount = await prisma.voto.count({ where: { votadoId: jogador.id, categoria: "RACUDO" } });
  const resenhaCount = await prisma.voto.count({ where: { votadoId: jogador.id, categoria: "RESENHA" } });

  const conquiStats = { mvpCount, bagreCount, racudoCount, resenhaCount, traitsUnlocked, presencaCount };
  const overall = computeOverall(conquiStats);
  computeConquistas(conquiStats); // mantém o cálculo coerente (badges vivem na aba Badges)

  const posAbbr = jogador.posicao ? (POS_ABBR[jogador.posicao] ?? jogador.posicao.slice(0, 3).toUpperCase()) : "—";

  const subtitle = [nomeCompleto, jogador.peDominante ? `Pé ${jogador.peDominante.toLowerCase()}` : null].filter(Boolean).join(" · ");

  const STATS = [
    { label: "PRESENÇAS", value: presencaCount, color: "#9fe870" },
    { label: "MVPs", value: mvpCount, color: "#B5FF4D" },
    { label: "BAGRES", value: bagreCount, color: "#EF4444" },
    { label: "PERSONAGENS", value: traitsUnlocked, color: "#A78BFA" },
  ];

  return (
    <div style={{ minHeight: "100dvh", background: "#090909" }}>
      {/* ── Topbar ── */}
      <header className="glass-bar" style={{ position: "sticky", top: 0, zIndex: 30, height: 56, display: "flex", alignItems: "center", padding: "0 16px", gap: 12 }}>
        <Link href="/feed" aria-label="Voltar" style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", marginLeft: -8, textDecoration: "none", flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
        </Link>
        <span style={{ flex: 1, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7a7a7a" }}>Perfil</span>
      </header>

      <main style={{ paddingBottom: "calc(96px + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column", gap: 16 }}>
        <PerfilCliente
          apelido={jogador.apelido}
          overall={overall}
          posAbbr={posAbbr}
          joinYear={joinYear}
          subtitle={subtitle}
          foto={jogador.foto ?? ""}
          initials={initials}
          stats={STATS}
          email={session.user.email ?? ""}
          grupoNome={jogador.grupo?.nome ?? "Canelada"}
          roleLabel={jogador.role === "PLAYER" ? "Jogador" : "Admin"}
          isOwner={isOwner}
          initial={{ nome: jogador.nome ?? "", sobrenome: jogador.sobrenome ?? "", apelido: jogador.apelido, posicao: jogador.posicao ?? "", peDominante: jogador.peDominante ?? "", foto: jogador.foto ?? "" }}
        />
      </main>

      <BottomNav />
    </div>
  );
}
