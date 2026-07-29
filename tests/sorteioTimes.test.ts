import { describe, it, expect } from "vitest";
import { sortearTimes, type JogadorSorteio, type PapelGol } from "@/lib/sorteioTimes";

// As duas regras do baba que o sorteio precisa respeitar ao mesmo tempo:
// ordem de chegada decide QUEM joga; nota decide EM QUAL time.
// Formação padrão do grupo: 1 goleiro + 4 de linha.

const j = (id: string, nota: number, gol?: PapelGol): JogadorSorteio => ({ id, nota, gol });
const ids = (t: { jogadores: JogadorSorteio[] }) => t.jogadores.map((x) => x.id);

describe("sorteioTimes — ordem de chegada", () => {
  it("os primeiros a chegar entram; o resto vai pra fila NA ORDEM", () => {
    // 2 times × (1 gol + 2 linha) = 6 vagas
    const chegada = [
      j("a", 60), j("b", 90), j("c", 70), j("d", 80),
      j("e", 65), j("f", 99), j("g", 50),
    ];
    const { times, fila } = sortearTimes(chegada, { times: 2, linhaPorTime: 2 });
    expect(times.flatMap(ids).sort()).toEqual(["a", "b", "c", "d", "e", "f"]);
    expect(fila.map((x) => x.id)).toEqual(["g"]);
  });

  it("nota alta NÃO fura a fila de quem chegou antes", () => {
    // "z" é o melhor de todos, mas chegou por último: não pode roubar vaga.
    const chegada = [j("a", 50), j("b", 51), j("c", 52), j("d", 53), j("z", 99)];
    const { times, fila } = sortearTimes(chegada, { times: 2, linhaPorTime: 1 });
    expect(fila.map((x) => x.id)).toEqual(["z"]);
    expect(times.flatMap(ids)).not.toContain("z");
  });

  it("fila preserva a ordem de chegada, não ordena por nota", () => {
    const chegada = [j("a", 50), j("b", 50), j("c", 50), j("d", 50), j("x", 10), j("y", 99), j("w", 40)];
    const { fila } = sortearTimes(chegada, { times: 2, linhaPorTime: 1 });
    expect(fila.map((f) => f.id)).toEqual(["x", "y", "w"]);
  });
});

describe("sorteioTimes — equilíbrio por nota", () => {
  it("distribui pra deixar as somas próximas", () => {
    const chegada = [j("a", 90), j("b", 80), j("c", 70), j("d", 60)];
    const { times } = sortearTimes(chegada, { times: 2, linhaPorTime: 1 });
    // 90+60 = 150 e 80+70 = 150 → diferença zero
    expect(Math.abs(times[0].total - times[1].total)).toBe(0);
  });

  it("com notas desiguais, não junta os melhores num time só", () => {
    // 99+95+90+55+50+45 = 434. A melhor divisão 3×3 possível é 204 × 230 →
    // diferença 26 é o ÓTIMO matemático aqui, não folga do algoritmo.
    const chegada = [j("a", 99), j("b", 95), j("c", 90), j("d", 55), j("e", 50), j("f", 45)];
    const { times } = sortearTimes(chegada, { times: 2, linhaPorTime: 2 });
    expect(Math.abs(times[0].total - times[1].total)).toBe(26);
    const timeDoA = times.findIndex((t) => ids(t).includes("a"));
    const timeDoB = times.findIndex((t) => ids(t).includes("b"));
    expect(timeDoA).not.toBe(timeDoB);
  });

  it("calcula média de cada time", () => {
    const chegada = [j("a", 80), j("b", 60), j("c", 70), j("d", 70)];
    const { times } = sortearTimes(chegada, { times: 2, linhaPorTime: 1 });
    for (const t of times) expect(t.media).toBe(70);
  });
});

