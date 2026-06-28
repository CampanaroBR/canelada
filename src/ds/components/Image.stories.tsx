import type { Meta, StoryObj } from "@storybook/react-vite";
import { Image } from "./Image";

const meta: Meta<typeof Image> = {
  title: "Core/Image",
  component: Image,
  decorators: [(S) => <div style={{ width: 200 }}><S /></div>],
};
export default meta;
type Story = StoryObj<typeof Image>;

export const Quadrada: Story = { args: { ratio: "1/1", fallback: "foto" } };
export const Wide: Story = { args: { ratio: "16/9", fallback: "capa" } };
export const Fallback: Story = { args: { src: "url-quebrada.png", fallback: "sem imagem" } };
