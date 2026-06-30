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

const TONE: Record<ToastType, { color: string; bg: string; icon: React.ReactNode }> = {
  success: {
    color: colors.semantic.success,
    bg: colors.bg.elevated,
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  },
  error: {
    color: colors.semantic.danger,
    bg: colors.bg.elevated,
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  },
  info: {
    color: colors.brand.primaryLight ?? colors.accent.default,
    bg: colors.bg.elevated,
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><line x1="12" y1="11" x2="12" y2="16" /><line x1="12" y1="8" x2="12" y2="8" /></svg>,
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
        background: "#202022",
        border: `1px solid ${tone.color}66`,
        borderLeft: `4px solid ${tone.color}`,
        borderRadius: radius.lg,
        boxShadow: shadow.lg,
        padding: "12px 14px",
        maxWidth: 360,
        width: "100%",
        boxSizing: "border-box",
        cursor: "pointer",
        animation: `bagre-toast-in ${motion.duration.base}ms ${motion.ease.spring}`,
      }}
    >
      <span style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: tone.color, color: colors.bg.base }}>
        {tone.icon}
      </span>
      <span style={{ flex: 1, fontFamily: font.body, fontWeight: 600, fontSize: 14, lineHeight: "18px", color: colors.text.primary }}>
        {t.message}
      </span>
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
