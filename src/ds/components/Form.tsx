import React from "react";
import { colors, font } from "../tokens";

/** Campo genérico: label + required + controle + hint/erro. Use pra dar label consistente a qualquer controle. */
export function FormField({
  label,
  required,
  hint,
  error,
  children,
}: {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ width: "100%" }}>
      {label && (
        <span style={{ display: "block", marginBottom: 6, fontFamily: font.body, fontWeight: 600, fontSize: 14, lineHeight: "20px", color: "#f5f5f5" }}>
          {label}
          {required && <span style={{ color: colors.semantic.danger, marginLeft: 3 }}>*</span>}
        </span>
      )}
      {children}
      {(error || hint) && (
        <span style={{ display: "block", marginTop: 6, fontFamily: font.body, fontWeight: 500, fontSize: 12, color: error ? colors.semantic.danger : colors.text.muted }}>
          {error ?? hint}
        </span>
      )}
    </div>
  );
}

/** Linha de campos lado a lado (ex.: Nome | Sobrenome). */
export function FormRow({ children, gap = 10 }: { children: React.ReactNode; gap?: number }) {
  return <div style={{ display: "flex", gap }}>{React.Children.map(children, (c) => <div style={{ flex: 1, minWidth: 0 }}>{c}</div>)}</div>;
}

/** Rodapé de ações do formulário (botões empilhados ou lado a lado). */
export function FormActions({ children, direction = "column" }: { children: React.ReactNode; direction?: "row" | "column" }) {
  return <div style={{ display: "flex", flexDirection: direction, gap: direction === "row" ? 8 : 8, paddingTop: 4 }}>{children}</div>;
}

/** Formulário — layout vertical com espaçamento e título opcional. */
export function Form({ title, gap = 16, onSubmit, children }: { title?: string; gap?: number; onSubmit?: () => void; children: React.ReactNode }) {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit?.(); }}
      style={{ display: "flex", flexDirection: "column", gap, width: "100%" }}
    >
      {title && <h2 style={{ margin: 0, fontFamily: font.display, fontWeight: 800, fontSize: 16, textTransform: "uppercase", color: colors.text.primary }}>{title}</h2>}
      {children}
    </form>
  );
}
