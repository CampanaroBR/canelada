"use client";

import { useRouter } from "next/navigation";

/** Volta pra tela anterior (histórico do navegador) em vez de sempre pra /feed. */
export function BackButton({ size = 24 }: { size?: number }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      aria-label="Voltar"
      style={{ width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", background: "none", border: "none", cursor: "pointer", flexShrink: 0, WebkitTapHighlightColor: "transparent" }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
    </button>
  );
}
