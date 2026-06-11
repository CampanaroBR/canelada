import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BottomNav } from "@/components/layout/BottomNav";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div style={{ minHeight: "100dvh", background: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
      <header style={{
        height: "56px",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        borderBottom: "1px solid var(--color-border-muted)",
      }}>
        <span style={{
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: "20px",
          letterSpacing: "0.08em",
          color: "var(--color-accent)",
          textTransform: "uppercase",
        }}>
          RANKING
        </span>
      </header>

      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 24px 96px",
        textAlign: "center",
        gap: "16px",
      }}>
        <div style={{ fontSize: "72px", opacity: 0.1 }}>🏆</div>
        <h2 style={{
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: "clamp(42px, 11vw, 56px)",
          lineHeight: 0.88,
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
        }}>
          EM BREVE.
        </h2>
        <p style={{
          fontSize: "14px",
          color: "var(--color-text-muted)",
          fontFamily: "var(--font-body)",
          opacity: 0.6,
        }}>
          O ranking aparece depois da primeira baba.
        </p>
      </main>

      <BottomNav />
    </div>
  );
}
