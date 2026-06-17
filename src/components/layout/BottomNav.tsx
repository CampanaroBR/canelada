"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, SoccerBall, ChartBar, Medal } from "@phosphor-icons/react";

const NAV_ITEMS = [
  { href: "/feed",     label: "Home",     icon: House,      matchActive: true },
  { href: "/pelada",   label: "Pelada",   icon: SoccerBall, matchActive: true },
  { href: "/medalhas", label: "Medalhas", icon: Medal,      matchActive: true },
  { href: "/ranking",  label: "Ranking",  icon: ChartBar,   matchActive: true },
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
    }}>
      <nav
        aria-label="Navegação principal"
        style={{
          margin: "0 8px 16px",
          display: "flex",
          alignItems: "flex-start",
          padding: "6px 15px",
          borderRadius: 32,
          background: "rgba(0,0,0,0.08)",
          border: "1px solid #393939",
          boxShadow: "0px 4px 4.7px 1px rgba(0,0,0,0.28)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          overflow: "clip",
        }}
      >
        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "space-between" }}>
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
                  width: 56, height: 56,
                  borderRadius: isActive ? 100 : undefined,
                  background: isActive ? "#9fe870" : undefined,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  padding: 8, overflow: "clip",
                  transition: "background 150ms cubic-bezier(0.23,1,0.32,1)",
                }}>
                  <div style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={28} color={isActive ? "#000" : "#fff"} weight={isActive ? "fill" : "regular"} />
                  </div>
                  <span style={{
                    fontFamily: "var(--font-display)", fontWeight: isActive ? 800 : 600,
                    fontSize: 10, lineHeight: "14px",
                    color: isActive ? "#000" : "#fff",
                    textAlign: "center", letterSpacing: "-0.2px", whiteSpace: "nowrap",
                    display: "block", width: "100%",
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
