"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, SoccerBall, CheckCircle, ChartBar } from "@phosphor-icons/react";

const NAV_ITEMS = [
  { href: "/feed",    label: "Home",    icon: House,       matchActive: true },
  { href: "/pelada",  label: "Baba",    icon: SoccerBall,  matchActive: true },
  { href: "/votacao", label: "Votos",   icon: CheckCircle, matchActive: true },
  { href: "/ranking", label: "Ranking", icon: ChartBar,    matchActive: true },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "min(100%, 430px)",
      zIndex: 30,
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
      display: "flex",
      justifyContent: "center",
      padding: "0 0 max(8px, env(safe-area-inset-bottom, 8px))",
    }}>
      <nav
        aria-label="Navegação principal"
        style={{
          /* iOS 27 liquid glass */
          display: "inline-flex",
          alignItems: "center",
          padding: "2px 8px",
          borderRadius: 32,
          background: "rgba(30, 30, 32, 0.55)",
          backdropFilter: "blur(48px) saturate(200%) brightness(1.12)",
          WebkitBackdropFilter: "blur(48px) saturate(200%) brightness(1.12)",
          border: "1px solid rgba(255,255,255,0.13)",
          boxShadow: [
            "0 8px 40px rgba(0,0,0,0.55)",
            "inset 0 1.5px 0 rgba(255,255,255,0.22)",
            "inset 0 -1px 0 rgba(255,255,255,0.04)",
            "inset 1px 0 0 rgba(255,255,255,0.06)",
            "inset -1px 0 0 rgba(255,255,255,0.06)",
          ].join(", "),
          overflow: "clip",
        }}
      >
        {/* Items centrados com gap fixo — sem flex-1 que estica */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {NAV_ITEMS.map((item, i) => {
            const isActive = item.matchActive && (pathname === item.href || pathname.startsWith(item.href + "/"));
            const Icon = item.icon;
            return (
              <Link
                key={`${item.href}-${i}`}
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                style={{ textDecoration: "none", WebkitTapHighlightColor: "transparent" }}
              >
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: isActive ? undefined : 56,
                  height: isActive ? undefined : 56,
                  padding: isActive ? "4px 12px" : 8,
                  borderRadius: isActive ? 100 : 16,
                  background: isActive ? "#9fe870" : "transparent",
                  overflow: "clip",
                  transition: "background 180ms cubic-bezier(0.34,1.56,0.64,1), border-radius 180ms cubic-bezier(0.34,1.56,0.64,1)",
                }}>
                  <div style={{
                    width: 28, height: 28,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: isActive ? -4 : -2,
                  }}>
                    <Icon
                      size={28}
                      color={isActive ? "#000" : "#fff"}
                      weight={isActive ? "fill" : "regular"}
                    />
                  </div>
                  <span style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: isActive ? 800 : 600,
                    fontSize: 10,
                    lineHeight: "14px",
                    letterSpacing: "-0.2px",
                    color: isActive ? "#000" : "#fff",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    display: "block",
                  }}>
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
