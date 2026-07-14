"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarBlank, Alarm, BellSlash, HandWaving } from "@phosphor-icons/react";

type Votacao = { fase: "antes" | "aberta" | "encerrada"; aberta: boolean; texto: string } | null;

interface Props {
  open: boolean;
  onClose: () => void;
  votacao: Votacao;
  dataRodada: string | null;
  /** Admin vê a ação de cutucar quem ainda não votou. */
  isAdmin: boolean;
  /** Presentes na rodada que ainda não votaram. */
  faltamVotar: number;
}

const EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

/**
 * Dropdown ancorado no sino (canto superior direito) — mesmo padrão visual/de
 * animação do MenuSheet (hambúrguer, canto esquerdo). Hoje só mostra o status
 * da janela de votação (abre/fecha), que é a única notificação "ativa" que o
 * app já rastreia (as demais só existem como push, sem histórico em tela).
 */
export function NotificationsSheet({ open, onClose, votacao, dataRodada, isAdmin, faltamVotar }: Props) {
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
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, pointerEvents: visible ? "auto" : "none" }}
      />

      <div
        style={{
          position: "absolute",
          top: "calc(env(safe-area-inset-top, 0px) + 60px)",
          right: 8,
          width: 280,
          pointerEvents: "auto",
          background: "#141414",
          border: "1px solid #2c2c2c",
          borderRadius: 18,
          boxShadow: "0 16px 40px rgba(0,0,0,0.55)",
          overflow: "hidden",
          transformOrigin: "top right",
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.92)",
          transition: `opacity 180ms ${EASE}, transform 180ms ${EASE}`,
        }}
      >
        <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid #2c2c2c" }}>
          <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, letterSpacing: "0.04em", color: "#fff", textTransform: "uppercase" }}>
            Notificações
          </p>
        </div>

        {votacao ? (
          <Link
            href="/votacao"
            onClick={onClose}
            style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "14px 16px", textDecoration: "none" }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 12, flexShrink: 0,
              background: votacao.aberta ? "rgba(159,232,112,0.12)" : "rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {votacao.aberta ? <Alarm size={18} color="#9fe870" weight="bold" /> : <CalendarBlank size={18} color="#8a8a8a" weight="bold" />}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#fff" }}>
                {votacao.texto}
              </p>
              {dataRodada && (
                <p style={{ margin: 0, fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 12, color: "#8a8a8a" }}>
                  Rodada de {dataRodada}
                </p>
              )}
            </div>
          </Link>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "24px 16px" }}>
            <BellSlash size={22} color="#5a5a5a" weight="bold" />
            <p style={{ margin: 0, fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 13, color: "#8a8a8a", textAlign: "center" }}>
              Nenhuma notificação por enquanto.
            </p>
          </div>
        )}

        {/* Cutucar quem ainda não votou (admins) — abre o WhatsApp com a mensagem
            pronta. Cita só o número, nunca os nomes. */}
        {isAdmin && votacao?.fase === "aberta" && faltamVotar > 0 && (
          <button
            onClick={() => {
              const url = typeof window !== "undefined" ? window.location.origin : "";
              const quem = faltamVotar === 1 ? "Falta 1 pessoa" : `Faltam ${faltamVotar} pessoas`;
              const texto = `🗳️ *VOTAÇÃO ABERTA* — ${quem} votar!\n\nBora escolher os personagens da rodada 👀\nA votação fecha às 20h.\n\n${url}`;
              window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank");
              onClose();
            }}
            style={{
              width: "100%", boxSizing: "border-box", textAlign: "left",
              display: "flex", gap: 12, alignItems: "center", padding: "14px 16px",
              background: "none", border: "none", borderTop: "1px solid #2c2c2c",
              cursor: "pointer", WebkitTapHighlightColor: "transparent",
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 12, flexShrink: 0,
              background: "rgba(37,211,102,0.14)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <HandWaving size={18} color="#25D366" weight="bold" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
              <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#fff" }}>
                Cutucar {faltamVotar === 1 ? "quem falta" : `os ${faltamVotar} que faltam`}
              </p>
              <p style={{ margin: 0, fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 12, color: "#8a8a8a" }}>
                Manda a cobrança no WhatsApp
              </p>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
