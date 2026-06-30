import React from "react";
import type { Preview } from "@storybook/react-vite";
import { themes } from "storybook/theming";

const preview: Preview = {
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    controls: { expanded: true },
    backgrounds: { disable: true },
    docs: {
      // Docs em tema escuro — os componentes são dark-first; fundo claro quebrava o contraste (WCAG).
      theme: themes.dark,
    },
    options: {
      storySort: {
        order: [
          "Introdução",
          "Foundations", ["Overview", "Marca", "Acessibilidade", "Movimento", "Iconografia", "Números (comparação)"],
          "Core",
          "Forms",
          "Feedback",
          "Overlays",
          "Data",
          "Patterns",
        ],
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ background: "#090909", color: "#fff", padding: 24, borderRadius: 12 }}>
        <Story />
      </div>
    ),
  ],
};

export default preview;
