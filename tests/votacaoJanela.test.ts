import { describe, it, expect } from "vitest";
import { janelaVotacao, votacaoAtiva, votacaoEncerrada, isDiaDeBaba } from "@/lib/votacaoJanela";

// Baba em 2026-07-06 (segunda). Votação: 06/07 22:30 BRT → 07/07 20:00 BRT.
const data = new Date("2026-07-06T00:00:00Z"); // meia-noite UTC da data do baba

describe("janelaVotacao", () => {
  it("abre 22:30 BRT do dia do baba = 01:30 UTC do dia seguinte", () => {
    expect(janelaVotacao(data).abre.toISOString()).toBe("2026-07-07T01:30:00.000Z");
  });
  it("fecha 20:00 BRT do dia seguinte = 23:00 UTC", () => {
    expect(janelaVotacao(data).fecha.toISOString()).toBe("2026-07-07T23:00:00.000Z");
  });
});

describe("votacaoAtiva", () => {
  it("fechada antes das 22:30 BRT", () => {
    // 06/07 20:00 BRT = 06/07 23:00 UTC
    expect(votacaoAtiva(data, new Date("2026-07-06T23:00:00Z"))).toBe(false);
  });
  it("aberta às 23:00 BRT do dia do baba", () => {
    // 07/07 02:00 UTC = 06/07 23:00 BRT
    expect(votacaoAtiva(data, new Date("2026-07-07T02:00:00Z"))).toBe(true);
  });
  it("aberta na manhã seguinte (antes das 20h)", () => {
    // 07/07 18:00 UTC = 07/07 15:00 BRT
    expect(votacaoAtiva(data, new Date("2026-07-07T18:00:00Z"))).toBe(true);
  });
  it("encerrada após 20:00 BRT do dia seguinte", () => {
    // 07/08 00:00 UTC = 07/07 21:00 BRT
    expect(votacaoAtiva(data, new Date("2026-07-08T00:00:00Z"))).toBe(false);
    expect(votacaoEncerrada(data, new Date("2026-07-08T00:00:00Z"))).toBe(true);
  });
});

describe("isDiaDeBaba (só segunda e quarta, em BRT)", () => {
  it("segunda-feira é dia de baba", () => {
    // 2026-07-13 é segunda; 15:00 BRT = 18:00 UTC
    expect(isDiaDeBaba(new Date("2026-07-13T18:00:00Z"))).toBe(true);
  });
  it("quarta-feira é dia de baba", () => {
    // 2026-07-15 é quarta
    expect(isDiaDeBaba(new Date("2026-07-15T18:00:00Z"))).toBe(true);
  });
  it("domingo e terça não são", () => {
    expect(isDiaDeBaba(new Date("2026-07-12T18:00:00Z"))).toBe(false); // dom
    expect(isDiaDeBaba(new Date("2026-07-14T18:00:00Z"))).toBe(false); // ter
  });
  it("respeita BRT perto da meia-noite: segunda 22h BRT ainda é segunda (não vira terça UTC)", () => {
    // 2026-07-14 01:00 UTC = 2026-07-13 22:00 BRT (segunda)
    expect(isDiaDeBaba(new Date("2026-07-14T01:00:00Z"))).toBe(true);
  });
});
