import React from "react";
import { colors, radius, motion, font } from "../tokens";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

const SIZES: Record<ButtonSize, { h: number; px: number; fs: number; r: number; gap: number }> = {
  sm: { h: 40, px: 16, fs: 14, r: radius.md, gap: 6 },
  md: { h: 54, px: 20, fs: 16, r: radius.lg, gap: 8 },
  lg: { h: 56, px: 24, fs: 16, r: radius.xl, gap: 8 },
};

function variantStyle(v: ButtonVariant): React.CSSProperties {
  switch (v) {
    case "primary":
      return { background: colors.accent.default, color: colors.text.onAccent, border: "none" };
    case "secondary":
      return { background: "transparent", color: colors.text.primary, border: `1px solid ${colors.bg.borderSubtle}` };
    case "ghost":
      return { background: colors.bg.surface, color: colors.text.primary, border: `1px solid ${colors.bg.border}` };
    case "danger":
      return { background: colors.semantic.danger, color: colors.bg.base, border: "none" };
  }
}

/** Botão do Bagre DS. Variantes: primary (verde), secondary (contorno), ghost (superfície), danger (vermelho). */
export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  loading,
  leftIcon,
  rightIcon,
  children,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const s = SIZES[size];
  const isDisabled = disabled || loading;
  return (
    <button
      disabled={isDisabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: s.gap,
        height: s.h,
        padding: `0 ${s.px}px`,
        width: fullWidth ? "100%" : undefined,
        borderRadius: s.r,
        fontFamily: font.display,
        fontWeight: variant === "primary" ? 800 : 700,
        fontSize: s.fs,
        lineHeight: "20px",
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.55 : 1,
        transition: `transform ${motion.duration.fast}ms ${motion.ease.out}, opacity ${motion.duration.fast}ms`,
        WebkitTapHighlightColor: "transparent",
        ...variantStyle(variant),
        ...style,
      }}
      onPointerDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)"; }}
      onPointerUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
      onPointerLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
      {...rest}
    >
      {loading ? "…" : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
