import { describe, it, expect } from "vitest";
import { computeConquistas, computeOverall, type ConquistaStats } from "@/lib/conquistas";

const ZERO: ConquistaStats = {
  mvpCount: 0,
  bagreCount: 0,
  racudoCount: 0,
  resenhaCount: 0,
  traitsUnlocked: 0,
  presencaCount: 0,
};

const stats = (over: Partial<ConquistaStats>): ConquistaStats => ({ ...ZERO, ...over });

describe("computeConquistas", () => {
  it("jogador zerado não desbloqueia conquista de mérito", () => {
    expect(computeConquistas(ZERO).size).toBe(0);
  });

  it("1º MVP desbloqueia primeira-vitoria", () => {
    expect(computeConquistas(stats({ mvpCount: 1 })).has("primeira-vitoria")).toBe(true);
  });

  it("5 MVPs sem bagre = invicto; com 1 bagre deixa de ser invicto", () => {
    expect(computeConquistas(stats({ mvpCount: 5 })).has("invicto")).toBe(true);
    expect(computeConquistas(stats({ mvpCount: 5, bagreCount: 1 })).has("invicto")).toBe(false);
  });

  it("limiares de presença: 10 = veterano, 30 = lenda", () => {
    expect(computeConquistas(stats({ presencaCount: 9 })).has("veterano")).toBe(false);
    expect(computeConquistas(stats({ presencaCount: 10 })).has("veterano")).toBe(true);
    expect(computeConquistas(stats({ presencaCount: 30 })).has("lenda")).toBe(true);
  });

  it("3 MVPs desbloqueiam rei-do-mes e em-chamas", () => {
    const u = computeConquistas(stats({ mvpCount: 3 }));
    expect(u.has("rei-do-mes")).toBe(true);
    expect(u.has("em-chamas")).toBe(true);
  });

  it("so-perde só quando bagres > mvps e >= 2", () => {
    expect(computeConquistas(stats({ bagreCount: 2, mvpCount: 1 })).has("so-perde")).toBe(true);
    expect(computeConquistas(stats({ bagreCount: 1, mvpCount: 0 })).has("so-perde")).toBe(false);
  });
});

describe("computeOverall", () => {
  it("piso 50 e teto 99", () => {
    expect(computeOverall(ZERO)).toBeGreaterThanOrEqual(50);
    expect(computeOverall(stats({ mvpCount: 99, traitsUnlocked: 99, presencaCount: 99 }))).toBe(99);
  });

  it("base de um jogador zerado é 60", () => {
    expect(computeOverall(ZERO)).toBe(60);
  });

  it("MVPs sobem o overall, bagres descem", () => {
    expect(computeOverall(stats({ mvpCount: 4 }))).toBeGreaterThan(computeOverall(ZERO));
    expect(computeOverall(stats({ bagreCount: 4 }))).toBeLessThan(computeOverall(ZERO));
  });

  it("bônus de MVP satura em +20 (4 MVPs já bate o teto do bônus)", () => {
    expect(computeOverall(stats({ mvpCount: 4 }))).toBe(computeOverall(stats({ mvpCount: 10 })));
  });
});
