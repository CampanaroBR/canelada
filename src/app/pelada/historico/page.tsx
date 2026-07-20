import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/layout/BottomNav";
import { EmptyState } from "@/ds/components/EmptyState";
import { ChevronLeft, History } from "reicon-react";

export const dynamic = "force-dynamic";

function formatarData(d: Date) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" }).format(d);
}

export default async function HistoricoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const jogador = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { grupoId: true },
  });
  if (!jogador) redirect("/onboarding");

  const rodadas = await prisma.rodada.findMany({
    where: { grupoId: jogador.grupoId, encerrada: true },
    orderBy: { data: "desc" },
    select: {
      id: true,
      data: true,
      stories: {
        where: { tipo: { in: ["MVP", "BAGRE", "SELECAO"] } },
        select: { tipo: true, texto: true },
      },
    },
  });

  return (
    <div style={{ minHeight: "100dvh", background: "#08080a" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 4,
        padding: "calc(env(safe-area-inset-top, 0px) + 20px) 12px 8px",
      }}>
        <Link href="/pelada" aria-label="Voltar" style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
          <ChevronLeft size={22} weight="Outline" />
        </Link>
        <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "#fff", textTransform: "uppercase" }}>
          Histórico de babas
        </h1>
      </div>

      {rodadas.length === 0 ? (
        <div style={{ padding: "40px 16px 80px", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "70dvh" }}>
          <EmptyState
            icon={<History size={26} weight="Outline" />}
            title="Nenhum baba encerrado ainda"
            description="Assim que a primeira votação fechar, o resultado aparece aqui."
          />
        </div>
      ) : (
        <main style={{ padding: "8px 16px calc(96px + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column", gap: 12 }}>
          {rodadas.map((r) => {
            const mvp = r.stories.find((s) => s.tipo === "MVP");
            const bagre = r.stories.find((s) => s.tipo === "BAGRE");
            const selecao = r.stories.find((s) => s.tipo === "SELECAO");
            return (
              <div key={r.id} style={{ background: "#0a0e0e", border: "1px solid #2c2c2c", borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "#7a7a7a", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                  {formatarData(r.data)}
                </span>
                {!mvp && !bagre && !selecao ? (
                  <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: 13, color: "#555" }}>Sem votos suficientes pra gerar resultado.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {mvp && <p style={{ margin: 0, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: "#fff" }}>{mvp.texto}</p>}
                    {bagre && <p style={{ margin: 0, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: "#fff" }}>{bagre.texto}</p>}
                    {selecao && <p style={{ margin: 0, fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 13, color: "#9a9a9a" }}>{selecao.texto}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </main>
      )}

      <BottomNav />
    </div>
  );
}
