import type { StorybookConfig } from "@storybook/react-vite";
import { fileURLToPath } from "node:url";

const config: StorybookConfig = {
  stories: ["../src/ds/**/*.stories.@(ts|tsx)", "../src/ds/**/*.mdx"],
  staticDirs: ["../public"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: { name: "@storybook/react-vite", options: {} },
  // base relativa para servir o Storybook num subpath (GitHub Pages /canelada/)
  viteFinal: async (cfg) => {
    cfg.base = "./";
    // resolve o alias "@/..." igual ao app (senão stories que tocam telas quebram)
    cfg.resolve = cfg.resolve ?? {};
    cfg.resolve.alias = {
      ...(cfg.resolve.alias ?? {}),
      "@": fileURLToPath(new URL("../src", import.meta.url)),
    };
    return cfg;
  },
};

export default config;
