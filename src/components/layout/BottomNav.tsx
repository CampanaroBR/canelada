"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Medal } from "@phosphor-icons/react";

const NAV_ITEMS: Array<{
  href: string;
  label: string;
  iconSvg?: string;
  PhosphorIcon?: typeof Medal;
}> = [
  { href: "/feed",     label: "Home",    iconSvg: "/nav-home.svg"    },
  { href: "/pelada",   label: "Baba",    iconSvg: "/nav-baba.svg"    },
  { href: "/medalhas", label: "Badges",  PhosphorIcon: Medal         },
  { href: "/ranking",  label: "Ranking", iconSvg: "/nav-ranking.svg" },
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
        style={{
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
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
                  width: isActive ? undefined : 56,
                  height: isActive ? undefined : 56,
                  padding: isActive ? "4px 12px" : 8,
                  borderRadius: isActive ? 100 : 16,
                  background: isActive ? "#9fe870" : "transparent",
                  overflow: "clip",
                  transition: "background 180ms cubic-bezier(0.34,1.56,0.64,1), border-radius 180ms cubic-bezier(0.34,1.56,0.64,1)",
                }}>
                  <div style={{
                    width: 28,
                    height: 28,
                    position: "relative",
                    marginBottom: isActive ? -4 : -2,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    {item.iconSvg ? (
                      <img
                        alt=""
                        src={item.iconSvg}
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          display: "block",
                          filter: isActive ? "brightness(0)" : "brightness(0) invert(1)",
                        }}
                      />
                    ) : item.PhosphorIcon ? (
                      <item.PhosphorIcon
                        size={28}
                        color={isActive ? "#000" : "#fff"}
                        weight={isActive ? "fill" : "regular"}
                      />
                    ) : null}
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
