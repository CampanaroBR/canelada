"use client";

import { useEffect, useState } from "react";

/**
 * "Baba rolou hoje" com confirmação em DOIS toques.
 *
 * Antes era um `<form action={criarRodada}>` com um botão de largura inteira na
 * Home: um toque acidental criava rodada na hora, sem aviso e sem desfazer —
 * e foi assim que nasceu uma rodada fantasma (0 votos, 0 presentes) que depois
 * precisou ser apagada no banco. Criar rodada é ação que o grupo inteiro vê
 * (vira a rodada ativa, abre votação), então merece confirmação.
 *
 * O 2º toque volta ao normal sozinho em 4s, pra não ficar "armado" na tela.
 */
export function BotaoCriarRodada({ action, style }: { action: () => Promise<void>; style?: React.CSSProperties }) {
  const [armado, setArmado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!armado) return;
    const t = setTimeout(() => setArmado(false), 4000);
    return () => clearTimeout(t);
  }, [armado]);

  async function onClick() {
    if (enviando) return;
    if (!armado) { setArmado(true); return; }
    setEnviando(true);
    try { await action(); } finally { setEnviando(false); setArmado(false); }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={enviando}
      aria-label={armado ? "Confirmar criação da rodada" : "Marcar que o baba rolou hoje"}
      style={{
        width: "100%", borderRadius: 14, padding: "13px 16px", cursor: "pointer",
        fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18,
        letterSpacing: "-0.8px", transition: "background 180ms, color 180ms",
        background: armado ? "#9fe870" : "#0d0d0d",
        border: armado ? "1px solid #9fe870" : "1px solid #090909",
        color: armado ? "#0a1a06" : "#9fe870",
        opacity: enviando ? 0.6 : 1,
        WebkitTapHighlightColor: "transparent",
        ...style,
      }}
    >
      {enviando ? "CRIANDO..." : armado ? "TOQUE DE NOVO PRA CONFIRMAR" : "⚽ BABA ROLOU HOJE"}
    </button>
  );
}
