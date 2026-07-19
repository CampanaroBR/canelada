"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { House, Football, Medal, ChartBar } from "reicon-react";
import { useIsAdmin } from "@/lib/useIsAdmin";

const NAV_ITEMS: Array<{
  href: string;
  label: string;
  Icon: typeof Medal;
}> = [
  { href: "/feed",     label: "Home",    Icon: House      },
  { href: "/pelada",   label: "Baba",    Icon: Football },
  { href: "/medalhas", label: "Badges",  Icon: Medal      },
  { href: "/ranking",  label: "Ranking", Icon: ChartBar   },
];

export function BottomNav() {
  const pathname = usePathname();
  // Aba "Baba" é só de administração de rodada (criar/gerenciar) — usuário
  // comum não faz nada útil ali (vê só "Aguardando rodada"). Some pra ele,
  // deixando só os 3 ícones que ele realmente usa.
  const isAdmin = useIsAdmin();
  const items = isAdmin ? NAV_ITEMS : NAV_ITEMS.filter((i) => i.href !== "/pelada");

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
          border: "1px solid #393939",
          overflow: "clip",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {items.map((item, i) => {
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
                  <motion.div
                    style={{
                      width: 24,
                      height: 24,
                      marginBottom: -1,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      // fundo da navbar é bem transparente (glass) — sombra garante contraste
                      // do ícone/label inativos mesmo com conteúdo claro passando atrás
                      filter: isActive ? "none" : "drop-shadow(0 1px 2px rgba(0,0,0,0.7))",
                    }}
                    animate={isActive ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    <item.Icon size={24} color={isActive ? "#000" : "#fff"} weight="Outline" />
                  </motion.div>
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
                    textShadow: isActive ? "none" : "0 1px 2px rgba(0,0,0,0.7)",
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
