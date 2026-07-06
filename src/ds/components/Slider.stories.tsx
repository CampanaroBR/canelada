import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Slider } from "./Slider";

const meta: Meta<typeof Slider> = {
  title: "Forms/Slider",
  component: Slider,
  tags: ["!autodocs"],
  decorators: [(S) => <div style={{ width: 320 }}><S /></div>],
};
export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  render: () => {
    const [v, setV] = useState(60);
    return <Slider value={v} onChange={setV} label="Intensidade" showValue />;
  },
};

export const SemLabel: Story = {
  render: () => {
    const [v, setV] = useState(30);
    return <Slider value={v} onChange={setV} />;
  },
};

export const Disabled: Story = { args: { value: 50, label: "Bloqueado", showValue: true, disabled: true } };
