import React from "react";
import { token } from "../tokens";

/** Linha divisória sutil (ex.: entre linhas de uma lista). */
export function Divider({ inset = 0 }: { inset?: number }) {
  return <div style={{ height: 1, background: token("bg-surface-tertiary-default"), marginLeft: inset, marginRight: inset }} />;
}
