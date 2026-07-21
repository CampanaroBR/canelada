import { describe, it, expect } from "vitest";
import { montarSelecao, type TraitVotos, type SelecaoConfig } from "@/lib/selecaoRodada";

// Este cálculo já quebrou várias vezes (commit 7a7d98d: "lado errado + GK sem
// relação com goleiro"; regrediu depois). Cada caso abaixo trava um bug real
// pra não voltar. Se algum ajuste futuro reabrir um deles, o teste pega.

const cfg = (over: Partial<SelecaoConfig> = {}): SelecaoConfig => ({
  positivos: ["categoria", "matador", "paredao", "driblador"],
  negativos: ["bagre", "frangueiro", "bragueiro", "reclamao"],
  gkPositivo: "paredao",
  gkNegativo: "frangueiro",
  pesos: { paredao: 3, frangueiro: 3, matador: 3, bagre: 2, categoria: 1, driblador: 1, bragueiro: 1, reclamao: 1 },
  ...over,
});

function votos(obj: Record<string, Record<string, number>>): TraitVotos {
  const m: TraitVotos = new Map();
  for (const [slug, players] of Object.entries(obj)) {
    m.set(slug, new Map(Object.entries(players)));
  }
  return m;
}

describe("montarSelecao — goleiro", () => {
  it("NÃO coloca no gol quem tem o trait de goleiro só como voto secundário (caso ALABA)", () => {
    // ALABA: dominante em Bagre (8 votos), com só 1 voto de Frangueiro.
    // Não pode virar goleiro dos piores — o problema dele foi Bagre, não gol.
    const v = votos({
      bagre: { alaba: 8 },
      frangueiro: { alaba: 1 },
      reclamao: { santiago: 3 },
    });
    const { piores } = montarSelecao(v, cfg());
    const gk = piores[4];
    expect(gk?.jogadorId).not.toBe("alaba");
    // ALABA deve aparecer na LINHA (é pior, só que não como goleiro)
    const naLinha = piores.slice(0, 4).some((s) => s?.jogadorId === "alaba");
    expect(naLinha).toBe(true);
  });

  it("coloca no gol quem tem Frangueiro como trait dominante", () => {
    const v = votos({
      frangueiro: { joao: 5 },
      bagre: { pedro: 4 },
    });
    const { piores } = montarSelecao(v, cfg());
    expect(piores[4]?.jogadorId).toBe("joao");
    expect(piores[4]?.slug).toBe("frangueiro");
  });

  it("goleiro votado em Paredão E Frangueiro: Frangueiro vale mais → vai pro gol dos PIORES, não dos melhores", () => {
    // Zé: 3 Paredão + 3 Frangueiro. Empate → Frangueiro vence.
    const v = votos({
      paredao: { ze: 3 },
      frangueiro: { ze: 3 },
    });
    const { melhores, piores } = montarSelecao(v, cfg());
    expect(melhores[4]?.jogadorId).not.toBe("ze"); // não é o melhor goleiro
    expect(piores[4]?.jogadorId).toBe("ze");        // é o pior goleiro
  });

  it("goleiro com muito mais Paredão que Frangueiro é melhor goleiro e NÃO aparece nos piores", () => {
    // Vitor: 6 Paredão + 3 Frangueiro → melhor goleiro; não pode aparecer nos
    // piores (nem no gol, nem na linha). Goleiro aparece só de um lado.
    const v = votos({
      paredao: { vitor: 6 },
      frangueiro: { vitor: 3 },
      bagre: { santiago: 5 },
    });
    const { melhores, piores } = montarSelecao(v, cfg());
    expect(melhores[4]?.jogadorId).toBe("vitor");
    expect(piores.some((s) => s?.jogadorId === "vitor")).toBe(false);
  });

  it("deixa o gol VAZIO quando ninguém é dominante no trait de goleiro", () => {
    const v = votos({ bagre: { alaba: 8 }, reclamao: { santiago: 3 } });
    const { piores } = montarSelecao(v, cfg());
    expect(piores[4]).toBeNull();
  });

  it("com piso de 2 votos, goleiro com 1 voto deixa o gol vazio", () => {
    const v = votos({ frangueiro: { joao: 1 }, bagre: { santiago: 5 } });
    expect(montarSelecao(v, cfg({ gkMinVotos: 2 })).piores[4]).toBeNull(); // 1 voto → vazio
    expect(montarSelecao(v, cfg()).piores[4]?.jogadorId).toBe("joao");      // sem piso → escala
  });

  it("com piso de 2 votos, goleiro com 2+ votos ainda escala", () => {
    const v = votos({ frangueiro: { joao: 2 }, bagre: { santiago: 5 } });
    expect(montarSelecao(v, cfg({ gkMinVotos: 2 })).piores[4]?.jogadorId).toBe("joao");
  });
});

describe("montarSelecao — lado (melhores vs piores)", () => {
  it("manda pro lado PIOR quem tem score negativo maior, mesmo com voto positivo (caso Emanuel)", () => {
    // Emanuel: 8 votos de Bagre (peso 2 = 16) + 2 votos Matador (peso 3 = 6).
    // Score negativo (16) > positivo (6) → tem que estar nos piores, não melhores.
    const v = votos({
      bagre: { emanuel: 8 },
      matador: { emanuel: 2 },
    });
    const { melhores, piores } = montarSelecao(v, cfg());
    expect(piores.some((s) => s?.jogadorId === "emanuel")).toBe(true);
    expect(melhores.some((s) => s?.jogadorId === "emanuel")).toBe(false);
  });

  it("jogador aparece em UM lado só — nunca nos dois times (caso Marivaldo)", () => {
    // Marivaldo: net-positivo (mais Matador que Pregueiro) → só nos melhores,
    // nunca nos dois. Bug real: aparecia nos dois times.
    const v = votos({
      matador: { marivaldo: 4, outro: 1 },
      pregueiro: { marivaldo: 2, ruim: 5 },
      bagre: { ruim: 4 },
    });
    const { melhores, piores } = montarSelecao(v, cfg());
    const nas = (arr: typeof melhores) => arr.filter(Boolean).map((s) => s!.jogadorId);
    expect(nas(melhores)).toContain("marivaldo");
    expect(nas(piores)).not.toContain("marivaldo");
  });

  it("net-negativo cai nos piores (mais peso no negativo que no positivo)", () => {
    // Zé: 2 Matador (pos 6) + 4 Bagre (neg 12) → net-negativo → piores, não melhores.
    const v = votos({ matador: { ze: 2 }, bagre: { ze: 4 } });
    const { melhores, piores } = montarSelecao(v, cfg());
    expect(piores.some((s) => s?.jogadorId === "ze")).toBe(true);
    expect(melhores.some((s) => s?.jogadorId === "ze")).toBe(false);
  });
});

describe("montarSelecao — formato", () => {
  it("sempre retorna 5 posições por lado (linha + gk), preenchendo com null", () => {
    const { melhores, piores } = montarSelecao(votos({ bagre: { x: 1 } }), cfg());
    expect(melhores).toHaveLength(5);
    expect(piores).toHaveLength(5);
  });
});
