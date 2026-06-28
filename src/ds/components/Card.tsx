import React from "react";
import { colors, radius } from "../tokens";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** surface = #0a0e0e (cards de lista) · card = #171717 (destaque) */
  tone?: "surface" | "card" | "base";
  padding?: number;
  bordered?: boolean;
  radiusToken?: keyof typeof radius;
  children?: React.ReactNode;
}

const TONE_BG = { surface: colors.bg.surface, card: colors.bg.card, base: colors.bg.base };

/** Container base do Bagre DS — superfície escura com borda sutil. */
export function Card({ tone = "surface", padding = 16, bordered = true, radiusToken = "lg", style, children, ...rest }: CardProps) {
  return (
    <div
      style={{
        background: TONE_BG[tone],
        border: bordered ? `1px solid ${colors.bg.border}` : "none",
        borderRadius: radius[radiusToken],
        padding,
        boxSizing: "border-box",
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