describe("sorteioTimes — gol (fixo × curinga)", () => {
  it("com 2 goleiros fixos, cada time fica com um", () => {
    const chegada = [
      j("raphael", 70, "fixo"), j("vitor", 68, "fixo"),
      j("a", 80), j("b", 75), j("c", 60), j("d", 55),
    ];
    const { times, timesSemGoleiro } = sortearTimes(chegada, { times: 2, linhaPorTime: 2 });
    for (const t of times) expect(t.jogadores.filter((x) => x.gol === "fixo")).toHaveLength(1);
    expect(timesSemGoleiro).toEqual([]);
  });

  it("faltando fixo, o CURINGA é puxado pro gol", () => {
    // Só 1 goleiro de verdade presente; Bruno (curinga) completa o outro gol.
    const chegada = [
      j("raphael", 70, "fixo"), j("bruno", 80, "curinga"),
      j("a", 75), j("b", 60), j("c", 55), j("d", 50),
    ];
    const { times, timesSemGoleiro } = sortearTimes(chegada, { times: 2, linhaPorTime: 2 });
    const noGol = times.map((t) => t.jogadores[0].id);
    expect(noGol).toContain("raphael");
    expect(noGol).toContain("bruno");
    expect(timesSemGoleiro).toEqual([]);
  });

  it("tendo fixo pra todo mundo, curinga JOGA NA LINHA (não é desperdiçado no gol)", () => {
    const chegada = [
      j("raphael", 70, "fixo"), j("vitor", 68, "fixo"), j("bruno", 88, "curinga"),
      j("a", 60), j("b", 55), j("c", 50),
    ];
    const { times } = sortearTimes(chegada, { times: 2, linhaPorTime: 2 });
    // bruno entrou, mas não como o goleiro do time (goleiro é o 1º da lista)
    const goleiros = times.map((t) => t.jogadores[0].id);
    expect(goleiros).not.toContain("bruno");
    expect(times.flatMap(ids)).toContain("bruno");
  });

  it("sem nenhum goleiro, avisa quais times ficaram sem", () => {
    const chegada = [j("a", 80), j("b", 70), j("c", 60), j("d", 50)];
    const { times, timesSemGoleiro } = sortearTimes(chegada, { times: 2, linhaPorTime: 1 });
    expect(timesSemGoleiro).toEqual([0, 1]);
    expect(times.flatMap(ids)).toHaveLength(4);
  });
});

describe("sorteioTimes — formato", () => {
  it("padrão é 1 gol + 4 linha", () => {
    const chegada = Array.from({ length: 10 }, (_, i) => j(`p${i}`, 60 + i, i < 2 ? "fixo" : undefined));
    const { times, fila } = sortearTimes(chegada, { times: 2 });
    for (const t of times) expect(t.jogadores).toHaveLength(5);
    expect(fila).toHaveLength(0);
  });

  it("gente de menos: distribui o que tem, sem quebrar", () => {
    const chegada = [j("a", 80), j("b", 70), j("c", 60)];
    const { times, fila } = sortearTimes(chegada, { times: 2, linhaPorTime: 4 });
    expect(times).toHaveLength(2);
    expect(times.flatMap((t) => t.jogadores)).toHaveLength(3);
    expect(fila).toHaveLength(0);
  });

  it("suporta 3 times", () => {
    const chegada = Array.from({ length: 12 }, (_, i) => j(`p${i}`, 50 + i, i < 3 ? "fixo" : undefined));
    const { times, fila } = sortearTimes(chegada, { times: 3, linhaPorTime: 3 });
    expect(times).toHaveLength(3);
    for (const t of times) expect(t.jogadores).toHaveLength(4);
    expect(fila).toHaveLength(0);
  });

  it("ninguém aparece em dois times", () => {
    const chegada = Array.from({ length: 10 }, (_, i) => j(`p${i}`, 40 + i * 3, i < 2 ? "fixo" : undefined));
    const { times } = sortearTimes(chegada, { times: 2, linhaPorTime: 4 });
    const todos = times.flatMap(ids);
    expect(new Set(todos).size).toBe(todos.length);
  });
});
