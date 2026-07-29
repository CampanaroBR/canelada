"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { excluirRodada } from "@/app/votacao/actions";
import { toast } from "@/ds/toast";

/**
 * Excluir rodada vazia — saída pra rodada criada por engano (o "Baba rolou
 * hoje" cria num toque). Discreto de propósito: é ação destrutiva, não deve
 * competir visualmente com as ações do dia a dia.
 *
 * A trava de verdade está no servidor (`excluirRodada` recusa rodada com voto,
 * presença, chegada ou story). Aqui é só confirmação em dois toques, igual ao
 * botão de criar.
 */
export function BotaoExcluirRodada({ rodadaId }: { rodadaId: string }) {
  const router = useRouter();
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
    const res = await excluirRodada(rodadaId);
    setEnviando(false);
    setArmado(false);
    if ("error" in res) { toast.error(res.error ?? "Erro ao excluir."); return; }
    toast.success("Rodada excluída");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={enviando}
      style={{
        width: "100%", background: "none", border: "none", padding: "10px 0",
        color: armado ? "#e56767" : "#6e6e6e",
        fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13,
        cursor: "pointer", opacity: enviando ? 0.5 : 1,
        transition: "color 180ms",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {enviando ? "Excluindo..." : armado ? "Toque de novo pra excluir" : "Criei sem querer — excluir rodada"}
    </button>
  );
}
