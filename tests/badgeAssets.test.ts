import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { TRAIT_BADGE } from "@/lib/badgeAssets";

// O deploy roda em Linux (case-sensitive): referência com caixa errada quebra
// silenciosamente em produção mesmo funcionando no macOS. Este teste trava isso.
describe("TRAIT_BADGE", () => {
  it("todos os arquivos mapeados existem em public/ (case-sensitive)", () => {
    for (const [slug, path] of Object.entries(TRAIT_BADGE)) {
      const abs = join(process.cwd(), "public", path);
      expect(existsSync(abs), `${slug} → ${path} não existe em public/`).toBe(true);
    }
  });

  it("caminhos são lowercase (padrão do repositório)", () => {
    for (const path of Object.values(TRAIT_BADGE)) {
      expect(path).toBe(path.toLowerCase());
    }
  });
});
