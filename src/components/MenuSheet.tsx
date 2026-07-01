"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { User, UsersThree, SignOut } from "@phosphor-icons/react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const ITEMS = [
  { icon: User, label: "Meu Perfil", href: "/perfil" },
  { icon: UsersThree, label: "Meu Grupo", href: "/grupo" },
];

const EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

/**
 * Dropdown compacto ancorado perto do gatilho (canto superior esquerdo, onde fica o
 * hambúrguer) — não cobre a tela, não borra o fundo. Fecha tocando fora ou no próprio
 * ícone (que já vira X quando o menu abre).
 */
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
    const t = setTimeout(() => setMounted(false), 220);
    return () => clearTimeout(t);
  }, [open]);

  if (!mounted) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, pointerEvents: "none" }}>
      {/* camada invisível — só pra capturar o toque fora e fechar (sem escurecer/borrar) */}
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, pointerEvents: visible ? "auto" : "none" }}
      />

      {/* dropdown ancorado no canto esquerdo, sob o gatilho */}
      <div
        style={{
          position: "absolute",
          top: "calc(env(safe-area-inset-top, 0px) + 60px)",
          left: 8,
          width: 220,
          pointerEvents: "auto",
          background: "#141414",
          border: "1px solid #2c2c2c",
          borderRadius: 18,
          boxShadow: "0 16px 40px rgba(0,0,0,0.55)",
          overflow: "hidden",
          transformOrigin: "top left",
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.92)",
          transition: `opacity 180ms ${EASE}, transform 180ms ${EASE}`,
        }}
      >
        {ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              style={{
                textDecoration: "none",
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 14px",
              }}
            >
              <Icon size={18} color="#9fe870" weight="regular" />
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: "#fff" }}>
                {item.label}
              </span>
            </Link>
          );
        })}

        <div style={{ height: 1, background: "#232323" }} />

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{
            width: "100%",
            display: "flex", alignItems: "center", gap: 10,
            padding: "12px 14px",
            background: "none", border: "none", cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <SignOut size={18} color="#e56767" weight="regular" />
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: "#e56767" }}>Sair</span>
        </button>
      </div>
    </div>
  );
}
