"use client";

import Image from "next/image";
import { signOut } from "next-auth/react";
import { Envelope, Refresh } from "reicon-react";

/**
 * Tela pra quem logou sem convite válido: explica cedo (antes de qualquer
 * formulário) que a entrada é por link de convite, e o que fazer.
 */
export function ConviteNecessario() {
  return (
    <div style={{
      minHeight: "100dvh", background: "#090909",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "24px 20px", textAlign: "center", gap: 0,
    }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", marginBottom: 20 }}>
        <Image alt="Canelada" src="/logo.png" width={72} height={72} style={{ objectFit: "cover" }} />
      </div>

      <div style={{
        width: 52, height: 52, borderRadius: 14, marginBottom: 18,
        background: "#1c1c1c", border: "1px solid #2c2c2c",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Envelope size={26} color="#9fe870" weight="Outline" />
      </div>

      <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 24, lineHeight: "28px", color: "#fff" }}>
        Falta o convite
      </h1>
      <p style={{ margin: "10px 0 0", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 14.5, lineHeight: "21px", color: "#9a9a9a", maxWidth: 300 }}>
        O Canelada é fechado pro grupo do baba. Pede o <strong style={{ color: "#fff" }}>link de convite</strong> ao admin
        e abre ele aqui no navegador — o resto do cadastro libera na hora.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 28, width: "100%", maxWidth: 320 }}>
        <button
          onClick={() => window.location.reload()}
          style={{
            height: 50, borderRadius: 9999, border: "none",
            background: "#9fe870", color: "#0a1a06",
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            cursor: "pointer", WebkitTapHighlightColor: "transparent",
          }}
        >
          <Refresh size={18} weight="Outline" />
          Já abri o link — tentar de novo
        </button>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{
            height: 50, borderRadius: 9999,
            background: "transparent", border: "1px solid #2c2c2c", color: "#9a9a9a",
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15,
            cursor: "pointer", WebkitTapHighlightColor: "transparent",
          }}
        >
          Sair da conta
        </button>
      </div>
    </div>
  );
}
