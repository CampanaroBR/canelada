import type { Meta, StoryObj } from "@storybook/react-vite";
import { Plus, CaretRight, SoccerBall, ShareNetwork, Trash, Export } from "@phosphor-icons/react";
import { Button, IconButton } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Core/Button",
  component: Button,
  tags: ["!autodocs"],
  args: { children: "Confirmar", variant: "primary", size: "md" },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary", "ghost", "danger", "link"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {};

export const Variantes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 280 }}>
      <Button variant="primary" fullWidth>Primary</Button>
      <Button variant="secondary" fullWidth>Secondary</Button>
      <Button variant="ghost" fullWidth>Ghost</Button>
      <Button variant="danger" fullWidth>Danger</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};
export const Todos = Variantes;

export const Tamanhos: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

export const ComIcones: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 280 }}>
      <Button leftIcon={<SoccerBall size={18} weight="regular" />}>Criar Rodada</Button>
      <Button variant="secondary" rightIcon={<CaretRight size={16} weight="bold" />}>Ver mais</Button>
      <Button variant="ghost" leftIcon={<ShareNetwork size={18} weight="regular" />} rightIcon={<CaretRight size={16} weight="bold" />}>Compartilhar</Button>
    </div>
  ),
};

export const Loading: Story = { args: { loading: true, children: "Salvando" } };

export const FullWidth: Story = {
  args: { fullWidth: true, leftIcon: <Plus size={18} weight="bold" />, children: "Criar Rodada" },
  parameters: { layout: "padded" },
  decorators: [(S) => <div style={{ width: 360 }}><S /></div>],
};

export const IconButtons: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <IconButton aria-label="Compartilhar" variant="ghost"><Export size={20} weight="regular" /></IconButton>
      <IconButton aria-label="Adicionar" variant="primary"><Plus size={20} weight="bold" /></IconButton>
      <IconButton aria-label="Remover" variant="danger"><Trash size={20} weight="regular" /></IconButton>
      <IconButton aria-label="Compartilhar grande" variant="ghost" size="lg"><Export size={22} weight="regular" /></IconButton>
    </div>
  ),
};
