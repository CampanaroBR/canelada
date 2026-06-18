import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";
import { NovaRodadaForm } from "./NovaRodadaForm";

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
      <div style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
        {isAdmin ? (
          <NovaRodadaForm />
        ) : (
          <div style={{ padding: "calc(env(safe-area-inset-top, 0px) + 80px) 24px 80px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 16, minHeight: "80dvh" }}>
            <span style={{ fontSize: 52 }}>⚽</span>
            <div>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 22, color: "#fff", letterSpacing: "-.01em", margin: "0 0 6px" }}>
                AGUARDANDO RODADA
              </p>
              <p style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 14, color: "#7a7a7e", lineHeight: 1.5, margin: 0 }}>
                Nenhuma rodada aberta no momento.<br />O admin vai criar quando o baba acabar.
              </p>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
