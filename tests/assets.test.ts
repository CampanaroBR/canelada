import { describe, it, expect } from "vitest";
import { getMedalha } from "@/lib/assets";

describe("getMedalha", () => {
  it("retorna o caminho da medalha quando o nome existe", () => {
    expect(getMedalha("Veterano")).toBe("/conquistas/Veterano.svg");
  });

  it("retorna null para nome inexistente", () => {
    expect(getMedalha("Inexistente")).toBeNull();
  });
});
