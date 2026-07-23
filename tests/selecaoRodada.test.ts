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

  it("sem goleiro real, o 5º slot é preenchido pelo próximo pior com camisa normal (isGoleiro=false)", () => {
    // Ninguém dominante em Frangueiro. 5 jogadores no lado ruim → o 5º entra no
    // slot do goleiro, mas marcado isGoleiro:false (camisa normal, não dourada).
    const v = votos({
      bagre: { a: 6, b: 5, c: 4, d: 3, e: 2 },
    });
    const { piores } = montarSelecao(v, cfg({ gkMinVotos: 2 }));
    expect(piores[4]).not.toBeNull();      // 5º slot preenchido
    expect(piores[4]?.isGoleiro).toBe(false); // mas não é goleiro de verdade
    // o goleiro de verdade (quando existe) vem marcado true
    const comGoleiro = montarSelecao(votos({ frangueiro: { g: 3 }, bagre: { x: 5 } }), cfg({ gkMinVotos: 2 }));
    expect(comGoleiro.piores[4]?.isGoleiro).toBe(true);
  });
});

describe("montarSelecao — times independentes (Opção B)", () => {
  it("quem levou Bagre aparece nos piores mesmo tendo voto positivo (caso Emanuel)", () => {
    // Emanuel: 8 votos de Bagre + 2 votos Matador. O que NÃO pode é o bagre
    // sumir dos piores só porque também levou elogio — cada lado é independente.
    const v = votos({
      bagre: { emanuel: 8 },
      matador: { emanuel: 2 },
    });
    const { piores } = montarSelecao(v, cfg());
    expect(piores.some((s) => s?.jogadorId === "emanuel")).toBe(true);
  });

  it("jogador com voto relevante nos DOIS lados aparece nos dois times (overlap permitido)", () => {
    // Zé: forte nos dois (Matador E Bagre). Na Opção B ele é escalado nos dois —
    // é o que enche os 5 slots quando o pote de votados é pequeno.
    const v = votos({ matador: { ze: 5 }, bagre: { ze: 5 } });
    const { melhores, piores } = montarSelecao(v, cfg());
    expect(melhores.some((s) => s?.jogadorId === "ze")).toBe(true);
    expect(piores.some((s) => s?.jogadorId === "ze")).toBe(true);
  });

  it("quem só tem voto de um lado aparece só nesse lado (caso Marivaldo)", () => {
    // Marivaldo só tem trait positivo relevante (Matador) — sem trait negativo
    // configurado, não entra nos piores.
    const v = votos({
      matador: { marivaldo: 4, outro: 1 },
      bagre: { ruim: 4 },
    });
    const { melhores, piores } = montarSelecao(v, cfg());
    const nas = (arr: typeof melhores) => arr.filter(Boolean).map((s) => s!.jogadorId);
    expect(nas(melhores)).toContain("marivaldo");
    expect(nas(piores)).not.toContain("marivaldo");
  });

  it("preenche os 5 piores quando há 5+ votados negativos, mesmo que vários também sejam melhores", () => {
    // Pote misto: a/b/c são bem votados (positivo forte) e ainda levam bagre;
    // d/e são só bagre. A exclusividade antiga esvaziava os piores (a/b/c iam
    // pros melhores). Na Opção B os 5 slots enchem.
    const v = votos({
      matador: { a: 6, b: 6, c: 6 },
      bagre: { a: 2, b: 2, c: 2, d: 5, e: 4 },
    });
    const { piores } = montarSelecao(v, cfg());
    expect(piores.filter(Boolean)).toHaveLength(5);
  });
});

describe("montarSelecao — goleiro único (Opção B)", () => {
  it("melhor Paredão E pior Frangueiro no mesmo jogador: fica só no gol de mais votos, fora do outro time", () => {
    // Vitor: 6 Paredão + 2 Frangueiro → é melhor goleiro (Paredão manda) e some
    // dos piores por inteiro. Ninguém é os dois goleiros ao mesmo tempo.
    const v = votos({
      paredao: { vitor: 6 },
      frangueiro: { vitor: 2 },
      bagre: { santiago: 5 },
    });
    const { melhores, piores } = montarSelecao(v, cfg({ gkMinVotos: 2 }));
    expect(melhores[4]?.jogadorId).toBe("vitor");
    expect(piores.some((s) => s?.jogadorId === "vitor")).toBe(false);
  });

  it("empate Paredão×Frangueiro no mesmo goleiro → vai pro gol dos PIORES", () => {
    const v = votos({ paredao: { ze: 3 }, frangueiro: { ze: 3 }, matador: { bom: 5 } });
    const { melhores, piores } = montarSelecao(v, cfg());
    expect(piores[4]?.jogadorId).toBe("ze");
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
