import React from "react";
import { Warning } from "reicon-react";
import { radius, token, font } from "../tokens";
import { BottomSheet } from "./BottomSheet";
import { Button, type ButtonVariant } from "./Button";

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  /** default = Warning num círculo vermelho */
  icon?: React.ReactNode;
  title: string;
  /** aceita ReactNode pra permitir ênfase inline (ex.: <strong>) */
  description?: string | React.ReactNode;
  error?: string;
  cancelLabel?: string;
  confirmLabel: string;
  onConfirm: () => void;
  confirmVariant?: ButtonVariant;
  loading?: boolean;
}

/** Confirmação em bottom sheet (excluir conta, remover membro) — mesmo vocabulário de props do Modal. */
export function ConfirmDialog({
  open, onClose, icon, title, description, error,
  cancelLabel = "Cancelar", confirmLabel, onConfirm, confirmVariant = "danger", loading,
}: ConfirmDialogProps) {
  return (
    <BottomSheet open={open} onClose={() => !loading && onClose()}>
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
        <div style={{
          width: 56, height: 56, borderRadius: radius.pill,
          background: token("bg-fill-danger-default"),
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {icon ?? <Warning size={28} color={token("accent-red-default")} weight="Filled" />}
        </div>
        <h2 style={{ margin: 0, fontFamily: font.display, fontWeight: 800, fontSize: 20, color: token("text-primary-default") }}>{title}</h2>
        {description && (
          <p style={{ margin: 0, fontFamily: font.body, fontWeight: 500, fontSize: 14, lineHeight: "20px", color: token("text-tertiary-default"), maxWidth: 320 }}>
            {description}
          </p>
        )}
        {error && (
          <p style={{ margin: 0, fontFamily: font.body, fontWeight: 500, fontSize: 13, color: token("accent-red-default") }}>{error}</p>
        )}
        <div style={{ display: "flex", gap: 8, width: "100%", paddingTop: 8 }}>
          <Button style={{ flex: 1 }} variant="secondary" onClick={onClose} disabled={loading}>{cancelLabel}</Button>
          <Button style={{ flex: 1 }} variant={confirmVariant} onClick={onConfirm} disabled={loading}>{confirmLabel}</Button>
        </div>
      </div>
    </BottomSheet>
  );
}
