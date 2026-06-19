"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { User, UsersThree, SignOut, X, CaretRight } from "@phosphor-icons/react";

interface Props {
  open: boolean;
  onClose: () => void;
}

/** Bottom sheet do menu hambúrguer — compartilhado entre as telas. */
export function MenuSheet({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        style={{
          position: "fixed", top: 0, bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "min(100%, 430px)", zIndex: 50,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)",
        }}
      />
      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "min(100%, 430px)", zIndex: 51,
          background: "#1a1a1a",
          border: "1px solid #2e2e2e",
          borderRadius: "32px 32px 0 0",
          paddingBottom: "max(24px, env(safe-area-inset-bottom, 24px))",
          animation: "sheet-up 0.32s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 8px" }}>
          <div style={{ width: 40, height: 4, background: "#3a3a3a", borderRadius: 9999 }} />
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 16px 16px" }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "#fff" }}>
            MENU
          </span>
          <button
            onClick={onClose}
            aria-label="Fechar"
            style={{ width: 40, height: 40, background: "#000", border: "1px solid #424242", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <X size={16} color="#fff" weight="bold" />
          </button>
        </div>

        {/* Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 16px" }}>
          <MenuRow icon={<User size={20} color="#fff" weight="regular" />} label="Meu Perfil" href="/perfil" onClose={onClose} />
          <MenuRow icon={<UsersThree size={20} color="#fff" weight="regular" />} label="Meu Grupo" href="/grupo" onClose={onClose} />
          <div style={{ height: 1, background: "#2a2a2a", margin: "8px 0" }} />
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              background: "none", border: "none", cursor: "pointer",
              padding: "14px 8px", borderRadius: 12, width: "100%",
            }}
          >
            <div style={{ width: 40, height: 40, background: "#2a0a0a", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <SignOut size={20} color="#ef4444" weight="regular" />
            </div>
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 16, color: "#ef4444" }}>
              Sair
            </span>
          </button>
        </div>
      </div>
    </>
  );
}

function MenuRow({ icon, label, href, onClose }: { icon: React.ReactNode; label: string; href: string; onClose: () => void }) {
  return (
    <Link href={href} onClick={onClose} style={{ textDecoration: "none" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "14px 8px", borderRadius: 12,
      }}>
        <div style={{ width: 40, height: 40, background: "#2a2a2a", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {icon}
        </div>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 16, color: "#fff" }}>
          {label}
        </span>
        <CaretRight size={16} color="#555" weight="bold" style={{ marginLeft: "auto" }} />
      </div>
    </Link>
  );
}
