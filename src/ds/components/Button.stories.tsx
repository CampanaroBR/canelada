import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Core/Button",
  component: Button,
  tags: ["!autodocs"],
  args: { children: "Confirmar", variant: "primary", size: "md" },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary", "ghost", "danger"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: "secondary", children: "Cancelar" } };
export const Ghost: Story = { args: { variant: "ghost", children: "Ver mais" } };
export const Danger: Story = { args: { variant: "danger", children: "Excluir" } };
export const Loading: Story = { args: { loading: true, children: "Salvando" } };
export const FullWidth: Story = {
  args: { fullWidth: true, children: "Criar Rodada" },
  parameters: { layout: "padded" },
  decorators: [(S) => <div style={{ width: 360 }}><S /></div>],
};

export const Todos: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 280 }}>
      <Button variant="primary" fullWidth>Primary</Button>
      <Button variant="secondary" fullWidth>Secondary</Button>
      <Button variant="ghost" fullWidth>Ghost</Button>
      <Button variant="danger" fullWidth>Danger</Button>
    </div>
  ),
};
