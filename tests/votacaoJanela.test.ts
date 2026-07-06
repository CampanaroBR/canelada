import { describe, it, expect } from "vitest";
import { janelaVotacao, votacaoAtiva, votacaoEncerrada } from "@/lib/votacaoJanela";

// Baba em 2026-07-06 (segunda). Votação: 06/07 22:30 BRT → 07/07 15:00 BRT.
const data = new Date("2026-07-06T00:00:00Z"); // meia-noite UTC da data do baba

describe("janelaVotacao", () => {
  it("abre 22:30 BRT do dia do baba = 01:30 UTC do dia seguinte", () => {
    expect(janelaVotacao(data).abre.toISOString()).toBe("2026-07-07T01:30:00.000Z");
  });
  it("fecha 15:00 BRT do dia seguinte = 18:00 UTC", () => {
    expect(janelaVotacao(data).fecha.toISOString()).toBe("2026-07-07T18:00:00.000Z");
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
  it("aberta na manhã seguinte (antes das 15h)", () => {
    // 07/07 13:00 UTC = 07/07 10:00 BRT
    expect(votacaoAtiva(data, new Date("2026-07-07T13:00:00Z"))).toBe(true);
  });
  it("encerrada após 15:00 BRT do dia seguinte", () => {
    // 07/07 19:00 UTC = 07/07 16:00 BRT
    expect(votacaoAtiva(data, new Date("2026-07-07T19:00:00Z"))).toBe(false);
    expect(votacaoEncerrada(data, new Date("2026-07-07T19:00:00Z"))).toBe(true);
  });
});
