"use client";

import React, { useEffect, useState } from "react";
import { colors, font, radius, shadow, motion } from "./tokens";

export type ToastType = "success" | "error" | "info";
export interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

// ── store global (padrão pub/sub, chamável de qualquer lugar client) ──
let items: ToastItem[] = [];
let seq = 0;
const listeners = new Set<(t: ToastItem[]) => void>();
const emit = () => listeners.forEach((l) => l(items));

function dismiss(id: number) {
  items = items.filter((t) => t.id !== id);
  emit();
}
function show(message: string, type: ToastType = "info", duration = 3200) {
  const id = ++seq;
  items = [...items, { id, type, message }];
  emit();
  if (duration > 0) setTimeout(() => dismiss(id), duration);
  return id;
}

export const toast = {
  show,
  dismiss,
  success: (m: string, d?: number) => show(m, "success", d),
  error: (m: string, d?: number) => show(m, "error", d),
  info: (m: string, d?: number) => show(m, "info", d),
};

// Estilo "Filled" do Hive, recontextualizado: fundo sólido do status, ícone em
// círculo com a cor invertida, X pra fechar. Success usa o verde da marca.
const TONE: Record<ToastType, { bg: string; fg: string; iconBg: string; iconFg: string; icon: React.ReactNode }> = {
  success: {
    bg: colors.accent.default,        // #9fe870
    fg: "#0a1a06",
    iconBg: "#0a1a06",
    iconFg: colors.accent.default,
    icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  },
  error: {
    bg: "#d42020",
    fg: "#ffffff",
    iconBg: "#ffffff",
    iconFg: "#d42020",
    icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  },
  info: {
    bg: "#1c1c1c",
    fg: "#ffffff",
    iconBg: colors.accent.default,
    iconFg: "#0a1a06",
    icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><line x1="12" y1="11" x2="12" y2="16" /><line x1="12" y1="8" x2="12" y2="8" /></svg>,
  },
};

function ToastCard({ t }: { t: ToastItem }) {
  const tone = TONE[t.type];
  return (
    <div
      role="status"
      onClick={() => dismiss(t.id)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: tone.bg,
        border: t.type === "info" ? "1px solid #2c2c2c" : "none",
        borderRadius: radius.md,
        boxShadow: shadow.lg,
        padding: "10px 12px",
        maxWidth: 360,
        width: "100%",
        boxSizing: "border-box",
        cursor: "pointer",
        animation: `bagre-toast-in ${motion.duration.base}ms ${motion.ease.spring}`,
      }}
    >
      <span style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: tone.iconBg, color: tone.iconFg }}>
        {tone.icon}
      </span>
      <span style={{ flex: 1, fontFamily: font.body, fontWeight: 600, fontSize: 13.5, lineHeight: "18px", color: tone.fg }}>
        {t.message}
      </span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={tone.fg} strokeWidth="2.5" strokeLinecap="round" opacity={0.7} style={{ flexShrink: 0 }} aria-hidden>
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </div>
  );
}

/** Monte uma vez (ex.: no layout). Renderiza os toasts disparados por `toast.*`. */
export function Toaster() {
  const [list, setList] = useState<ToastItem[]>(items);
  useEffect(() => {
    listeners.add(setList);
    return () => { listeners.delete(setList); };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        bottom: "calc(96px + env(safe-area-inset-bottom, 0px))",
        zIndex: 1000,
        width: "min(100% - 24px, 430px)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      {list.map((t) => (
        <div key={t.id} style={{ width: "100%", pointerEvents: "auto" }}>
          <ToastCard t={t} />
        </div>
      ))}
      <style>{`@keyframes bagre-toast-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
