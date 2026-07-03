"use client";

import { useEffect, useState } from "react";
import { X, PlusSquare, Export, DeviceMobile } from "@phosphor-icons/react";

const DISMISS_KEY = "canelada-install-dismissed";
const EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  if (typeof window === "undefined") return true;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // Safari iOS expõe navigator.standalone
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // iPadOS 13+ se identifica como Mac com touch
    (navigator.userAgent.includes("Mac") && "ontouchend" in document);
}

/**
 * Banner de instalação do PWA — instalar habilita as notificações no iPhone
 * (limitação do iOS: push só funciona com o app na tela de início).
 * - iOS: tutorial visual (Safari não permite disparar a instalação via JS)
 * - Android/desktop: botão que dispara o prompt nativo (beforeinstallprompt)
 * - Não aparece se: já instalado, já dispensado, ou plataforma sem suporte
 */
export function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<"ios" | "native" | "generic">("native");
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const ios = mode === "ios";

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY)) return;

    const reveal = () => { setShow(true); requestAnimationFrame(() => setVisible(true)); };

    if (isIOS()) {
      setMode("ios");
      // pequena espera pra não competir com o carregamento da home
      const t = setTimeout(reveal, 2500);
      return () => clearTimeout(t);
    }

    let got = false;
    const onPrompt = (e: Event) => {
      e.preventDefault();
      got = true;
      setDeferred(e as BeforeInstallPromptEvent);
      setMode("native");
      reveal();
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // Fallback: navegadores Android sem beforeinstallprompt (Firefox, Samsung
    // Internet…) ganham o tutorial genérico via menu do navegador. No desktop
    // sem suporte, não mostra nada — push já funciona no navegador mesmo.
    const isAndroid = /Android/i.test(navigator.userAgent);
    const t = setTimeout(() => { if (!got && isAndroid) { setMode("generic"); reveal(); } }, 4000);

    return () => { window.removeEventListener("beforeinstallprompt", onPrompt); clearTimeout(t); };
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
    setTimeout(() => setShow(false), 300);
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") {
      setVisible(false);
      setTimeout(() => setShow(false), 300);
    }
    setDeferred(null);
    localStorage.setItem(DISMISS_KEY, "1");
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
      {/* Header: ícone + título + fechar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 13, flexShrink: 0,
          background: "rgba(159,232,112,0.14)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <DeviceMobile size={24} color="#9fe870" weight="regular" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, lineHeight: "22px", color: "#fff" }}>
            Instala o Canelada 📲
          </p>
          <p style={{ margin: "2px 0 0", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 13.5, lineHeight: "19px", color: "#9a9a9a" }}>
            {ios
              ? "Pra receber os avisos da votação no iPhone:"
              : mode === "generic"
              ? "Adiciona o app pelo menu do navegador:"
              : "Recebe os avisos da votação na tela do celular."}
          </p>
        </div>
        <button
          onClick={dismiss}
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

      {/* Corpo: passos em cartão interno (largura total) ou botão nativo */}
      {ios ? (
        <div style={stepsCard}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <span style={stepBadge}>1</span>
            <span style={stepText}>
              Toca no botão <Export size={17} color="#9fe870" weight="bold" style={{ verticalAlign: "-3px" }} /> <strong style={{ color: "#fff" }}>Compartilhar</strong> do Safari
              <span style={{ display: "block", color: "#7a7a7a", fontSize: 12.5, lineHeight: "17px", marginTop: 3 }}>
                fica na barra de baixo — se não aparecer, toca no <strong style={{ color: "#ccc" }}>≡</strong> ao lado do endereço
              </span>
            </span>
          </div>
          <div style={stepDivider} />
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <span style={stepBadge}>2</span>
            <span style={stepText}>Rola a lista e escolhe <PlusSquare size={17} color="#9fe870" weight="bold" style={{ verticalAlign: "-3px" }} /> <strong style={{ color: "#fff" }}>Adicionar à Tela de Início</strong></span>
          </div>
        </div>
      ) : mode === "generic" ? (
        <div style={stepsCard}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <span style={stepBadge}>1</span>
            <span style={stepText}>Abre o <strong style={{ color: "#fff" }}>menu ⋮</strong> do navegador</span>
          </div>
          <div style={stepDivider} />
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <span style={stepBadge}>2</span>
            <span style={stepText}>Toca em <PlusSquare size={17} color="#9fe870" weight="bold" style={{ verticalAlign: "-3px" }} /> <strong style={{ color: "#fff" }}>Adicionar à tela inicial</strong> (ou "Instalar")</span>
          </div>
        </div>
      ) : (
        <button
          onClick={install}
          style={{
            marginTop: 14, width: "100%", height: 48, borderRadius: 9999,
            background: "#9fe870", border: "none", cursor: "pointer",
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "#0a1a06",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          Instalar app
        </button>
      )}
    </div>
  );
}

const stepsCard: React.CSSProperties = {
  marginTop: 14,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid #232323",
  borderRadius: 14,
  padding: "14px 14px",
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const stepDivider: React.CSSProperties = {
  height: 1,
  background: "#232323",
  margin: "0 0 0 34px",
};

const stepBadge: React.CSSProperties = {
  width: 22, height: 22, borderRadius: 11, flexShrink: 0, marginTop: 1,
  background: "#9fe870", color: "#0a1a06",
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 12,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
};

const stepText: React.CSSProperties = {
  fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 13.5, lineHeight: "19px", color: "#c4c4c4",
};
