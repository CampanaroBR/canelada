import type { Meta, StoryObj } from "@storybook/react-vite";
import { Menu } from "./Menu";
import { Button } from "./Button";

const meta: Meta<typeof Menu> = { title: "Overlays/Menu", component: Menu, parameters: { layout: "centered" } };
export default meta;
type Story = StoryObj<typeof Menu>;

export const Acoes: Story = {
  render: () => (
    <Menu
      trigger={<Button variant="ghost" size="sm">Opções ▾</Button>}
      items={[
        { label: "Editar perfil", onClick: () => {} },
        { label: "Compartilhar card", onClick: () => {} },
        { label: "Remover do grupo", danger: true, onClick: () => {} },
      ]}
    />
  ),
};
