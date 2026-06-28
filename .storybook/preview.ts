import type { Preview } from "@storybook/react-vite";

const preview: Preview = {
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
  },
};

export default preview;
