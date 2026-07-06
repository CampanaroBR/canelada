import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/BottomNav";
import { NovaRodadaForm } from "./NovaRodadaForm";
import { EmptyState } from "@/ds/components/EmptyState";
import { Clock, ClockCounterClockwise } from "@phosphor-icons/react/dist/ssr";

export default async function PeladaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const jogador = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { role: true },
  });

  const isAdmin = jogador?.role === "ADMIN" || jogador?.role === "SUPER_ADMIN";

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
        {isAdmin ? (
          <NovaRodadaForm />
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
