"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "@phosphor-icons/react";
import { enablePush } from "@/lib/pushClient";

const DISMISS_KEY = "canelada-notif-prompt-dismissed";
const EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

/**
 * Aparece só quando o app está INSTALADO (standalone) e a permissão de notificação
 * ainda está "default" — cobre o iPhone, onde a permissão dada no Safari não migra
 * pro app da tela de início. Um toque em "Ativar" dispara o pedido nativo.
 */
export function EnableNotificationsPrompt() {
  const [show, setShow] = useState(false);
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isStandalone()) return;
    if (!("Notification" in window) || Notification.permission !== "default") return;
    if (localStorage.getItem(DISMISS_KEY)) return;
    const t = setTimeout(() => { setShow(true); requestAnimationFrame(() => setVisible(true)); }, 1500);
    return () => clearTimeout(t);
  }, []);

  function close(remember: boolean) {
    if (remember) localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
    setTimeout(() => setShow(false), 300);
  }

  async function activate() {
    if (busy) return;
    setBusy(true);
    const ok = await enablePush();
    setBusy(false);
    // concedeu ou negou de vez: não insistir de novo
    close(true);
    void ok;
  }

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        transform: `translateX(-50%) translateY(${visible ? 0 : 24}px)`,
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 96px)",
        width: "min(calc(100% - 24px), 406px)",
        zIndex: 150,
        background: "#141414",
        border: "1px solid #2c2c2c",
        borderRadius: 20,
        boxShadow: "0 16px 40px rgba(0,0,0,0.55)",
        padding: 18,
        opacity: visible ? 1 : 0,
        transition: `opacity 300ms ${EASE}, transform 300ms ${EASE}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 13, flexShrink: 0,
          background: "rgba(159,232,112,0.14)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Bell size={24} color="#9fe870" weight="regular" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, lineHeight: "22px", color: "#fff" }}>
            Ativar avisos do baba? 🔔
          </p>
          <p style={{ margin: "2px 0 0", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 13.5, lineHeight: "19px", color: "#9a9a9a" }}>
            Lista confirmada, votação aberta e resultados — direto na tela.
          </p>
        </div>
        <button
          onClick={() => close(true)}
          aria-label="Dispensar"
          style={{
            width: 32, height: 32, borderRadius: 16, flexShrink: 0, alignSelf: "flex-start",
            background: "rgba(255,255,255,0.06)", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <X size={14} color="#8a8a8a" weight="bold" />
        </button>
      </div>

      <button
        onClick={activate}
        disabled={busy}
        style={{
          marginTop: 14, width: "100%", height: 48, borderRadius: 9999,
          background: busy ? "#5f7a44" : "#9fe870", border: "none",
          cursor: busy ? "default" : "pointer",
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "#0a1a06",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {busy ? "Ativando…" : "Ativar avisos"}
      </button>
    </div>
  );
}
