"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/feed",
    label: "Feed",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/votacao",
    label: "Votação",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: "/perfil",
    label: "Perfil",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    href: "/ranking",
    label: "Ranking",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: "fixed",
      bottom: 0,
      /* Center within max-width on wider screens */
      left: "50%",
      transform: "translateX(-50%)",
      width: "min(100%, 430px)",
      zIndex: 30,
      padding: "8px 12px",
      /* Explicit 2-part padding so the inner 8px + safe area sum correctly */
      paddingBottom: "max(12px, env(safe-area-inset-bottom, 0px))",
      background: "rgba(10,10,10,0.94)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderTop: "1px solid var(--color-border-muted)",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
      }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "3px",
                textDecoration: "none",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <div style={{
                width: "44px",
                height: "44px",
                borderRadius: "var(--radius-sm)",
                background: isActive ? "rgba(181,255,77,0.14)" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: isActive ? "var(--color-accent)" : "var(--color-text-muted)",
                transition: "background 0.15s, color 0.15s",
              }}>
                {item.icon}
              </div>
              <span style={{
                fontSize: "10px",
                fontWeight: isActive ? 700 : 500,
                fontFamily: "var(--font-body)",
                letterSpacing: "0.02em",
                color: isActive ? "var(--color-accent)" : "var(--color-text-muted)",
                transition: "color 0.15s",
              }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
