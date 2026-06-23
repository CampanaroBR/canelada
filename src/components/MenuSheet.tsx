"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { User, UsersThree, SignOut, X, CaretRight } from "@phosphor-icons/react";
import { BottomSheet } from "./BottomSheet";

interface Props {
  open: boolean;
  onClose: () => void;
}

/** Bottom sheet do menu hambúrguer — compartilhado entre as telas. */
export function MenuSheet({ open, onClose }: Props) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px 16px" }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "#fff" }}>MENU</span>
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
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 16, color: "#ef4444" }}>Sair</span>
        </button>
      </div>
    </BottomSheet>
  );
}

function MenuRow({ icon, label, href, onClose }: { icon: React.ReactNode; label: string; href: string; onClose: () => void }) {
  return (
    <Link href={href} onClick={onClose} style={{ textDecoration: "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 8px", borderRadius: 12 }}>
        <div style={{ width: 40, height: 40, background: "#2a2a2a", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {icon}
        </div>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 16, color: "#fff" }}>{label}</span>
        <CaretRight size={16} color="#555" weight="bold" style={{ marginLeft: "auto" }} />
      </div>
    </Link>
  );
}
