import { describe, it, expect } from "vitest";
import { pontosTrait, ehPositivo, ehNegativo, TRAITS_POSITIVOS, TRAITS_NEGATIVOS } from "@/lib/traits";

// Trava a fonte única de pontuação — antes o ranking tinha uma lista de pontos
// duplicada que divergiu (não contava Gol Mais Bonito/Frangueiro/etc. e ainda
// escutava Raçudo/Cone já removidos).

describe("pontosTrait — pontuação por peso", () => {
  it("positivo soma o peso", () => {
    expect(pontosTrait("categoria", 4)).toBe(4);
    expect(pontosTrait("matador", 3)).toBe(3);
    expect(pontosTrait("gol-mais-bonito", 2)).toBe(2); // trait novo agora conta
  });

  it("negativo desconta o peso", () => {
    expect(pontosTrait("bagre", 3)).toBe(-3);
    expect(pontosTrait("frangueiro", 3)).toBe(-3); // trait novo agora conta (negativo)
    expect(pontosTrait("reclamao", 2)).toBe(-2);
  });

  it("trait social/desconhecido não pontua", () => {
    expect(pontosTrait("chorao", 2)).toBe(0);
    expect(pontosTrait("delegado", 3)).toBe(0);
    expect(pontosTrait("inexistente", 3)).toBe(0);
  });

  it("traits removidos da votação não pontuam mais (racudo, cone)", () => {
    expect(pontosTrait("racudo", 2)).toBe(0);
    expect(pontosTrait("cone", 2)).toBe(0);
  });
});

describe("polaridade", () => {
  it("classifica positivos e negativos", () => {
    expect(ehPositivo("categoria")).toBe(true);
    expect(ehNegativo("bagre")).toBe(true);
    expect(ehPositivo("bagre")).toBe(false);
    expect(ehNegativo("categoria")).toBe(false);
  });

  it("nenhum trait está em positivo e negativo ao mesmo tempo", () => {
    const inter = TRAITS_POSITIVOS.filter((t) => (TRAITS_NEGATIVOS as readonly string[]).includes(t));
    expect(inter).toEqual([]);
  });
});
