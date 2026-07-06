import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

// Tema de marca do Storybook — cores extraídas direto de src/ds/tokens.ts
// (primitives.brand[300]/neutral[*]), nunca inventadas.
const theme = create({
  base: "dark",
  brandTitle: "🐟 Bagre Design System",
  brandUrl: "https://campanarobr.github.io/canelada/",
  brandTarget: "_self",

  colorPrimary: "#9fe870", // primitives.brand[300]
  colorSecondary: "#9fe870",

  appBg: "#090909", // primitives.neutral[1000]
  appContentBg: "#0a0e0e", // primitives.neutral[950]
  appPreviewBg: "#090909",
  appBorderColor: "#2c2c2c", // primitives.neutral[600]
  appBorderRadius: 12,

  textColor: "#ffffff",
  textInverseColor: "#090909",
  textMutedColor: "#999999", // primitives.neutral[300]

  barBg: "#0a0e0e",
  barTextColor: "#999999",
  barSelectedColor: "#9fe870",
  barHoverColor: "#9fe870",

  inputBg: "#171717", // primitives.neutral[850]
  inputBorder: "#2c2c2c",
  inputTextColor: "#ffffff",
  inputBorderRadius: 8,

  fontBase: '"Google Sans", system-ui, sans-serif',
  fontCode: '"SF Mono", Menlo, monospace',
});

addons.setConfig({
  theme,
  sidebar: { showRoots: true },
});
