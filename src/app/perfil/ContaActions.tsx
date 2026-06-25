"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Medal, UsersThree, SignOut, CaretRight } from "@phosphor-icons/react";

export function ContaActions() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Atalhos */}
      <div style={{ background: "#0a0e0e", border: "1px solid #2c2c2c", borderRadius: 16, overflow: "hidden" }}>
        <Row href="/medalhas" icon={<Medal size={20} color="#9fe870" weight="fill" />} label="Minhas Badges" sub="Personagens e conquistas" />
        <div style={{ height: 1, background: "#1c1c1c" }} />
        <Row href="/grupo" icon={<UsersThree size={20} color="#fff" weight="regular" />} label="Meu Grupo" sub="Liga, jogadores e convite" />
      </div>

      {/* Sair */}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        style={{
          display: "flex", alignItems: "center", gap: 12, width: "100%",
          background: "#0a0e0e", border: "1px solid #2c2c2c", borderRadius: 16,
          padding: "14px 16px", cursor: "pointer", WebkitTapHighlightColor: "transparent",
        }}
      >
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#2a0a0a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <SignOut size={20} color="#ef4444" weight="regular" />
        </div>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15, color: "#ef4444" }}>Sair</span>
      </button>

      <p style={{ margin: 0, textAlign: "center", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 11, color: "#5a5a5a" }}>
        Canelada · v1.0
      </p>
    </div>
  );
}

function Row({ href, icon, label, sub }: { href: string; icon: React.ReactNode; label: string; sub: string }) {
  return (
    <Link href={href} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", textDecoration: "none", WebkitTapHighlightColor: "transparent" }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15, color: "#fff" }}>{label}</div>
        <div style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 12, color: "#7a7a7a" }}>{sub}</div>
      </div>
      <CaretRight size={16} color="#555" weight="bold" />
    </Link>
  );
}
