/**
 * Resolve um caminho de /public para a origem certa no Storybook — funciona tanto
 * local (raiz) quanto publicado no GitHub Pages (subpath /canelada/). Caminhos
 * absolutos ("/logo.png") quebram sob o subpath; isso resolve relativo ao HTML atual.
 */
export function asset(path: string): string {
  // Vite injeta import.meta.env.BASE_URL; Next (que também roda tsc neste repo) não
  // conhece esse tipo, daí o cast — só existe em runtime Storybook/Vite.
  const base: string = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? "/";
  const clean = path.replace(/^\/+/, "");
  return base.endsWith("/") ? `${base}${clean}` : `${base}/${clean}`;
}
