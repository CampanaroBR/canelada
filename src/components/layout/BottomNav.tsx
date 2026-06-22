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
          padding: "8px 16px",
          borderRadius: 32,
          border: "1px solid #393939",
          overflow: "clip",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
                  width: 56,
                  height: 56,
                  padding: 8,
                  borderRadius: isActive ? 9999 : 16,
                  background: isActive ? "#9fe870" : "transparent",
                  overflow: "clip",
                  transition: "background 180ms cubic-bezier(0.34,1.56,0.64,1), border-radius 180ms cubic-bezier(0.34,1.56,0.64,1)",
                }}>
                  <div style={{
                    width: 28,
                    height: 28,
                    marginBottom: -2,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <item.Icon size={28} color={isActive ? "#000" : "#fff"} weight="regular" />
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
