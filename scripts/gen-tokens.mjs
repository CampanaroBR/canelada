// Gera tokens.css (CSS custom properties) e public/tokens.json (W3C DTCG)
// a partir de src/ds/tokens.color.json. Rode: node scripts/gen-tokens.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const src = JSON.parse(readFileSync(resolve(root, "src/ds/tokens.color.json"), "utf8"));

const isColorLeaf = (v) => typeof v === "string";

// Achata em pares [nome-kebab, valor], ignorando chaves $meta
function flatten(obj, path = []) {
  const out = [];
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith("$")) continue;
    const next = [...path, k];
    if (isColorLeaf(v)) out.push([next.join("-"), v]);
    else out.push(...flatten(v, next));
  }
  return out;
}

// W3C DTCG: cada folha vira { $value, $type }
function toDTCG(obj) {
  if (isColorLeaf(obj)) return { $value: obj, $type: "color" };
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith("$")) { out[k] = v; continue; }
    out[k] = toDTCG(v);
  }
  return out;
}

const pairs = flatten(src.color, ["color"]);
const css =
  "/* GERADO por scripts/gen-tokens.mjs — não edite à mão. Fonte: src/ds/tokens.color.json */\n" +
  ":root {\n" +
  pairs.map(([name, val]) => `  --${name}: ${val};`).join("\n") +
  "\n}\n";
writeFileSync(resolve(root, "src/ds/tokens.css"), css);

const dtcg = { color: toDTCG(src.color) };
writeFileSync(resolve(root, "public/tokens.json"), JSON.stringify(dtcg, null, 2) + "\n");

console.log(`✓ ${pairs.length} tokens → src/ds/tokens.css + public/tokens.json`);
