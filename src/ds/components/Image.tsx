import React, { useState } from "react";
import { font, radius, token } from "../tokens";

export interface ImageProps {
  src?: string;
  alt?: string;
  /** proporção: "1/1" (default), "16/9", "4/3"… */
  ratio?: string;
  radiusToken?: keyof typeof radius;
  /** texto/elemento mostrado quando não há imagem ou falha ao carregar */
  fallback?: React.ReactNode;
  width?: number | string;
}

/** Image/Media — proporção fixa, cantos, fallback. */
export function Image({ src, alt = "", ratio = "1/1", radiusToken = "lg", fallback, width = "100%" }: ImageProps) {
  const [erro, setErro] = useState(false);
  const show = src && !erro;
  return (
    <div
      style={{
        position: "relative",
        width,
        aspectRatio: ratio,
        borderRadius: radius[radiusToken],
        overflow: "hidden",
        background: token("bg-surface-secondary-default"),
        border: `1px solid ${token("border-primary-default")}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {show ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} onError={() => setErro(true)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      ) : (
        <span style={{ fontFamily: font.body, fontWeight: 600, fontSize: 13, color: token("text-tertiary-default") }}>{fallback ?? "sem imagem"}</span>
      )}
    </div>
  );
}
