import React from "react";
import { colors, radius, motion, font, token } from "../tokens";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "link";
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

// Migrado para tokens Encore (CSS vars) — colors.* legado mantido só onde não há
// token semântico 1:1 ainda (ex.: text.accent, usado no link).
export function variantStyle(v: ButtonVariant): React.CSSProperties {
  switch (v) {
    case "primary":
      return { background: token("bg-fill-primary-default"), color: token("text-on-fill-default"), border: "none" };
    case "secondary":
      return { background: "transparent", color: token("text-primary-default"), border: `1px solid ${token("border-tertiary-default")}` };
    case "ghost":
      return { background: token("bg-surface-primary-default"), color: token("text-primary-default"), border: `1px solid ${token("border-primary-default")}` };
    case "danger":
      return { background: token("bg-fill-danger-default"), color: token("bg-base-default"), border: "none" };
    case "link":
      return { background: "transparent", color: colors.text.accent, border: "none" };
  }
}

const press = {
  onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => { e.currentTarget.style.transform = "scale(0.97)"; },
  onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => { e.currentTarget.style.transform = "scale(1)"; },
  onPointerLeave: (e: React.PointerEvent<HTMLButtonElement>) => { e.currentTarget.style.transform = "scale(1)"; },
};

/** Botão do Bagre DS. Variantes: primary, secondary, ghost, danger, link. Ícones à esquerda/direita, 3 tamanhos. */
export function Button({
  variant = "primary", size = "md", fullWidth, loading, leftIcon, rightIcon, children, disabled, style, ...rest
}: ButtonProps) {
  const s = SIZES[size];
  const isDisabled = disabled || loading;
  const link = variant === "link";
  return (
    <button
      disabled={isDisabled}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: s.gap,
        height: link ? "auto" : s.h,
        padding: link ? 0 : `0 ${s.px}px`,
        width: fullWidth ? "100%" : undefined,
        borderRadius: s.r,
        fontFamily: font.display, fontWeight: variant === "primary" ? 800 : 700,
        fontSize: s.fs, lineHeight: "20px",
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.55 : 1,
        transition: `transform ${motion.duration.fast}ms ${motion.ease.out}, opacity ${motion.duration.fast}ms`,
        WebkitTapHighlightColor: "transparent",
        ...variantStyle(variant),
        ...style,
      }}
      {...press}
      {...rest}
    >
      {loading ? <Spinner /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}

export type IconButtonSize = "sm" | "md" | "lg";
const ICON_BTN: Record<IconButtonSize, number> = { sm: 36, md: 44, lg: 48 };

export interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  variant?: ButtonVariant;
  size?: IconButtonSize;
  "aria-label": string;
  children: React.ReactNode;
}

/** Botão só-ícone (quadrado). Reusa as variantes do Button. `aria-label` é obrigatório. */
export function IconButton({ variant = "ghost", size = "md", children, style, disabled, ...rest }: IconButtonProps) {
  const d = ICON_BTN[size];
  return (
    <button
      disabled={disabled}
      style={{
        width: d, height: d, flexShrink: 0,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        borderRadius: size === "lg" ? radius.lg : radius.md,
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.55 : 1,
        transition: `transform ${motion.duration.fast}ms ${motion.ease.out}`,
        WebkitTapHighlightColor: "transparent",
        ...variantStyle(variant),
        ...style,
      }}
      {...press}
      {...rest}
    >
      {children}
    </button>
  );
}

function Spinner() {
  return (
    <span style={{ width: 16, height: 16, display: "inline-block", border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%", animation: "bagre-spin 0.6s linear infinite" }}>
      <style>{`@keyframes bagre-spin{to{transform:rotate(360deg)}}`}</style>
    </span>
  );
}
