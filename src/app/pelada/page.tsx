import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/BottomNav";
import { NovaRodadaForm } from "./NovaRodadaForm";
import { EmptyState } from "@/ds/components/EmptyState";
import { Card } from "@/ds/components/Card";
import { Clock, ClockCounterClockwise, SoccerBall } from "@phosphor-icons/react/dist/ssr";

function formatDataLonga(d: Date) {
  return d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
}

export default async function PeladaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const jogador = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { role: true, grupoId: true },
  });

  const isAdmin = jogador?.role === "ADMIN" || jogador?.role === "SUPER_ADMIN";
  const isSuperAdmin = jogador?.role === "SUPER_ADMIN";

  // Se já existe uma rodada aberta (encerrada:false) pro grupo, criar outra é
  // bloqueado no servidor (anti-spam em actions.ts) — mostrar o form de novo
  // aqui só confundia o admin (parecia que dava pra criar, mas ia falhar).
  // Mostra o status da rodada atual em vez disso, com atalho pra vincular
  // pendentes (nomes importados sem conta associada).
  const rodadaAberta = isAdmin && jogador?.grupoId
    ? await prisma.rodada.findFirst({
        where: { grupoId: jogador.grupoId, encerrada: false },
        orderBy: { createdAt: "desc" },
        select: { id: true, data: true, pendentes: true },
      })
    : null;

  return (
    <div style={{ minHeight: "100dvh", background: "#08080a" }}>
      <Link
        href="/pelada/historico"
        aria-label="Histórico de babas"
        style={{
          position: "fixed", top: "calc(env(safe-area-inset-top, 0px) + 12px)", right: 12, zIndex: 40,
          width: 40, height: 40, borderRadius: 20, background: "rgba(20,20,20,0.8)", border: "1px solid #2c2c2c",
          display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)",
        }}
      >
        <ClockCounterClockwise size={20} color="#9fe870" weight="regular" />
      </Link>
      <div>
        {isAdmin && rodadaAberta ? (
          <div style={{ padding: "calc(env(safe-area-inset-top, 0px) + 80px) 16px 80px", display: "flex", flexDirection: "column", gap: 16 }}>
            <Card style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <SoccerBall size={22} color="#9fe870" weight="fill" />
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "#fff" }}>
                  Rodada já criada
                </span>
              </div>
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: 15, color: "#c5c5c5" }}>
                {formatDataLonga(rodadaAberta.data)} · votação abre às 22:30.
              </p>
              {rodadaAberta.pendentes.length > 0 && (
                <Link href="/votacao/presenca" style={{ textDecoration: "none" }}>
                  <div style={{
                    background: "transparent", border: "1px solid #9fe870", borderRadius: 16,
                    padding: "14px", display: "flex", alignItems: "center", justifyContent: "center",
                    width: "100%", boxSizing: "border-box",
                  }}>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "#9fe870" }}>
                      Vincular {rodadaAberta.pendentes.length} pendente{rodadaAberta.pendentes.length > 1 ? "s" : ""}
                    </span>
                  </div>
                </Link>
              )}
            </Card>
          </div>
        ) : isSuperAdmin ? (
          <NovaRodadaForm isSuperAdmin={true} />
        ) : (
          <div style={{ padding: "calc(env(safe-area-inset-top, 0px) + 80px) 16px 80px", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "80dvh" }}>
            <EmptyState
              icon={<Clock size={26} weight="regular" />}
              title="Aguardando rodada"
              description="Nenhuma rodada aberta no momento. O admin cria quando o baba acabar — aí a votação libera pra galera."
            />
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
