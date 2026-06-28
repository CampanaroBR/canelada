import React from "react";
import { colors } from "../tokens";

/** Linha divisória sutil (ex.: entre linhas de uma lista). */
export function Divider({ inset = 0 }: { inset?: number }) {
  return <div style={{ height: 1, background: colors.bg.elevated, marginLeft: inset, marginRight: inset }} />;
}
