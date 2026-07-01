"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { User, UsersThree, SignOut, CaretRight, X } from "@phosphor-icons/react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const ITEMS = [
  { icon: User, label: "Meu Perfil", href: "/perfil" },
  { icon: UsersThree, label: "Meu Grupo", href: "/grupo" },
];

const EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

/** Menu — painel compacto ancorado no topo, com blur de fundo e entrada escalonada. */
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
    const t = setTimeout(() => setMounted(false), 320);
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
      {/* backdrop com blur — cobre a tela toda, clique fecha */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(9,9,9,0.6)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          opacity: visible ? 1 : 0,
          transition: `opacity 280ms ${EASE}`,
        }}
      />

      {/* painel compacto, ancorado no topo — sem stretch, só ocupa a altura do próprio conteúdo,
          deixando o resto da tela clicável (fecha no backdrop) */}
      <div
        style={{
          position: "relative",
          alignSelf: "flex-start",
          pointerEvents: "none",
          width: "min(100%, 430px)",
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)",
          paddingLeft: 12,
          paddingRight: 12,
        }}
      >
        {/* Fechar — sempre visível, acima do painel */}
        <div
          style={{
            display: "flex", justifyContent: "flex-end", paddingRight: 4, marginBottom: 8,
            opacity: visible ? 1 : 0,
            pointerEvents: "auto",
            transition: `opacity 200ms ${EASE}`,
          }}
        >
          <button
            onClick={onClose}
            aria-label="Fechar menu"
            style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "#141414", border: "1px solid #2c2c2c",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", WebkitTapHighlightColor: "transparent",
              transition: `transform 180ms ${EASE}`,
            }}
            onPointerDown={(e) => { e.currentTarget.style.transform = "scale(0.92)"; }}
            onPointerUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            onPointerLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            <X size={18} color="#fff" weight="bold" />
          </button>
        </div>

        <div
          style={{
            background: "#141414",
            border: "1px solid #2c2c2c",
            borderRadius: 20,
            boxShadow: "0 20px 48px rgba(0,0,0,0.5)",
            overflow: "hidden",
            transformOrigin: "top center",
            opacity: visible ? 1 : 0,
            pointerEvents: "auto",
            transform: visible ? "scale(1) translateY(0)" : "scale(0.94) translateY(-8px)",
            transition: `opacity 260ms ${EASE}, transform 260ms ${EASE}`,
          }}
        >
          {ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                style={{
                  textDecoration: "none",
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 16px",
                  borderBottom: "1px solid #232323",
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(10px)",
                  transition: `opacity 260ms ${EASE} ${60 + i * 40}ms, transform 260ms ${EASE} ${60 + i * 40}ms`,
                }}
              >
                <Icon size={20} color="#9fe870" weight="regular" />
                <span style={{ flex: 1, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15, color: "#fff" }}>
                  {item.label}
                </span>
                <CaretRight size={16} color="#555" weight="bold" />
              </Link>
            );
          })}

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            style={{
              width: "100%",
              display: "flex", alignItems: "center", gap: 12,
              padding: "14px 16px",
              background: "none", border: "none", cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(10px)",
              transition: `opacity 260ms ${EASE} ${60 + ITEMS.length * 40}ms, transform 260ms ${EASE} ${60 + ITEMS.length * 40}ms`,
            }}
          >
            <SignOut size={20} color="#e56767" weight="regular" />
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15, color: "#e56767" }}>Sair</span>
          </button>
        </div>
      </div>
    </div>
  );
}
