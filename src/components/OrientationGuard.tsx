"use client";

import { useEffect, useState } from "react";

/** Em celular deitado (paisagem, altura curta), pede pra girar — o app é retrato. */
export function OrientationGuard() {
  const [landscape, setLandscape] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(orientation: landscape) and (max-height: 540px)");
    const update = () => setLandscape(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (!landscape) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200, background: "#090909",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 14, padding: 24, textAlign: "center",
    }}>
      <div style={{ fontSize: 44 }}>🔄</div>
      <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "#fff" }}>Gire o celular</p>
      <p style={{ margin: 0, fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 14, lineHeight: "20px", color: "#7a7a7a", maxWidth: 280 }}>
        O Canelada funciona melhor em pé (retrato).
      </p>
    </div>
  );
}
