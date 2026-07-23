"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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

// Comportamento tipo Instagram: rolando pra BAIXO a navbar encolhe (só ícones);
// rolando pra CIMA ela volta ao tamanho cheio (com labels). Perto do topo fica
// sempre cheia. `threshold` evita tremer a cada pixel de scroll.
function useCompactOnScroll(threshold = 6) {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const dy = y - last;
        if (y < 24) setCompact(false);                 // topo → sempre cheia
        else if (Math.abs(dy) > threshold) setCompact(dy > 0); // desceu → encolhe
        if (Math.abs(dy) > threshold || y < 24) last = y;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return compact;
}

export function BottomNav() {
  const pathname = usePathname();
  const compact = useCompactOnScroll();
  // Aba "Baba" é só de administração de rodada (criar/gerenciar) — usuário
  // comum não faz nada útil ali (vê só "Aguardando rodada"). Some pra ele,
  // deixando só os 3 ícones que ele realmente usa.
  const isAdmin = useIsAdmin();
  const items = isAdmin ? NAV_ITEMS : NAV_ITEMS.filter((i) => i.href !== "/pelada");
  const spring = { type: "spring" as const, stiffness: 420, damping: 32 };

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
      <motion.nav
        aria-label="Navegação principal"
        className="glass-nav"
        style={{
          display: "inline-flex",
          alignItems: "center",
          borderRadius: 28,
          border: "1px solid #393939",
          overflow: "clip",
        }}
        animate={{ padding: compact ? "4px 8px" : "5px 10px" }}
        transition={spring}
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
                <motion.div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 48,
                    padding: 5,
                    background: isActive ? "#9fe870" : "transparent",
                    overflow: "clip",
                    transition: "background 180ms cubic-bezier(0.34,1.56,0.64,1)",
                  }}
                  // encolhe/cresce a altura e o raio junto (pill vira círculo no compacto)
                  animate={{ height: compact ? 40 : 48, borderRadius: isActive ? 9999 : compact ? 12 : 14 }}
                  transition={spring}
                >
                  <motion.div
                    style={{
                      width: 24,
                      height: 24,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      // fundo da navbar é bem transparente (glass) — sombra garante contraste
                      // do ícone/label inativos mesmo com conteúdo claro passando atrás
                      filter: isActive ? "none" : "drop-shadow(0 1px 2px rgba(0,0,0,0.7))",
                    }}
                    animate={isActive ? { scale: [1, 1.25, 1], marginBottom: compact ? 0 : -1 } : { scale: 1, marginBottom: compact ? 0 : -1 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    <item.Icon size={24} color={isActive ? "#000" : "#fff"} weight="Outline" />
                  </motion.div>
                  {/* Label some no compacto (altura + opacidade animadas) */}
                  <motion.span
                    aria-hidden={compact}
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: isActive ? 800 : 600,
                      fontSize: 9.5,
                      lineHeight: "13px",
                      letterSpacing: "-0.2px",
                      color: isActive ? "#000" : "#fff",
                      textAlign: "center",
                      whiteSpace: "nowrap",
                      display: "block",
                      overflow: "hidden",
                      textShadow: isActive ? "none" : "0 1px 2px rgba(0,0,0,0.7)",
                    }}
                    animate={{ height: compact ? 0 : 13, opacity: compact ? 0 : 1 }}
                    transition={spring}
                  >
                    {item.label}
                  </motion.span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </motion.nav>
    </div>
  );
}
