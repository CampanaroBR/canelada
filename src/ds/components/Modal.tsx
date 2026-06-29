import React from "react";
import { colors, font, radius, motion } from "../tokens";
import { Button, type ButtonVariant } from "./Button";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  info?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  onConfirm?: () => void;
  confirmVariant?: ButtonVariant;
  loading?: boolean;
}

/** Modal/diálogo central (header + body + footer). */
export function Modal({
  open, onClose, title, subtitle, icon, children,
  info, cancelLabel = "Cancelar", confirmLabel, onConfirm, confirmVariant = "primary", loading,
}: ModalProps) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        animation: `bagre-fade ${motion.duration.fast}ms ${motion.ease.out}`,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{
          width: "100%", maxWidth: 360,
          background: colors.bg.card,
          border: `1px solid ${colors.bg.border}`,
          borderRadius: radius["2xl"],
          padding: 20,
          boxShadow: "0px 24px 60px rgba(0,0,0,0.5)",
          animation: `bagre-pop ${motion.duration.base}ms ${motion.ease.spring}`,
        }}
      >
        {(title || icon) && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: children ? 16 : 20 }}>
            {icon}
            <div style={{ flex: 1, minWidth: 0 }}>
              {title && <p style={{ margin: 0, fontFamily: font.display, fontWeight: 800, fontSize: 18, lineHeight: "22px", color: colors.text.primary }}>{title}</p>}
              {subtitle && <p style={{ margin: "4px 0 0", fontFamily: font.body, fontWeight: 500, fontSize: 13, lineHeight: "18px", color: colors.text.muted }}>{subtitle}</p>}
            </div>
            <button onClick={onClose} aria-label="Fechar" style={{ background: "none", border: "none", cursor: "pointer", color: colors.text.muted, fontSize: 20, lineHeight: 1, padding: 0, flexShrink: 0 }}>×</button>
          </div>
        )}

        {children && <div style={{ fontFamily: font.body, fontSize: 14, color: colors.text.secondary }}>{children}</div>}

        {(confirmLabel || info) && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 20 }}>
            {info && <span style={{ flex: 1, fontFamily: font.body, fontWeight: 500, fontSize: 12, color: colors.text.muted }}>{info}</span>}
            {!info && <span style={{ flex: 1 }} />}
            <Button variant="secondary" size="sm" onClick={onClose}>{cancelLabel}</Button>
            {confirmLabel && <Button variant={confirmVariant} size="sm" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>}
          </div>
        )}
      </div>
      <style>{`@keyframes bagre-fade{from{opacity:0}to{opacity:1}}@keyframes bagre-pop{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}
