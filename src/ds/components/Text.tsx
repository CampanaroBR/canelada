import React from "react";
import { textStyle, type TextStyle, token } from "../tokens";

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TextStyle;
  color?: string;
  as?: keyof React.JSX.IntrinsicElements;
  children: React.ReactNode;
}

/** Content/Text — aplica um estilo da escala tipográfica. */
export function Text({ variant = "paragraph-m", color = token("text-primary-default"), as = "span", style, children, ...rest }: TextProps) {
  const Tag = as as React.ElementType;
  return (
    <Tag style={{ margin: 0, ...textStyle(variant), color, ...style }} {...rest}>
      {children}
    </Tag>
  );
}
