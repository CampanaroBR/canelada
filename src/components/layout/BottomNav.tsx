"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, SoccerBall, Medal, ChartBar } from "@phosphor-icons/react";

const NAV_ITEMS: Array<{
  href: string;
  label: string;
  Icon: typeof Medal;
}> = [
  { href: "/feed",     label: "Home",    Icon: House      },
  { href: "/pelada",   label: "Baba",    Icon: SoccerBall },
  { href: "/medalhas", label: "Badges",  Icon: Medal      },
  { href: "/ranking",  label: "Ranking", Icon: ChartBar   },
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
      display: "flex",
      justifyContent: "center",
      padding: "0 0 max(8px, env(safe-area-inset-bottom, 8px))",
    }}>
      <nav
        aria-label="Navegação principal"
        className="glass-nav"
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "5px 10px",
          borderRadius: 28,
          // sem overflow:clip — no WebKit ele pode desativar o backdrop-filter
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {NAV_ITEMS.map((item, i) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
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
                  width: 48,
                  height: 48,
                  padding: 5,
                  borderRadius: isActive ? 9999 : 14,
                  background: isActive ? "#9fe870" : "transparent",
                  overflow: "clip",
                  transition: "background 180ms cubic-bezier(0.34,1.56,0.64,1), border-radius 180ms cubic-bezier(0.34,1.56,0.64,1)",
                }}>
                  <div style={{
                    width: 24,
                    height: 24,
                    marginBottom: -1,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <item.Icon size={24} color={isActive ? "#000" : "#fff"} weight="regular" />
                  </div>
                  <span style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: isActive ? 800 : 600,
                    fontSize: 9.5,
                    lineHeight: "13px",
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
