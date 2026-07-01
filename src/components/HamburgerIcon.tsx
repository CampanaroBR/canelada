"use client";

/** Ícone de menu que faz o morph pras 3 linhas viraram um X quando `open`. */
export function HamburgerIcon({ open, size = 22, color = "#fff" }: { open: boolean; size?: number; color?: string }) {
  const ease = "cubic-bezier(0.32, 0.72, 0, 1)";
  const barStyle = (i: number): React.CSSProperties => {
    const mid = size / 2 - 1;
    if (i === 0) {
      return {
        top: open ? mid : 2,
        transform: open ? "rotate(45deg)" : "rotate(0deg)",
      };
    }
    if (i === 1) {
      return {
        top: mid,
        opacity: open ? 0 : 1,
        transform: open ? "scaleX(0)" : "scaleX(1)",
      };
    }
    return {
      top: open ? mid : size - 4,
      transform: open ? "rotate(-45deg)" : "rotate(0deg)",
    };
  };

  return (
    <span style={{ position: "relative", display: "inline-block", width: size, height: size }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: 0,
            width: size,
            height: 2,
            borderRadius: 2,
            background: color,
            transition: `top 320ms ${ease}, transform 320ms ${ease}, opacity 200ms ${ease}`,
            transformOrigin: "center",
            ...barStyle(i),
          }}
        />
      ))}
    </span>
  );
}
