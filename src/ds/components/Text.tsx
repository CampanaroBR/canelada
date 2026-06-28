import React from "react";
import { colors, textStyle, type TextStyle } from "../tokens";

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TextStyle;
  color?: string;
  as?: keyof React.JSX.IntrinsicElements;
  children: React.ReactNode;
}

/** Content/Text — aplica um estilo da escala tipográfica (porte do "Content" do Hive). */
export function Text({ variant = "body-base", color = colors.text.primary, as = "span", style, children, ...rest }: TextProps) {
  const Tag = as as React.ElementType;
  return (
    <Tag style={{ margin: 0, ...textStyle(variant), color, ...style }} {...rest}>
      {children}
    </Tag>
  );
}
