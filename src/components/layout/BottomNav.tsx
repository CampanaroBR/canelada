"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/feed",
    label: "Feed",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/votacao",
    label: "Votação",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: "/perfil",
    label: "Perfil",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    href: "/ranking",
    label: "Ranking",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    /*
      Wrapper para safe-area — o pill flutua acima, não cola na borda.
      Só o wrapper preenche a safe area com background transparente.
    */
    <div style={{
      position: "fixed",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "min(100%, 430px)",
      zIndex: 30,
      /* Safe area preenchida com fundo semitransparente, não o pill */
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
      background: "linear-gradient(to top, rgba(10,10,10,0.85) 0%, transparent 100%)",
    }}>
      <nav
        aria-label="Navegação principal"
        style={{
          margin: "8px 16px 10px",
          borderRadius: "var(--radius-pill)",
          padding: "6px 8px",

          /* ── iOS 26 Liquid Glass ── */
          /* 1. Blur alto + saturação + brightness — efeito refrativo */
          backdropFilter: "blur(40px) saturate(200%) brightness(1.08)",
          WebkitBackdropFilter: "blur(40px) saturate(200%) brightness(1.08)",

          /* 2. Background semi-transparente com leve tint branco */
          background: "rgba(28, 28, 28, 0.55)",

          /* 3. Specular highlight topo + inner shadow base + sombra externa */
          boxShadow: [
            "inset 0 1px 0 rgba(255,255,255,0.18)",   /* aresta superior — reflexo de luz */
            "inset 0 -1px 0 rgba(0,0,0,0.20)",         /* aresta inferior — profundidade */
            "inset 1px 0 0 rgba(255,255,255,0.06)",    /* aresta esquerda */
            "inset -1px 0 0 rgba(255,255,255,0.06)",   /* aresta direita */
            "0 8px 32px rgba(0,0,0,0.45)",             /* sombra externa */
            "0 2px 8px rgba(0,0,0,0.30)",              /* sombra próxima */
          ].join(", "),

          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "3px",
                textDecoration: "none",
                WebkitTapHighlightColor: "transparent",
                /* Touch target 44×44px mínimo (fixing-accessibility) */
                minWidth: "44px",
                minHeight: "44px",
                justifyContent: "center",
                padding: "2px 8px",
              }}
            >
              <div style={{
                width: "44px",
                height: "34px",
                borderRadius: "var(--radius-md)",
                /* Item ativo: mini glass dentro do glass principal */
                background: isActive ? "rgba(159,232,112,0.15)" : "transparent",
                boxShadow: isActive
                  ? "inset 0 1px 0 rgba(159,232,112,0.25), 0 0 0 1px rgba(159,232,112,0.12)"
                  : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: isActive ? "var(--color-accent)" : "rgba(255,255,255,0.40)",
                /* Transição específica, nunca `all` */
                transition: "background 150ms cubic-bezier(0.23,1,0.32,1), color 150ms cubic-bezier(0.23,1,0.32,1), box-shadow 150ms cubic-bezier(0.23,1,0.32,1)",
              }}>
                {item.icon}
              </div>
              <span style={{
                fontSize: "10px",
                fontWeight: isActive ? 700 : 500,
                fontFamily: "var(--font-body)",
                letterSpacing: "0.02em",
                color: isActive ? "var(--color-accent)" : "rgba(255,255,255,0.35)",
                transition: "color 150ms cubic-bezier(0.23,1,0.32,1)",
              }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
