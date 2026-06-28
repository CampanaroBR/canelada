import type { Preview } from "@storybook/react-vite";

const preview: Preview = {
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    controls: { expanded: true },
    backgrounds: {
      default: "Canelada",
      values: [
        { name: "Canelada", value: "#090909" },
        { name: "Surface", value: "#0a0e0e" },
      ],
    },
    options: {
      storySort: {
        order: [
          "Introdução",
          "Foundations", ["Overview", "Iconografia", "Números (comparação)"],
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
};

export default preview;
