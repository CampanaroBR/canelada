import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/ds/**/*.stories.@(ts|tsx)", "../src/ds/**/*.mdx"],
  staticDirs: ["../public"],
  addons: ["@storybook/addon-docs"],
  framework: { name: "@storybook/react-vite", options: {} },
};

export default config;
