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
    <div style={{ minHeight: "100dvh", background: "var(--color-bg)", paddingBottom: 100 }}>
      {/* Header */}
      <div style={{
        padding: "calc(env(safe-area-inset-top, 0px) + 20px) 16px 16px",
        borderBottom: "1px solid #1a1a1a",
      }}>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: 32,
          letterSpacing: "-0.01em",
          textTransform: "uppercase",
          color: "var(--color-text-primary)",
          margin: 0,
        }}>
          PELADA
        </h1>
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: 13,
          color: "var(--color-text-muted)",
          marginTop: 4,
        }}>
          {isAdmin ? "Crie uma rodada para abrir a votação." : "Aguarde o admin abrir a votação."}
        </p>
      </div>

      {isAdmin ? (
        <NovaRodadaForm />
      ) : (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 24px",
          textAlign: "center",
          gap: 12,
        }}>
          <span style={{ fontSize: 48 }}>⚽</span>
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: 15,
            color: "var(--color-text-muted)",
            lineHeight: 1.5,
          }}>
            Nenhuma rodada aberta no momento.<br />
            O admin vai criar quando o baba acabar.
          </p>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
