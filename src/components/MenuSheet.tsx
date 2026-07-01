"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { User, UsersThree, SignOut } from "@phosphor-icons/react";
import { HamburgerIcon } from "./HamburgerIcon";

interface Props {
  open: boolean;
  onClose: () => void;
}

const ITEMS = [
  { icon: User, label: "Meu Perfil", href: "/perfil" },
  { icon: UsersThree, label: "Meu Grupo", href: "/grupo" },
];

const EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

/** Menu full-screen — glass blur, hambúrguer que vira X, itens com entrada escalonada. */
export function MenuSheet({ open, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
    const t = setTimeout(() => setMounted(false), 420);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        justifyContent: "center",
      }}
    >
      {/* backdrop com blur */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(9,9,9,0.72)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          opacity: visible ? 1 : 0,
          transition: `opacity 380ms ${EASE}`,
        }}
      />

      {/* conteúdo, ancorado na largura do app-shell */}
      <div
        style={{
          position: "relative",
          width: "min(100%, 430px)",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Topbar: logo + botão que morfa em X */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "calc(env(safe-area-inset-top, 0px) + 12px) 20px 0" }}>
          <div
            style={{
              display: "flex", alignItems: "center", gap: 8,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(-8px)",
              transition: `opacity 340ms ${EASE} 40ms, transform 340ms ${EASE} 40ms`,
            }}
          >
            <Image alt="Canelada" src="/logo.png" width={30} height={30} style={{ objectFit: "cover", borderRadius: "50%" }} />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14, letterSpacing: "0.08em", color: "#7a7a7a", textTransform: "uppercase" }}>
              Canelada
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Fechar menu"
            style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "rgba(255,255,255,0.06)", border: "1px solid #2c2c2c",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", WebkitTapHighlightColor: "transparent",
              transition: `transform 200ms ${EASE}, background 200ms`,
            }}
            onPointerDown={(e) => { e.currentTarget.style.transform = "scale(0.94)"; }}
            onPointerUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            onPointerLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            <HamburgerIcon open={visible} size={18} />
          </button>
        </div>

        {/* Navegação principal, entrada escalonada */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 20px", gap: 4 }}>
          {ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                style={{
                  textDecoration: "none",
                  display: "flex", alignItems: "center", gap: 16,
                  padding: "20px 4px",
                  borderBottom: i < ITEMS.length - 1 ? "1px solid #1c1c1c" : "none",
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(28px)",
                  transition: `opacity 460ms ${EASE} ${120 + i * 70}ms, transform 460ms ${EASE} ${120 + i * 70}ms`,
                }}
              >
                <Icon size={22} color="#9fe870" weight="regular" />
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 30, lineHeight: "34px", color: "#fff" }}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Sair — CTA fixo no rodapé */}
        <div
          style={{
            padding: "0 20px calc(env(safe-area-inset-bottom, 0px) + 24px)",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
            transition: `opacity 420ms ${EASE} ${120 + ITEMS.length * 70 + 40}ms, transform 420ms ${EASE} ${120 + ITEMS.length * 70 + 40}ms`,
          }}
        >
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            style={{
              width: "100%", height: 54,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              background: "rgba(229,103,103,0.08)", border: "1px solid rgba(229,103,103,0.3)",
              borderRadius: 9999, cursor: "pointer", WebkitTapHighlightColor: "transparent",
              transition: `transform 200ms ${EASE}`,
            }}
            onPointerDown={(e) => { e.currentTarget.style.transform = "scale(0.97)"; }}
            onPointerUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            onPointerLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            <SignOut size={18} color="#e56767" weight="bold" />
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "#e56767" }}>Sair</span>
          </button>
        </div>
      </div>
    </div>
  );
}
