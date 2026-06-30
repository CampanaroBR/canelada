import React from "react";
import { radius as R } from "../tokens";

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radiusToken?: keyof typeof R;
  circle?: boolean;
  style?: React.CSSProperties;
}

/** Placeholder de carregamento com shimmer. Use enquanto o conteúdo real não chegou. */
export function Skeleton({ width = "100%", height = 16, radiusToken = "sm", circle, style }: SkeletonProps) {
  const size = circle ? (typeof height === "number" ? height : 40) : undefined;
  return (
    <div
      aria-hidden
      style={{
        width: circle ? size : width,
        height: circle ? size : height,
        borderRadius: circle ? "50%" : R[radiusToken],
        background: "linear-gradient(90deg, #1c1c1c 25%, #262626 37%, #1c1c1c 63%)",
        backgroundSize: "400% 100%",
        animation: "bagre-shimmer 1.4s ease infinite",
        ...style,
      }}
    >
      <style>{`@keyframes bagre-shimmer{0%{background-position:100% 50%}100%{background-position:0 50%}}`}</style>
    </div>
  );
}
