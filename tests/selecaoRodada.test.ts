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

  it("goleiro com muito mais Paredão que Frangueiro continua sendo o melhor goleiro", () => {
    // Marcos: 6 Paredão + 1 Frangueiro → Paredão domina, segue melhor goleiro.
    const v = votos({
      paredao: { marcos: 6 },
      frangueiro: { marcos: 1 },
    });
    const { melhores } = montarSelecao(v, cfg());
    expect(melhores[4]?.jogadorId).toBe("marcos");
  });

  it("deixa o gol VAZIO quando ninguém é dominante no trait de goleiro", () => {
    const v = votos({ bagre: { alaba: 8 }, reclamao: { santiago: 3 } });
    const { piores } = montarSelecao(v, cfg());
    expect(piores[4]).toBeNull();
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

  it("quem recebeu voto negativo aparece nos PIORES mesmo tendo voto positivo", () => {
    // Regra do usuário: "voto negativo cai no time dos piores, obviamente".
    // Fulano: forte no positivo (5 Matador) mas levou 3 Bagre → tem que aparecer
    // nos piores também (não pode sumir só porque é net-positivo).
    const v = votos({
      matador: { fulano: 5 },
      bagre: { fulano: 3 },
    });
    const { piores } = montarSelecao(v, cfg());
    expect(piores.some((s) => s?.jogadorId === "fulano")).toBe(true);
  });
});

describe("montarSelecao — formato", () => {
  it("sempre retorna 5 posições por lado (linha + gk), preenchendo com null", () => {
    const { melhores, piores } = montarSelecao(votos({ bagre: { x: 1 } }), cfg());
    expect(melhores).toHaveLength(5);
    expect(piores).toHaveLength(5);
  });
});
