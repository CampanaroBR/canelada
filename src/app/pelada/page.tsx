import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";
import { NovaRodadaForm } from "./NovaRodadaForm";
import { EmptyState } from "@/ds/components/EmptyState";
import { Clock } from "@phosphor-icons/react/dist/ssr";

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
