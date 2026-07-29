import { describe, it, expect } from "vitest";
import { sortearTimes, type JogadorSorteio } from "@/lib/sorteioTimes";

// As duas regras do baba que o sorteio precisa respeitar ao mesmo tempo:
// ordem de chegada decide QUEM joga; nota decide EM QUAL time.

const j = (id: string, nota: number, goleiro = false): JogadorSorteio => ({ id, nota, goleiro });

describe("sorteioTimes — ordem de chegada", () => {
  it("os primeiros a chegar entram; o resto vai pra fila NA ORDEM", () => {
    const chegada = [
      j("a", 60), j("b", 90), j("c", 70), j("d", 80),
      j("e", 65), j("f", 99), j("g", 50),
    ];
    const { times, fila } = sortearTimes(chegada, { times: 2, porTime: 3 });
    const escalados = times.flatMap((t) => t.jogadores.map((x) => x.id)).sort();
    expect(escalados).toEqual(["a", "b", "c", "d", "e", "f"]);
    // "g" chegou por último → fila, mesmo tendo nota diferente
    expect(fila.map((x) => x.id)).toEqual(["g"]);
  });

  it("nota alta NÃO fura a fila de quem chegou antes", () => {
    // "z" é o melhor de todos, mas chegou por último: não pode roubar vaga.
    const chegada = [j("a", 50), j("b", 51), j("c", 52), j("d", 53), j("z", 99)];
    const { times, fila } = sortearTimes(chegada, { times: 2, porTime: 2 });
    expect(fila.map((x) => x.id)).toEqual(["z"]);
    expect(times.flatMap((t) => t.jogadores.map((x) => x.id))).not.toContain("z");
  });

  it("fila preserva a ordem de chegada, não ordena por nota", () => {
    const chegada = [j("a", 50), j("b", 50), j("x", 10), j("y", 99), j("w", 40)];
    const { fila } = sortearTimes(chegada, { times: 2, porTime: 1 });
    expect(fila.map((f) => f.id)).toEqual(["x", "y", "w"]);
  });
});

describe("sorteioTimes — equilíbrio por nota", () => {
  it("distribui pra deixar as somas próximas", () => {
    const chegada = [j("a", 90), j("b", 80), j("c", 70), j("d", 60)];
    const { times } = sortearTimes(chegada, { times: 2, porTime: 2 });
    // 90+60 = 150 e 80+70 = 150 → diferença zero
    expect(Math.abs(times[0].total - times[1].total)).toBe(0);
  });

  it("com notas desiguais, não junta os melhores num time só", () => {
    // 99+95+90+55+50+45 = 434. A melhor divisão 3×3 possível é 204 × 230 →
    // diferença 26 é o ÓTIMO matemático aqui, não folga do algoritmo.
    const chegada = [j("a", 99), j("b", 95), j("c", 90), j("d", 55), j("e", 50), j("f", 45)];
    const { times } = sortearTimes(chegada, { times: 2, porTime: 3 });
    expect(Math.abs(times[0].total - times[1].total)).toBe(26);
    // o que importa na prática: os dois melhores caem em times diferentes
    const timeDoA = times.findIndex((t) => t.jogadores.some((x) => x.id === "a"));
    const timeDoB = times.findIndex((t) => t.jogadores.some((x) => x.id === "b"));
    expect(timeDoA).not.toBe(timeDoB);
  });

  it("calcula média de cada time", () => {
    const chegada = [j("a", 80), j("b", 60), j("c", 70), j("d", 70)];
    const { times } = sortearTimes(chegada, { times: 2, porTime: 2 });
    for (const t of times) expect(t.media).toBe(70);
  });
});

describe("sorteioTimes — goleiro", () => {
  it("espalha os goleiros: 1 por time", () => {
    const chegada = [
      j("g1", 70, true), j("g2", 68, true),
      j("a", 80), j("b", 75), j("c", 60), j("d", 55),
    ];
    const { times } = sortearTimes(chegada, { times: 2, porTime: 3 });
    for (const t of times) {
      expect(t.jogadores.filter((x) => x.goleiro)).toHaveLength(1);
    }
  });

  it("goleiro sobrando vira jogador de linha (não empilha 2 no mesmo time)", () => {
    const chegada = [
      j("g1", 70, true), j("g2", 68, true), j("g3", 66, true),
      j("a", 80), j("b", 75), j("c", 60),
    ];
    const { times } = sortearTimes(chegada, { times: 2, porTime: 3 });
    const porTime = times.map((t) => t.jogadores.filter((x) => x.goleiro).length);
    // 3 goleiros em 2 times: um time fica com 2, mas nunca 3 e 0
    expect(porTime.every((n) => n >= 1)).toBe(true);
  });

  it("sem goleiro nenhum, ainda monta os times", () => {
    const chegada = [j("a", 80), j("b", 70), j("c", 60), j("d", 50)];
    const { times } = sortearTimes(chegada, { times: 2, porTime: 2 });
    expect(times[0].jogadores).toHaveLength(2);
    expect(times[1].jogadores).toHaveLength(2);
  });
});

describe("sorteioTimes — formato", () => {
  it("gente de menos: distribui o que tem, sem quebrar", () => {
    const chegada = [j("a", 80), j("b", 70), j("c", 60)];
    const { times, fila } = sortearTimes(chegada, { times: 2, porTime: 5 });
    expect(times).toHaveLength(2);
    expect(times.flatMap((t) => t.jogadores)).toHaveLength(3);
    expect(fila).toHaveLength(0);
  });

  it("suporta 3 times", () => {
    const chegada = Array.from({ length: 12 }, (_, i) => j(`p${i}`, 50 + i));
    const { times, fila } = sortearTimes(chegada, { times: 3, porTime: 4 });
    expect(times).toHaveLength(3);
    for (const t of times) expect(t.jogadores).toHaveLength(4);
    expect(fila).toHaveLength(0);
  });

  it("ninguém aparece em dois times", () => {
    const chegada = Array.from({ length: 10 }, (_, i) => j(`p${i}`, 40 + i * 3, i < 2));
    const { times } = sortearTimes(chegada, { times: 2, porTime: 5 });
    const ids = times.flatMap((t) => t.jogadores.map((x) => x.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});
