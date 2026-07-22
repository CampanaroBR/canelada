"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "reicon-react";

/** Volta pra tela anterior (histórico do navegador) em vez de sempre pra /feed. */
export function BackButton({ size = 24 }: { size?: number }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      aria-label="Voltar"
      style={{ width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", background: "none", border: "none", cursor: "pointer", flexShrink: 0, WebkitTapHighlightColor: "transparent" }}
    >
      <ChevronLeft size={size} color="#fff" weight="Outline" />
    </button>
  );
}
