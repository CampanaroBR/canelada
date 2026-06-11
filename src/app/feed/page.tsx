import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { StoryCard, type StoryWithRodada } from "./StoryCard";
import { BottomNav } from "@/components/layout/BottomNav";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const jogador = await prisma.jogador.findUnique({
    where: { userId: session.user.id },
    select: { grupoId: true },
  });
  if (!jogador) redirect("/onboarding");

  const stories = await prisma.story.findMany({
    where: { rodada: { grupoId: jogador.grupoId } },
    include: { rodada: { select: { data: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div style={{ minHeight: "100dvh", background: "var(--color-bg)" }}>

      {/* Sticky header */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        background: "rgba(10,10,10,0.90)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
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
          CANELADA
        </span>
        <button
          aria-label="Notificações"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            color: "var(--color-text-muted)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
      </header>

      {/* Content */}
      <main style={{
        padding: "16px 16px 96px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        minHeight: "calc(100dvh - 56px)",
      }}>
        {stories.length === 0
          ? <EmptyFeed />
          : (stories as StoryWithRodada[]).map((story) => (
              <StoryCard key={story.id} story={story} />
            ))
        }
      </main>

      {/* FAB */}
      <Link
        href="/votacao"
        style={{
          position: "fixed",
          bottom: "76px",
          right: "20px",
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "var(--color-accent)",
          color: "var(--color-on-accent)",
          borderRadius: "var(--radius-pill)",
          padding: "12px 18px",
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: "14px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          textDecoration: "none",
          boxShadow: "var(--shadow-accent), var(--shadow-lg)",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ fontSize: "17px" }}>⚽</span>
        BABA ROLOU HOJE
      </Link>

      <BottomNav />
    </div>
  );
}

function EmptyFeed() {
  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "80px 24px 40px",
      textAlign: "center",
      gap: "20px",
    }}>
      {/* Ghost ball */}
      <div style={{
        fontSize: "88px",
        lineHeight: 1,
        filter: "grayscale(1)",
        opacity: 0.08,
        userSelect: "none",
      }}>
        ⚽
      </div>

      <div>
        <h2 style={{
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: "clamp(48px, 13vw, 64px)",
          lineHeight: 0.88,
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
          marginBottom: "16px",
        }}>
          TUDO<br />QUIETO.
        </h2>
        <p style={{
          fontSize: "14px",
          color: "var(--color-text-muted)",
          fontFamily: "var(--font-body)",
          lineHeight: 1.6,
          maxWidth: "220px",
          margin: "0 auto",
          opacity: 0.7,
        }}>
          Quando a pelada rolar, os stories aparecem aqui.
        </p>
      </div>
    </div>
  );
}
