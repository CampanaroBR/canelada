import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/ds/**/*.stories.@(ts|tsx)", "../src/ds/**/*.mdx"],
  staticDirs: ["../public"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: { name: "@storybook/react-vite", options: {} },
  // base relativa para servir o Storybook num subpath (GitHub Pages /canelada/)
  viteFinal: async (cfg) => {
    cfg.base = "./";
    return cfg;
  },
};

export default config;
