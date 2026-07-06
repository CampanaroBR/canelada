"use client";

import { useEffect, useRef, useState } from "react";
import { token } from "../tokens";

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxHeight?: string;
  bg?: string;
  boxShadow?: string;
}

const DUR = 300;

/**
 * Bottom sheet compartilhado: slide suave, arrastar o handle pra baixo pra fechar,
 * toque no fundo pra fechar, ancorado no rodapé com safe-area (sem mostrar a tela atrás embaixo).
 */
export function BottomSheet({ open, onClose, children, maxHeight = "88dvh", bg, boxShadow }: BottomSheetProps) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  const [drag, setDrag] = useState(0);
  const [kb, setKb] = useState(0);
  const startY = useRef<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      if (timer.current) clearTimeout(timer.current);
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      timer.current = setTimeout(() => setMounted(false), DUR);
    }
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [open]);

  // Teclado no iOS: bottom:0 é relativo ao layout viewport, então o sheet fica
  // atrás do teclado ao focar um input. Sobe o sheet junto acompanhando o visualViewport.
  useEffect(() => {
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    if (!vv || !mounted) return;
    const onResize = () => setKb(Math.max(0, window.innerHeight - vv.height - vv.offsetTop));
    vv.addEventListener("resize", onResize);
    vv.addEventListener("scroll", onResize);
    onResize();
    return () => {
      vv.removeEventListener("resize", onResize);
      vv.removeEventListener("scroll", onResize);
      setKb(0);
    };
  }, [mounted]);

  if (!mounted) return null;

  const dragging = startY.current !== null;
  const start = (y: number) => { startY.current = y; setDrag(0); };
  const move = (y: number) => { if (startY.current == null) return; const dy = y - startY.current; if (dy > 0) setDrag(dy); };
  const end = () => { if (drag > 110) onClose(); setDrag(0); startY.current = null; };

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)",
          opacity: visible ? 1 : 0,
          transition: "opacity 300ms ease",
        }}
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: "fixed", bottom: kb, left: "50%",
          transform: `translateX(-50%) translateY(${visible ? `${drag}px` : "100%"})`,
          width: "min(100%, 430px)", zIndex: 51,
          maxHeight: kb > 0 ? `calc(${maxHeight} - ${kb}px)` : maxHeight,
          display: "flex", flexDirection: "column",
          background: bg ?? token("bg-surface-secondary-default"),
          border: `1px solid ${token("border-primary-default")}`, borderBottom: "none",
          borderRadius: "28px 28px 0 0",
          boxShadow: boxShadow ?? "0 -8px 40px rgba(0,0,0,0.5)",
          transition: dragging ? "none" : "transform 300ms cubic-bezier(0.32,0.72,0,1)",
          overflow: "hidden",
        }}
      >
        {/* Handle (zona de arraste) */}
        <div
          onTouchStart={(e) => start(e.touches[0].clientY)}
          onTouchMove={(e) => move(e.touches[0].clientY)}
          onTouchEnd={end}
          style={{ display: "flex", justifyContent: "center", padding: "12px 0 8px", flexShrink: 0, cursor: "grab", touchAction: "none" }}
        >
          <div style={{ width: 40, height: 4, background: "#3a3a3a", borderRadius: 9999 }} />
        </div>

        {/* Conteúdo (rola se passar da altura) — minHeight:0 é essencial p/ scroll em flex column */}
        <div style={{ overflowY: "auto", flex: "0 1 auto", minHeight: 0, paddingBottom: "max(20px, env(safe-area-inset-bottom, 20px))" }}>
          {children}
        </div>
      </div>
    </>
  );
}
